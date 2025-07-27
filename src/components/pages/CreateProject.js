import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { storage } from '../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { createApiCall } from './createsteps helpers/CreateStepsUtils';
import { AnimatedLogo } from './createsteps helpers/CommonComponents';
import { googleCloudApi } from '../../services/googleCloudApi';

const MAX_FILENAME_STEM_LENGTH = 25; 

const PREDEFINED_TAGS = [
    "Woodworking", "DIY", "Electronics", "Crafts", "Home Improvement", 
    "Gardening", "Cooking", "Software", "Art", "Science"
];

const CreateProjectPage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [selectedTags, setSelectedTags] = useState([]); // Array to store selected tag strings
    const [videoFiles, setVideoFiles] = useState([]); // Array of File objects
    const [selectedVideoNames, setSelectedVideoNames] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // AI Video Breakdown states
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [aiProgress, setAiProgress] = useState('');
    const [aiBreakdownData, setAiBreakdownData] = useState(null);

    // Snippet for the updated handleVideoChange function
// in src/pages/ProjectStepsPage.js

    const handleVideoChange = (e) => {
        const originalFiles = Array.from(e.target.files);
        let processedFiles = []; // To store original or new File objects with potentially truncated names
        let processedFileNamesForDisplay = [];

        if (originalFiles.some(file => !file.type.startsWith('video/'))) {
            setErrorMessage("Invalid file type. Please upload video files only.");
            if (e.target) e.target.value = null;
            return;
        }
        setErrorMessage('');

        for (const originalFile of originalFiles) {
            const originalName = originalFile.name;
            let newFileName = originalName; // Assume original name initially

            const lastDotIndex = originalName.lastIndexOf('.');
            const hasExtension = lastDotIndex !== -1;
            const stem = hasExtension ? originalName.substring(0, lastDotIndex) : originalName;
            const extension = hasExtension ? originalName.substring(lastDotIndex) : ""; // e.g., ".mp4" or ""

            if (stem.length > MAX_FILENAME_STEM_LENGTH) {
                const truncatedStem = stem.substring(0, MAX_FILENAME_STEM_LENGTH);
                newFileName = truncatedStem + extension;
            }

            if (newFileName !== originalName) {
                // Create a new File object with the truncated name
                try {
                    const newFile = new File([originalFile], newFileName, {
                        type: originalFile.type,
                        lastModified: originalFile.lastModified,
                    });
                    processedFiles.push(newFile);
                    processedFileNamesForDisplay.push(newFileName);
                } catch (error) {
                    console.error("Error creating new File object:", error);
                    // Fallback to original file if new File creation fails (e.g., browser compatibility)
                    processedFiles.push(originalFile);
                    processedFileNamesForDisplay.push(originalName); // Or the truncated name logic for display only
                }
            } else {
                // If no truncation was needed, use the original file and its name
                processedFiles.push(originalFile);
                processedFileNamesForDisplay.push(originalName);
            }
        }

        setVideoFiles(prevFiles => [...prevFiles, ...processedFiles]);
        setSelectedVideoNames(prevNames => [...prevNames, ...processedFileNamesForDisplay]);
        
        if (e.target) {
            e.target.value = null; // Reset file input
        }
    };

    const removeVideo = (indexToRemove) => {
        setVideoFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
        setSelectedVideoNames(prevNames => prevNames.filter((_, index) => index !== indexToRemove));
    };

    const toggleTag = (tag) => {
        setSelectedTags(prevTags =>
            prevTags.includes(tag)
                ? prevTags.filter(t => t !== tag)
                : [...prevTags, tag]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!currentUser) {
            setErrorMessage("You must be logged in to create a project.");
            return;
        }
        if (!projectName.trim()) {
            setErrorMessage("Project name is required.");
            return;
        }
        if (videoFiles.length === 0) {
            setErrorMessage("Please upload at least one video for the project.");
            return;
        }

        setIsLoading(true);

        const uploadedVideoUrls = [];
        try {
            for (const file of videoFiles) {
                const videoFileName = `${file.name}_${uuidv4()}`;
                const videoStoragePath = `users/${currentUser.uid}/videos/${videoFileName}`;
                const videoStorageRef = ref(storage, videoStoragePath);
                const snapshot = await uploadBytes(videoStorageRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);
                uploadedVideoUrls.push({ name: file.name, url: downloadURL, path: videoStoragePath });
            }
        } catch (uploadError) {
            console.error("Error uploading videos to Firebase Storage:", uploadError);
            setErrorMessage(`Failed to upload videos: ${uploadError.message}`);
            setIsLoading(false);
            return;
        }
        console.log("Uploaded video URLs/paths:", uploadedVideoUrls);

        const projectDataForBackend = {
            name: projectName,
            description: projectDescription,
            tags: selectedTags,
            firebase_uid: currentUser.uid,
            UploadVideos: uploadedVideoUrls,
            frame_url: uploadedVideoUrls.length > 0 ? uploadedVideoUrls[0].url : null  // Set first video as frame_url for thumbnail
        };

        try {
            const token = currentUser.uid;
            const responseData = await createApiCall('/projects/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(projectDataForBackend),
            });

            const createdProjectId = responseData.project_id; // Assuming backend returns project_id
            setSuccessMessage(`Project "${projectName}" created successfully! Preparing next step...`);
            console.log('Project created in backend:', responseData);
            navigate(`/annotate`, { 
                state: { 
                    projectName: projectName,
                    projectId: createdProjectId,
                    uploadedVideos: uploadedVideoUrls,
                } 
            });

        } catch (error) {
            console.error('Project creation error:', error);
            setErrorMessage(error.message || "An unexpected error occurred while creating the project.");
        } finally {
            setIsLoading(false);
        }
    };

    // AI Video Breakdown Function
    const handleAiVideoBreakdown = async () => {
        if (videoFiles.length === 0) {
            setErrorMessage("Please upload at least one video for AI analysis.");
            return;
        }

        setIsAiProcessing(true);
        setAiProgress('Starting AI video breakdown...');
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const projectContext = {
                project_name: projectName,
                project_description: projectDescription,
                tags: selectedTags,
            };

            const breakdownResults = await googleCloudApi.processVideoBreakdown(videoFiles, projectContext, setAiProgress);
            setAiBreakdownData(breakdownResults);
            setSuccessMessage('AI video breakdown completed successfully! You can now review and edit the generated steps.');
            setAiProgress('');

        } catch (error) {
            console.error('AI video breakdown error:', error);
            setErrorMessage(`AI processing failed: ${error.message}`);
            setAiProgress('');
        } finally {
            setIsAiProcessing(false);
        }
    };

    const handleSubmitWithAiData = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!currentUser) {
            setErrorMessage("You must be logged in to create a project.");
            return;
        }
        if (!projectName.trim()) {
            setErrorMessage("Project name is required.");
            return;
        }
        if (videoFiles.length === 0) {
            setErrorMessage("Please upload at least one video for the project.");
            return;
        }

        setIsLoading(true);

        const uploadedVideoUrls = [];
        try {
            for (const file of videoFiles) {
                const videoFileName = `${file.name}_${uuidv4()}`;
                const videoStoragePath = `users/${currentUser.uid}/videos/${videoFileName}`;
                const videoStorageRef = ref(storage, videoStoragePath);
                const snapshot = await uploadBytes(videoStorageRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);
                uploadedVideoUrls.push({ name: file.name, url: downloadURL, path: videoStoragePath });
            }
        } catch (uploadError) {
            console.error("Error uploading videos to Firebase Storage:", uploadError);
            setErrorMessage(`Failed to upload videos: ${uploadError.message}`);
            setIsLoading(false);
            return;
        }

        const projectDataForBackend = {
            name: projectName,
            description: projectDescription,
            tags: selectedTags,
            firebase_uid: currentUser.uid,
            UploadVideos: uploadedVideoUrls,
            frame_url: uploadedVideoUrls.length > 0 ? uploadedVideoUrls[0].url : null,
            ai_breakdown_data: aiBreakdownData, // Include AI breakdown data
        };

        try {
            const token = currentUser.uid;
            const responseData = await createApiCall('/projects/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(projectDataForBackend),
            });

            const createdProjectId = responseData.project_id;
            setSuccessMessage(`Project "${projectName}" created successfully! Preparing next step...`);
            console.log('Project created in backend:', responseData);
            navigate(`/annotate`, { 
                state: { 
                    projectName: projectName,
                    projectId: createdProjectId,
                    uploadedVideos: uploadedVideoUrls,
                    aiBreakdownData: aiBreakdownData, // Pass AI data to annotation page
                } 
            });

        } catch (error) {
            console.error('Project creation error:', error);
            setErrorMessage(error.message || "An unexpected error occurred while creating the project.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 md:p-8 bg-black shadow-xl rounded-lg mt-10 border border-[#D9D9D9]">
            <h1 className="text-3xl font-bold text-[#F1C232] mb-8 text-center">Create New Project</h1>

            {isLoading && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 200,
                    gap: 16,
                }}>
                    <AnimatedLogo size={80} />
                    <div style={{ marginTop: 16, fontSize: 20, fontWeight: 600, color: '#D9D9D9', letterSpacing: 1 }}>
                        Saving Project...
                    </div>
                </div>
            )}
            {!isLoading && (
            <form onSubmit={aiBreakdownData ? handleSubmitWithAiData : handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="projectName" className="block text-sm font-medium text-[#D9D9D9] mb-1">
                        Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="projectName"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                        className="w-full px-4 py-2 text-[#D9D9D9] bg-black border border-[#D9D9D9] rounded-lg focus:ring-[#0000FF] focus:border-[#0000FF] transition duration-150 ease-in-out"
                        placeholder="e.g., Assembling a Bookshelf"
                    />
                </div>

                <div>
                    <label htmlFor="projectDescription" className="block text-sm font-medium text-[#D9D9D9] mb-1">
                        Description
                    </label>
                    <textarea
                        id="projectDescription"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        rows="4"
                        className="w-full px-4 py-2 text-[#D9D9D9] bg-black border border-[#D9D9D9] rounded-lg focus:ring-[#0000FF] focus:border-[#0000FF] transition duration-150 ease-in-out"
                        placeholder="Briefly describe your project..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#D9D9D9] mb-1">
                        Tags (Select one or more)
                    </label>
                    <div className="flex flex-wrap gap-2 p-2 border border-[#D9D9D9] rounded-lg bg-black">
                        {PREDEFINED_TAGS.map((tag) => (
                            <button
                                type="button"
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-150 ease-in-out
                                            ${selectedTags.includes(tag) 
                                                ? 'bg-[#0000FF] text-[#D9D9D9]' 
                                                : 'bg-[#222222] text-[#D9D9D9] hover:bg-[#0000FF] hover:text-[#D9D9D9]'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    {selectedTags.length > 0 && (
                        <p className="text-xs text-[#D9D9D9] mt-1">Selected: {selectedTags.join(', ')}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#D9D9D9] mb-1">
                        Upload Project Videos <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleVideoChange}
                        className="w-full text-sm text-[#D9D9D9] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#0000FF] file:text-[#D9D9D9] hover:file:bg-[#0000FF] transition duration-150 ease-in-out"
                    />
                    {selectedVideoNames.length > 0 && (
                        <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium text-[#D9D9D9]">Selected videos:</p>
                            <ul className="list-disc list-inside pl-1 space-y-1">
                                {selectedVideoNames.map((name, index) => (
                                    <li key={index} className="text-sm text-[#D9D9D9] flex justify-between items-center">
                                        <span>{name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeVideo(index)}
                                            className="ml-2 text-[#0000FF] hover:text-[#0000FF] text-xs font-semibold"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* AI Video Breakdown Section */}
                {videoFiles.length > 0 && (
                    <div className="border-t border-gray-700 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[#F1C232]">AI Video Analysis</h3>
                            <button
                                type="button"
                                onClick={handleAiVideoBreakdown}
                                disabled={isAiProcessing || aiBreakdownData}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ease-in-out ${
                                    isAiProcessing || aiBreakdownData
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#0000FF] text-[#D9D9D9] hover:bg-[#0000FF]/80'
                                }`}
                            >
                                {isAiProcessing ? 'Processing...' : aiBreakdownData ? 'Analysis Complete' : 'Analyze with AI'}
                            </button>
                        </div>
                        
                        {isAiProcessing && (
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F1C232]"></div>
                                    <span className="text-[#D9D9D9]">{aiProgress}</span>
                                </div>
                            </div>
                        )}

                        {aiBreakdownData && (
                            <div className="bg-green-900/20 border border-green-700 p-4 rounded-lg">
                                <h4 className="text-green-400 font-semibold mb-2">AI Analysis Results</h4>
                                <div className="space-y-2 text-sm text-[#D9D9D9]">
                                    {aiBreakdownData.map((result, index) => (
                                        <div key={index} className="border-l-2 border-green-500 pl-3">
                                            <p className="font-medium">{result.videoName}</p>
                                            <p>Steps detected: {result.steps?.length || 0}</p>
                                            <p>Materials found: {result.materials?.length || 0}</p>
                                            <p>Tools identified: {result.tools?.length || 0}</p>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAiBreakdownData(null)}
                                    className="mt-3 text-sm text-red-400 hover:text-red-300"
                                >
                                    Clear AI Analysis
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {errorMessage && (
                    <div role="alert" className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-md text-sm">
                        {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div role="alert" className="p-3 bg-green-900 border border-green-700 text-green-200 rounded-md text-sm">
                        {successMessage}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full px-6 py-3 text-black font-semibold rounded-lg transition duration-150 ease-in-out
                                ${isLoading ? 'bg-[#222222] cursor-not-allowed text-[#D9D9D9]' : 'bg-[#F1C232] hover:bg-[#0000FF] hover:text-[#D9D9D9] focus:outline-none focus:ring-2 focus:ring-[#F1C232] focus:ring-opacity-50'}`}
                >
                    {isLoading ? 'Saving Project...' : aiBreakdownData ? 'Save with AI Data & Continue' : 'Save and Continue to Annotate'}
                </button>
            </form>
            )}
        </div>
    );
};

export default CreateProjectPage;