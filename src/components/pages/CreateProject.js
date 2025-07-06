import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { storage } from '../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { getApiUrl, createApiCall } from './createsteps helpers/CreateStepsUtils';

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
            UploadVideos: uploadedVideoUrls
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

    return (
        <div className="max-w-2xl mx-auto p-6 md:p-8 bg-white shadow-xl rounded-lg mt-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Create New Project</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="projectName"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                        className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                        placeholder="e.g., Assembling a Bookshelf"
                    />
                </div>

                <div>
                    <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="projectDescription"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        rows="4"
                        className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                        placeholder="Briefly describe your project..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (Select one or more)
                    </label>
                    <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg bg-gray-50">
                        {PREDEFINED_TAGS.map((tag) => (
                            <button
                                type="button"
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors duration-150 ease-in-out
                                            ${selectedTags.includes(tag) 
                                                ? 'bg-indigo-600 text-white' 
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    {selectedTags.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">Selected: {selectedTags.join(', ')}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Project Videos <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleVideoChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {selectedVideoNames.length > 0 && (
                        <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium text-gray-700">Selected videos:</p>
                            <ul className="list-disc list-inside pl-1 space-y-1">
                                {selectedVideoNames.map((name, index) => (
                                    <li key={index} className="text-sm text-gray-600 flex justify-between items-center">
                                        <span>{name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeVideo(index)}
                                            className="ml-2 text-red-500 hover:text-red-700 text-xs font-semibold"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {errorMessage && (
                    <div role="alert" className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
                        {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div role="alert" className="p-3 bg-green-50 border border-green-300 text-green-700 rounded-md text-sm">
                        {successMessage}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full px-6 py-3 text-white font-semibold rounded-lg transition duration-150 ease-in-out
                                ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50'}`}
                >
                    {isLoading ? 'Saving Project...' : 'Save and Continue to Annotate'}
                </button>
            </form>
        </div>
    );
};

export default CreateProjectPage;