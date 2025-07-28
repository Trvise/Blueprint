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
    const [selectedTags, setSelectedTags] = useState([]);
    const [videoFiles, setVideoFiles] = useState([]);
    const [selectedVideoNames, setSelectedVideoNames] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // AI Video Breakdown states
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [aiProgress, setAiProgress] = useState('');
    const [aiBreakdownData, setAiBreakdownData] = useState(null);
    const [aiEnabled, setAiEnabled] = useState(true);
    
    // Progress tracking states
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [currentStep, setCurrentStep] = useState('');
    const [expectedTime, setExpectedTime] = useState('');
    const [startTime, setStartTime] = useState(null);

    // Add CSS for toggle switch
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .toggle {
                appearance: none;
                width: 3rem;
                height: 1.5rem;
                background-color: #374151;
                border-radius: 1rem;
                position: relative;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            
            .toggle:checked {
                background-color: #F1C232;
            }
            
            .toggle::before {
                content: '';
                position: absolute;
                width: 1.25rem;
                height: 1.25rem;
                border-radius: 50%;
                background-color: white;
                top: 0.125rem;
                left: 0.125rem;
                transition: transform 0.3s ease;
            }
            
            .toggle:checked::before {
                transform: translateX(1.5rem);
            }
            
            .toggle:focus {
                outline: 2px solid #0000FF;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const handleVideoChange = (e) => {
        const originalFiles = Array.from(e.target.files);
        let processedFiles = [];
        let processedFileNamesForDisplay = [];

        if (originalFiles.some(file => !file.type.startsWith('video/'))) {
            setErrorMessage("Invalid file type. Please upload video files only.");
            if (e.target) e.target.value = null;
            return;
        }

        originalFiles.forEach(file => {
            const originalName = file.name;
            const nameWithoutExtension = originalName.substring(0, originalName.lastIndexOf('.'));
            const extension = originalName.substring(originalName.lastIndexOf('.'));
            
            let processedName = nameWithoutExtension;
            if (nameWithoutExtension.length > MAX_FILENAME_STEM_LENGTH) {
                processedName = nameWithoutExtension.substring(0, MAX_FILENAME_STEM_LENGTH);
            }
            
            const finalName = processedName + extension;
            processedFileNamesForDisplay.push(finalName);
            processedFiles.push(file);
        });

        setVideoFiles(processedFiles);
        setSelectedVideoNames(processedFileNamesForDisplay);
        setErrorMessage('');
    };

    const removeVideo = (indexToRemove) => {
        setVideoFiles(videoFiles.filter((_, index) => index !== indexToRemove));
        setSelectedVideoNames(selectedVideoNames.filter((_, index) => index !== indexToRemove));
    };

    const toggleTag = (tag) => {
        setSelectedTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    // Progress tracking function
    const updateProgress = (step, percentage, message) => {
        setCurrentStep(step);
        setProgressPercentage(percentage);
        setAiProgress(message);
        
        // Calculate expected time based on current progress
        if (startTime && percentage > 0) {
            const elapsed = Date.now() - startTime;
            const totalEstimated = (elapsed / percentage) * 100;
            const remaining = totalEstimated - elapsed;
            const remainingMinutes = Math.ceil(remaining / 60000);
            setExpectedTime(`${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`);
        }
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
        setStartTime(Date.now());
        setProgressPercentage(0);
        setCurrentStep('Starting project creation...');

        // If AI is enabled, process videos with AI first
        let finalAiBreakdownData = aiBreakdownData;
        if (aiEnabled && videoFiles.length > 0 && !aiBreakdownData) {
            try {
                setIsAiProcessing(true);
                updateProgress('AI Analysis', 10, 'Starting AI video breakdown...');
                
                const projectContext = {
                    project_name: projectName,
                    project_description: projectDescription,
                    tags: selectedTags,
                };

                // Custom progress callback for AI processing
                const aiProgressCallback = (message) => {
                    if (message.includes('Extracting audio')) {
                        updateProgress('Audio Extraction', 20, message);
                    } else if (message.includes('Transcribing')) {
                        updateProgress('Transcription', 40, message);
                    } else if (message.includes('Analyzing')) {
                        updateProgress('AI Analysis', 60, message);
                    } else {
                        updateProgress('AI Processing', 50, message);
                    }
                };

                const breakdownResults = await googleCloudApi.processVideoBreakdown(videoFiles, projectContext, aiProgressCallback);
                finalAiBreakdownData = breakdownResults;
                setAiBreakdownData(breakdownResults);
                updateProgress('AI Complete', 70, 'AI video breakdown completed successfully!');
                setAiProgress('');
            } catch (error) {
                console.error('AI video breakdown error:', error);
                setErrorMessage(`AI processing failed: ${error.message}`);
                setAiProgress('');
                setIsLoading(false);
                return;
            } finally {
                setIsAiProcessing(false);
            }
        }

        updateProgress('Uploading Videos', 80, 'Uploading videos to cloud storage...');
        const uploadedVideoUrls = [];
        try {
            for (let i = 0; i < videoFiles.length; i++) {
                const file = videoFiles[i];
                updateProgress('Uploading Videos', 80 + (i * 5), `Uploading ${file.name} (${i + 1}/${videoFiles.length})...`);
                
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

        updateProgress('Creating Project', 95, 'Creating project in database...');
        const projectDataForBackend = {
            name: projectName,
            description: projectDescription,
            tags: selectedTags,
            firebase_uid: currentUser.uid,
            UploadVideos: uploadedVideoUrls,
            frame_url: uploadedVideoUrls.length > 0 ? uploadedVideoUrls[0].url : null,
            ai_breakdown_data: finalAiBreakdownData,
        };

        try {
            const token = currentUser.uid;
            updateProgress('Finalizing', 98, 'Saving project to database...');
            const responseData = await createApiCall('/projects/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(projectDataForBackend),
            });

            const createdProjectId = responseData.project_id;
            updateProgress('Complete', 100, 'Project created successfully! Redirecting...');
            setSuccessMessage(`Project "${projectName}" created successfully! Preparing next step...`);
            console.log('Project created in backend:', responseData);
            
            // Small delay to show completion
            setTimeout(() => {
                navigate(`/annotate`, { 
                    state: { 
                        projectName: projectName,
                        projectId: createdProjectId,
                        uploadedVideos: uploadedVideoUrls,
                        aiBreakdownData: finalAiBreakdownData,
                    } 
                });
            }, 1000);

        } catch (error) {
            console.error('Project creation error:', error);
            setErrorMessage(error.message || "An unexpected error occurred while creating the project.");
        } finally {
            setIsLoading(false);
            setProgressPercentage(0);
            setCurrentStep('');
            setExpectedTime('');
            setStartTime(null);
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
        setStartTime(Date.now());
        setProgressPercentage(0);
        setCurrentStep('Starting project creation with AI data...');

        updateProgress('Uploading Videos', 80, 'Uploading videos to cloud storage...');
        const uploadedVideoUrls = [];
        try {
            for (let i = 0; i < videoFiles.length; i++) {
                const file = videoFiles[i];
                updateProgress('Uploading Videos', 80 + (i * 5), `Uploading ${file.name} (${i + 1}/${videoFiles.length})...`);
                
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

        updateProgress('Creating Project', 95, 'Creating project in database...');
        const projectDataForBackend = {
            name: projectName,
            description: projectDescription,
            tags: selectedTags,
            firebase_uid: currentUser.uid,
            UploadVideos: uploadedVideoUrls,
            frame_url: uploadedVideoUrls.length > 0 ? uploadedVideoUrls[0].url : null,
            ai_breakdown_data: aiBreakdownData,
        };

        try {
            const token = currentUser.uid;
            updateProgress('Finalizing', 98, 'Saving project to database...');
            const responseData = await createApiCall('/projects/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(projectDataForBackend),
            });

            const createdProjectId = responseData.project_id;
            updateProgress('Complete', 100, 'Project created successfully! Redirecting...');
            setSuccessMessage(`Project "${projectName}" created successfully! Preparing next step...`);
            console.log('Project created in backend:', responseData);
            
            // Small delay to show completion
            setTimeout(() => {
                navigate(`/annotate`, { 
                    state: { 
                        projectName: projectName,
                        projectId: createdProjectId,
                        uploadedVideos: uploadedVideoUrls,
                        aiBreakdownData: aiBreakdownData,
                    } 
                });
            }, 1000);

        } catch (error) {
            console.error('Project creation error:', error);
            setErrorMessage(error.message || "An unexpected error occurred while creating the project.");
        } finally {
            setIsLoading(false);
            setProgressPercentage(0);
            setCurrentStep('');
            setExpectedTime('');
            setStartTime(null);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 md:p-8 bg-black shadow-xl rounded-lg mt-10 border border-[#D9D9D9]">
            <h1 className="text-3xl font-bold text-[#F1C232] mb-8 text-center">Create New Project</h1>

            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full mx-4">
                        <div className="flex flex-col items-center space-y-4">
                            <AnimatedLogo size={80} />
                            <h3 className="text-xl font-semibold text-[#F1C232]">Creating Project</h3>
                            
                            {/* Progress Bar */}
                            <div className="w-full">
                                <div className="flex justify-between text-sm text-[#D9D9D9] mb-2">
                                    <span>{currentStep}</span>
                                    <span>{progressPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-3">
                                    <div 
                                        className="bg-gradient-to-r from-[#0000FF] to-[#F1C232] h-3 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                                
                                {/* Status Message */}
                                {aiProgress && (
                                    <div className="text-sm text-[#D9D9D9] mt-2 text-center">
                                        {aiProgress}
                                    </div>
                                )}
                                
                                {/* Expected Time */}
                                {expectedTime && (
                                    <div className="text-xs text-[#6b7280] mt-1">
                                        Expected time remaining: {expectedTime}
                                    </div>
                                )}
                            </div>
                        </div>
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
                    <div className="border-t border-gray-700 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[#F1C232]">AI Video Analysis</h3>
                            <div className="flex items-center space-x-2">
                                <label htmlFor="aiEnabled" className="text-sm text-[#D9D9D9]">AI Enabled</label>
                                <input
                                    type="checkbox"
                                    id="aiEnabled"
                                    checked={aiEnabled}
                                    onChange={(e) => setAiEnabled(e.target.checked)}
                                    className="toggle"
                                />
                            </div>
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