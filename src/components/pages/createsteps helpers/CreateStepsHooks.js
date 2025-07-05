// CreateStepsHooks.js - Custom hooks and state management for CreateSteps component
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { storage } from '../../../firebase/firebase';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';

export const useCreateStepsState = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const projectId = location.state?.projectId;
    
    // Tab and UI state
    const [activeTab, setActiveTab] = useState('details');
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
    
    // Project state
    const [projectName, setProjectName] = useState('');
    const [uploadedVideos, setUploadedVideos] = useState([]); 
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const [activeVideoUrl, setActiveVideoUrl] = useState('');
    const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
    
    // Current step state
    const [currentStepName, setCurrentStepName] = useState('');
    const [currentStepDescription, setCurrentStepDescription] = useState('');
    const [currentStepStartTime, setCurrentStepStartTime] = useState(null);
    const [currentStepEndTime, setCurrentStepEndTime] = useState(null);
    const [currentCautionaryNotes, setCurrentCautionaryNotes] = useState('');
    const [currentBestPracticeNotes, setCurrentBestPracticeNotes] = useState('');
    
    // Annotation state
    const [frameForAnnotation, setFrameForAnnotation] = useState(null); 
    const [frameTimestampMs, setFrameTimestampMs] = useState(null); 
    const [currentStepAnnotations, setCurrentStepAnnotations] = useState([]); 
    const [currentAnnotationTool, setCurrentAnnotationTool] = useState({});
    
    // Tools state
    const [currentStepTools, setCurrentStepTools] = useState([]); 
    const [currentStepToolName, setCurrentStepToolName] = useState('');
    const [currentStepToolSpec, setCurrentStepToolSpec] = useState('');
    const [currentStepToolImageFile, setCurrentStepToolImageFile] = useState(null); 
    
    // Materials state
    const [currentStepMaterials, setCurrentStepMaterials] = useState([]);
    const [currentStepMaterialName, setCurrentStepMaterialName] = useState('');
    const [currentStepMaterialSpec, setCurrentStepMaterialSpec] = useState('');
    const [currentStepMaterialImageFile, setCurrentStepMaterialImageFile] = useState(null);
    
    // Files state
    const [currentStepSupFiles, setCurrentStepSupFiles] = useState([]); 
    const [currentStepSupFileName, setCurrentStepSupFileName] = useState(''); 
    
    // Validation state
    const [currentStepValidationQuestion, setCurrentStepValidationQuestion] = useState('');
    const [currentStepValidationAnswer, setCurrentStepValidationAnswer] = useState(''); 
    const [currentStepResultImageFile, setCurrentStepResultImageFile] = useState(null);
    
    // Buy list state
    const [projectBuyList, setProjectBuyList] = useState([]); 
    const [buyListItemName, setBuyListItemName] = useState('');
    const [buyListItemQty, setBuyListItemQty] = useState(1);
    const [buyListItemSpec, setBuyListItemSpec] = useState('');
    const [buyListItemLink, setBuyListItemLink] = useState('');
    const [buyListItemImageFile, setBuyListItemImageFile] = useState(null); 
    
    // Project steps and loading state
    const [projectSteps, setProjectSteps] = useState([]);
    const [isLoading, setIsLoading] = useState(false); 
    const [isStepLoading, setIsStepLoading] = useState(false); 
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Add missing state for captured annotation frames
    const [capturedAnnotationFrames, setCapturedAnnotationFrames] = useState({});
    
    // Refs
    const videoRef = useRef(null);
    const toolImageInputRef = useRef(null); 
    const materialImageInputRef = useRef(null);
    const supFileInputRef = useRef(null); 
    const resultImageInputRef = useRef(null);
    const buyListImageInputRef = useRef(null); 

    return {
        // Location and navigation
        location,
        navigate,
        currentUser,
        projectId,
        
        // Tab and UI state
        activeTab,
        setActiveTab,
        currentStepIndex,
        setCurrentStepIndex,
        isLargeScreen,
        setIsLargeScreen,
        
        // Project state
        projectName,
        setProjectName,
        uploadedVideos,
        setUploadedVideos,
        activeVideoIndex,
        setActiveVideoIndex,
        activeVideoUrl,
        setActiveVideoUrl,
        videoDimensions,
        setVideoDimensions,
        
        // Current step state
        currentStepName,
        setCurrentStepName,
        currentStepDescription,
        setCurrentStepDescription,
        currentStepStartTime,
        setCurrentStepStartTime,
        currentStepEndTime,
        setCurrentStepEndTime,
        currentCautionaryNotes,
        setCurrentCautionaryNotes,
        currentBestPracticeNotes,
        setCurrentBestPracticeNotes,
        
        // Annotation state
        frameForAnnotation,
        setFrameForAnnotation,
        frameTimestampMs,
        setFrameTimestampMs,
        currentStepAnnotations,
        setCurrentStepAnnotations,
        currentAnnotationTool,
        setCurrentAnnotationTool,
        
        // Tools state
        currentStepTools,
        setCurrentStepTools,
        currentStepToolName,
        setCurrentStepToolName,
        currentStepToolSpec,
        setCurrentStepToolSpec,
        currentStepToolImageFile,
        setCurrentStepToolImageFile,
        
        // Materials state
        currentStepMaterials,
        setCurrentStepMaterials,
        currentStepMaterialName,
        setCurrentStepMaterialName,
        currentStepMaterialSpec,
        setCurrentStepMaterialSpec,
        currentStepMaterialImageFile,
        setCurrentStepMaterialImageFile,
        
        // Files state
        currentStepSupFiles,
        setCurrentStepSupFiles,
        currentStepSupFileName,
        setCurrentStepSupFileName,
        
        // Validation state
        currentStepValidationQuestion,
        setCurrentStepValidationQuestion,
        currentStepValidationAnswer,
        setCurrentStepValidationAnswer,
        currentStepResultImageFile,
        setCurrentStepResultImageFile,
        
        // Buy list state
        projectBuyList,
        setProjectBuyList,
        buyListItemName,
        setBuyListItemName,
        buyListItemQty,
        setBuyListItemQty,
        buyListItemSpec,
        setBuyListItemSpec,
        buyListItemLink,
        setBuyListItemLink,
        buyListItemImageFile,
        setBuyListItemImageFile,
        
        // Project steps and loading state
        projectSteps,
        setProjectSteps,
        isLoading,
        setIsLoading,
        isStepLoading,
        setIsStepLoading,
        errorMessage,
        setErrorMessage,
        successMessage,
        setSuccessMessage,
        
        // Add missing state for captured annotation frames
        capturedAnnotationFrames,
        setCapturedAnnotationFrames,
        
        // Refs
        videoRef,
        toolImageInputRef,
        materialImageInputRef,
        supFileInputRef,
        resultImageInputRef,
        buyListImageInputRef
    };
};

