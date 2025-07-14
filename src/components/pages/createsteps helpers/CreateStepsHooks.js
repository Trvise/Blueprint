// CreateStepsHooks.js - Custom hooks and state management for CreateSteps component
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { storage } from '../../../firebase/firebase';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import { reconstructCapturedAnnotationFrames, getApiUrl } from './CreateStepsUtils';

export const useCreateStepsState = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const projectId = location.state?.projectId;
    
    // Tab and UI state
    const [activeTab, setActiveTab] = useState('details');
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
    const [showTabWarning, setShowTabWarning] = useState(false);
    const [pendingTabSwitch, setPendingTabSwitch] = useState(null);
    
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
    const [currentStepToolPurchaseLink, setCurrentStepToolPurchaseLink] = useState('');
    const [currentStepToolQuantity, setCurrentStepToolQuantity] = useState(1);
    
    // Materials state
    const [currentStepMaterials, setCurrentStepMaterials] = useState([]);
    const [currentStepMaterialName, setCurrentStepMaterialName] = useState('');
    const [currentStepMaterialSpec, setCurrentStepMaterialSpec] = useState('');
    const [currentStepMaterialImageFile, setCurrentStepMaterialImageFile] = useState(null);
    const [currentStepMaterialPurchaseLink, setCurrentStepMaterialPurchaseLink] = useState('');
    const [currentStepMaterialQuantity, setCurrentStepMaterialQuantity] = useState(1);
    
    // Files state
    const [currentStepSupFiles, setCurrentStepSupFiles] = useState([]); 
    const [currentStepSupFileName, setCurrentStepSupFileName] = useState(''); 
    
    // Validation state
    const [currentStepValidationQuestion, setCurrentStepValidationQuestion] = useState('');
    const [currentStepValidationAnswer, setCurrentStepValidationAnswer] = useState(''); 
    const [currentStepResultImageFile, setCurrentStepResultImageFile] = useState(null);
    const [currentStepResultImage, setCurrentStepResultImage] = useState(null); // For displaying image URL
    
    // Buy list state
    const [projectBuyList, setProjectBuyList] = useState([]);
    
    // Project steps and loading state
    const [projectSteps, setProjectSteps] = useState([]);
    const [isLoading, setIsLoading] = useState(false); 
    const [isStepLoading, setIsStepLoading] = useState(false); 
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // Project thumbnail state
    const [existingThumbnailUrl, setExistingThumbnailUrl] = useState(null);
    
    // Add missing state for captured annotation frames
    const [capturedAnnotationFrames, setCapturedAnnotationFrames] = useState({});
    
    // Annotation popup state
    const [isAnnotationPopupOpen, setIsAnnotationPopupOpen] = useState(false);
    
    // Repository refresh trigger
    const [repositoryRefreshTrigger, setRepositoryRefreshTrigger] = useState(0);
    
    // Refs
    const videoRef = useRef(null);
    const toolImageInputRef = useRef(null); 
    const materialImageInputRef = useRef(null);
    const supFileInputRef = useRef(null); 
    const resultImageInputRef = useRef(null);

    // Tab validation function
    const validateCurrentTab = (tabName) => {
        if (currentStepIndex === -1) return true; // No step selected, allow switching
        
        switch (tabName) {
            case 'details':
                return currentStepName.trim() !== '' && 
                       currentStepDescription.trim() !== '' && 
                       currentStepStartTime !== null && 
                       currentStepEndTime !== null;
            case 'materials':
                // Materials tab is optional, always allow switching
                return true;
            case 'files':
                // Files tab is optional, always allow switching
                return true;
            case 'result':
                // Result tab is optional, always allow switching
                return true;
            case 'signoff':
                return currentCautionaryNotes.trim() !== '' && 
                       currentBestPracticeNotes.trim() !== '' && 
                       currentStepValidationQuestion.trim() !== '' && 
                       currentStepValidationAnswer.trim() !== '';
            default:
                return true;
        }
    };
    
    // Safe tab switching function
    const safeSetActiveTab = (newTab) => {
        if (validateCurrentTab(activeTab)) {
            setActiveTab(newTab);
        } else {
            setPendingTabSwitch(newTab);
            setShowTabWarning(true);
        }
    };
    
    // Confirm tab switch (user acknowledges warning)
    const confirmTabSwitch = () => {
        if (pendingTabSwitch) {
            setActiveTab(pendingTabSwitch);
            setPendingTabSwitch(null);
        }
        setShowTabWarning(false);
    };
    
    // Cancel tab switch
    const cancelTabSwitch = () => {
        setPendingTabSwitch(null);
        setShowTabWarning(false);
    };

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
        showTabWarning,
        setShowTabWarning,
        pendingTabSwitch,
        setPendingTabSwitch,
        validateCurrentTab,
        safeSetActiveTab,
        confirmTabSwitch,
        cancelTabSwitch,
        
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
        currentStepToolPurchaseLink,
        setCurrentStepToolPurchaseLink,
        currentStepToolQuantity,
        setCurrentStepToolQuantity,
        
        // Materials state
        currentStepMaterials,
        setCurrentStepMaterials,
        currentStepMaterialName,
        setCurrentStepMaterialName,
        currentStepMaterialSpec,
        setCurrentStepMaterialSpec,
        currentStepMaterialImageFile,
        setCurrentStepMaterialImageFile,
        currentStepMaterialPurchaseLink,
        setCurrentStepMaterialPurchaseLink,
        currentStepMaterialQuantity,
        setCurrentStepMaterialQuantity,
        
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
        currentStepResultImage,
        setCurrentStepResultImage,
        
        // Buy list state
        projectBuyList,
        setProjectBuyList,
        
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
        
        // Project thumbnail state
        existingThumbnailUrl,
        setExistingThumbnailUrl,
        
        // Add missing state for captured annotation frames
        capturedAnnotationFrames,
        setCapturedAnnotationFrames,
        
        // Annotation popup state
        isAnnotationPopupOpen,
        setIsAnnotationPopupOpen,
        
        // Repository refresh trigger
        repositoryRefreshTrigger,
        setRepositoryRefreshTrigger,
        
        // Refs
        videoRef,
        toolImageInputRef,
        materialImageInputRef,
        supFileInputRef,
        resultImageInputRef
    };
};

export const useCreateStepsEffects = (state) => {
    const {
        currentUser,
        projectId,
        location,
        navigate,
        setProjectName,
        setUploadedVideos,
        setActiveVideoUrl,
        setActiveVideoIndex,
        setErrorMessage,
        setProjectSteps,
        setCapturedAnnotationFrames,
        setSuccessMessage,
        setExistingThumbnailUrl,
        setProjectBuyList,
        setIsLargeScreen,
        videoRef,
        setVideoDimensions,
        setActiveTab,
        activeVideoUrl
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
                const response = await fetch(`${getApiUrl()}/projects/${projectId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch project data');
                }

                const projectData = await response.json();
                
                setProjectName(projectData.name || `Project ${projectId}`);
                
                // Store existing thumbnail URL if it exists
                if (projectData.thumbnail_url) {
                    setExistingThumbnailUrl(projectData.thumbnail_url);
                }
                
                // Check if there's a saved buy list state in localStorage
                const savedBuyListState = localStorage.getItem(`buyListState_${projectId}`);
                
                // Now fetch the project's primary video files
                const stepsResponse = await fetch(`${getApiUrl()}/projects/${projectId}/steps`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                let videosFromAPI = [];
                
                if (stepsResponse.ok) {
                    const stepsData = await stepsResponse.json();
                    
                    // Check if this is an existing project (has steps) or a new project
                    const isExistingProject = stepsData && stepsData.length > 0;
                    
                    if (savedBuyListState) {
                        // If there's a saved state, use it (handles both cleared and modified states)
                        try {
                            const savedBuyList = JSON.parse(savedBuyListState);
                            setProjectBuyList(savedBuyList);
                            
                            if (savedBuyList.length > 0) {
                                setSuccessMessage(`Restored buy list with ${savedBuyList.length} item${savedBuyList.length !== 1 ? 's' : ''}.`);
                                setTimeout(() => setSuccessMessage(''), 3000);
                            }
                        } catch (error) {
                            console.error('Error parsing saved buy list state:', error);
                            setProjectBuyList([]);
                        }
                    } else if (isExistingProject) {
                        // For existing projects without saved state, load from database
                        try {
                            const buyListResponse = await fetch(`${getApiUrl()}/projects/${projectId}/buy_list`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            });
                            
                            if (buyListResponse.ok) {
                                const buyListData = await buyListResponse.json();
                                
                                // Transform buy list items to frontend format
                                const transformedBuyList = buyListData.map(item => ({
                                    id: `buyitem_${item.item_id}`,
                                    name: item.name,
                                    quantity: item.quantity,
                                    specification: item.specification || '',
                                    purchase_link: item.purchase_link || '',
                                    imageFile: null,
                                    hasExistingImage: !!(item.image_file && item.image_file.file_url),
                                    image_url: item.image_file?.file_url || null,
                                    image_path: item.image_file?.file_key || null,
                                    sourceType: 'existing',
                                    sourceId: item.item_id
                                }));
                                
                                setProjectBuyList(transformedBuyList);
                                
                                // Save initial state to localStorage
                                localStorage.setItem(`buyListState_${projectId}`, JSON.stringify(transformedBuyList));
                                
                                // Show success message if items were loaded
                                if (transformedBuyList.length > 0) {
                                    setSuccessMessage(`Loaded existing buy list with ${transformedBuyList.length} item${transformedBuyList.length !== 1 ? 's' : ''}.`);
                                    setTimeout(() => setSuccessMessage(''), 3000);
                                }
                            } else {
                                // If buy list fetch fails, start with empty
                                setProjectBuyList([]);
                                localStorage.setItem(`buyListState_${projectId}`, JSON.stringify([]));
                            }
                        } catch (error) {
                            console.error('Error loading buy list:', error);
                            setProjectBuyList([]);
                            localStorage.setItem(`buyListState_${projectId}`, JSON.stringify([]));
                        }
                    } else {
                        // For new projects, start with empty buy list
                        setProjectBuyList([]);
                        localStorage.setItem(`buyListState_${projectId}`, JSON.stringify([]));
                    }
                    
                    // Extract unique video files from steps
                    const videoFilesMap = new Map();
                    
                    // Process each step to extract video files
                    for (const step of stepsData) {
                        if (step.main_video_file && step.main_video_file.file_key) {
                            try {
                                // Convert file_key to proper Firebase Storage URL
                                const fileRef = storageRef(storage, step.main_video_file.file_key);
                                const downloadURL = await getDownloadURL(fileRef);
                                
                                videoFilesMap.set(step.main_video_file.file_key, {
                                    name: step.main_video_file.original_filename,
                                    url: downloadURL,
                                    path: step.main_video_file.file_key
                                });
                            } catch (error) {
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
                    
                    // Also load the existing steps for editing
                    if (stepsData.length > 0) {
                        
                        // Transform the steps data to match frontend expectations
                        const transformedSteps = stepsData.map(step => ({
                            ...step,
                            // Transform tools from nested format to flat format for frontend
                            tools: step.tools?.map(toolData => ({
                                id: toolData.tool?.tool_id || toolData.tool_id,
                                name: toolData.tool?.name || toolData.name,
                                specification: toolData.tool?.specification || toolData.specification,
                                purchase_link: toolData.tool?.purchase_link || toolData.purchase_link,
                                quantity: toolData.quantity || 1,
                                image_url: toolData.tool?.image_file?.file_url || toolData.image_url,
                                image_path: toolData.tool?.image_file?.file_key || toolData.image_path,
                                hasExistingImage: !!(toolData.tool?.image_file?.file_url || toolData.image_url)
                            })) || [],
                            // Transform materials from nested format to flat format for frontend
                            materials: step.materials?.map(materialData => ({
                                id: materialData.material?.material_id || materialData.material_id,
                                name: materialData.material?.name || materialData.name,
                                specification: materialData.material?.specification || materialData.specification,
                                purchase_link: materialData.material?.purchase_link || materialData.purchase_link,
                                quantity: materialData.quantity || 1,
                                image_url: materialData.material?.image_file?.file_url || materialData.image_url,
                                image_path: materialData.material?.image_file?.file_key || materialData.image_path,
                                hasExistingImage: !!(materialData.material?.image_file?.file_url || materialData.image_url)
                            })) || []
                        }));
                        
                        setProjectSteps(transformedSteps);
                        
                        // Reconstruct annotation frames for editing
                        try {
                            await reconstructCapturedAnnotationFrames(
                                transformedSteps, 
                                setCapturedAnnotationFrames, 
                                setSuccessMessage
                            );
                        } catch (error) {
                            console.error('Error reconstructing annotation frames:', error);
                            setSuccessMessage('Project loaded. Annotation frames could not be loaded - you can capture new ones.');
                            setTimeout(() => setSuccessMessage(''), 3000);
                        }
                    }
                } else {
                    // Fallback: create a placeholder if we can't get video files
                    console.warn('Could not fetch steps data, using placeholder');
                    setUploadedVideos([]);
                    
                    // Initialize buy list as empty
                    setProjectBuyList([]);
                }
                
                if (videosFromAPI.length > 0 && videosFromAPI[0].url) {
                    setActiveVideoUrl(videosFromAPI[0].url);
                    setActiveVideoIndex(0);
                } else {
                    setErrorMessage("No videos found for this project. Video files may need to be re-uploaded.");
                }
                
            } catch (error) {
                console.error('Error fetching project data:', error);
                setErrorMessage("Failed to load project data. Please try again.");
                
                // Initialize buy list as empty even if project data fetch fails
                setProjectBuyList([]);
            }
        };

        // If we have project data from navigation state, use it
        if (location.state && location.state.uploadedVideos && location.state.uploadedVideos.length > 0) {
            setProjectName(location.state.projectName || `Project ${projectId}`);
            const videosFromState = location.state.uploadedVideos || [];
            setUploadedVideos(videosFromState);
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
    }, [projectId, location.state, currentUser, navigate, setProjectName, setUploadedVideos, setActiveVideoUrl, setActiveVideoIndex, setErrorMessage, setProjectSteps, setCapturedAnnotationFrames, setSuccessMessage, setExistingThumbnailUrl, setProjectBuyList]);

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