export const useCreateStepsEffects = (state) => {
    const {
        setActiveTab,
        setIsLargeScreen,
        currentUser,
        navigate,
        location,
        projectId,
        setProjectName,
        setUploadedVideos,
        setActiveVideoUrl,
        setActiveVideoIndex,
        setErrorMessage,
        setProjectSteps,
        activeVideoUrl,
        videoRef,
        setVideoDimensions
    } = state;

    // Expose setActiveTab globally for sidebar navigation
    useEffect(() => {
        window.setActiveTab = setActiveTab;
        return () => {
            delete window.setActiveTab;
        };
    }, [setActiveTab]);

    // Handle screen resize
    useEffect(() => {
        const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setIsLargeScreen]);

    // Initialize project data
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const fetchProjectData = async () => {
            try {
                console.log('Fetching project data for ID:', projectId);
                console.log('Current user:', currentUser?.uid);
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/projects/${projectId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch project data');
                }

                const projectData = await response.json();
                console.log('Project data from API:', projectData);
                
                setProjectName(projectData.name || `Project ${projectId}`);
                
                // Now fetch the project's primary video files
                const stepsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/projects/${projectId}/steps`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                let videosFromAPI = [];
                
                if (stepsResponse.ok) {
                    const stepsData = await stepsResponse.json();
                    console.log('Steps data from API:', stepsData);
                    console.log('Number of steps returned:', stepsData.length);
                    
                    // Verify these steps belong to the current project
                    stepsData.forEach((step, index) => {
                        console.log(`Step ${index}:`, {
                            name: step.name,
                            project_id: step.project_id || 'not specified',
                            main_video_file: step.main_video_file?.original_filename || 'no video'
                        });
                    });
                    
                    // Extract unique video files from steps
                    const videoFilesMap = new Map();
                    
                    // Process each step to extract video files
                    for (const step of stepsData) {
                        if (step.main_video_file && step.main_video_file.file_key) {
                            try {
                                // Convert file_key to proper Firebase Storage URL
                                console.log('Processing video file_key:', step.main_video_file.file_key);
                                const fileRef = storageRef(storage, step.main_video_file.file_key);
                                const downloadURL = await getDownloadURL(fileRef);
                                console.log('Generated download URL:', downloadURL);
                                
                                videoFilesMap.set(step.main_video_file.file_key, {
                                    name: step.main_video_file.original_filename,
                                    url: downloadURL,
                                    path: step.main_video_file.file_key
                                });
                            } catch (error) {
                                console.error('Error getting download URL for video:', step.main_video_file.file_key, error);
                                // If file_url is available as fallback, use it
                                if (step.main_video_file.file_url) {
                                    videoFilesMap.set(step.main_video_file.file_key, {
                                        name: step.main_video_file.original_filename,
                                        url: step.main_video_file.file_url,
                                        path: step.main_video_file.file_key
                                    });
                                }
                            }
                        }
                    }
                    
                    videosFromAPI = Array.from(videoFilesMap.values());
                    setUploadedVideos(videosFromAPI);
                    console.log("Videos from API:", videosFromAPI);
                    
                    // Also load the existing steps for editing
                    if (stepsData.length > 0) {
                        console.log('Loading existing steps for editing...');
                        setProjectSteps(stepsData);
                    }
                } else {
                    // Fallback: create a placeholder if we can't get video files
                    console.warn('Could not fetch steps data, using placeholder');
                    setUploadedVideos([]);
                }
                
                if (videosFromAPI.length > 0 && videosFromAPI[0].url) {
                    console.log('Setting active video URL:', videosFromAPI[0].url);
                    setActiveVideoUrl(videosFromAPI[0].url);
                    setActiveVideoIndex(0);
                } else {
                    console.log('No videos found or first video missing URL:', videosFromAPI);
                    setErrorMessage("No videos found for this project. Video files may need to be re-uploaded.");
                }
                
            } catch (error) {
                console.error('Error fetching project data:', error);
                setErrorMessage("Failed to load project data. Please try again.");
            }
        };

        // If we have project data from navigation state, use it
        if (location.state && location.state.uploadedVideos && location.state.uploadedVideos.length > 0) {
            setProjectName(location.state.projectName || `Project ${projectId}`);
            const videosFromState = location.state.uploadedVideos || [];
            setUploadedVideos(videosFromState);
            console.log("Videos from state:", videosFromState);
            if (videosFromState.length > 0 && videosFromState[0].url) {
                setActiveVideoUrl(videosFromState[0].url);
                setActiveVideoIndex(0);
            } else if (videosFromState.length > 0) {
                 console.warn("First video from state is missing a URL:", videosFromState[0]);
                 setErrorMessage("A primary video URL is missing. Please re-upload.");
            }
        } else if (projectId) {
            // If no navigation state or no videos, fetch from API
            fetchProjectData();
        } else {
            setErrorMessage("Project ID not found. Please start from project creation.");
        }
    }, [projectId, location.state, currentUser, navigate, setProjectName, setUploadedVideos, setActiveVideoUrl, setActiveVideoIndex, setErrorMessage, setProjectSteps]);

    // Handle video metadata loading
    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement && activeVideoUrl) {
            const handleLoadedMetadata = () => {
                if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
                    setVideoDimensions({
                        width: videoElement.videoWidth,
                        height: videoElement.videoHeight,
                    });
                }
            };
            videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
            if (videoElement.readyState >= 2) { handleLoadedMetadata(); }
            return () => { 
                if (videoElement) { 
                    videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
                }
            };
        }
    }, [activeVideoUrl, setVideoDimensions, videoRef]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                return;
            }
            if (videoRef.current && activeVideoUrl) { 
                if (e.key === 'c' || e.key === 'C') {
                    e.preventDefault(); 
                    // navigateFrame('forward'); // This would need to be imported
                } else if (e.key === 'b' || e.key === 'B') {
                    e.preventDefault(); 
                    // navigateFrame('backward'); // This would need to be imported
                }
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [activeVideoUrl, videoRef]);
}; 