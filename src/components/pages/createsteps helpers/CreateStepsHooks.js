// CreateStepsHooks.js - Custom hooks and state management for CreateSteps component
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { storage } from '../../../firebase/firebase';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import { reconstructCapturedAnnotationFrames, getApiUrl } from './CreateStepsUtils';

export const useCreateStepsState = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const { currentUser } = useAuth();
    
    const projectId = params.projectId || location.state?.projectId;
    
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
    
    // Steps sidebar state
    const [isStepsSidebarCollapsed, setIsStepsSidebarCollapsed] = useState(false);
    
    // Player state
    const [playing, setPlaying] = useState(false);
    
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
        
        // Steps sidebar state
        isStepsSidebarCollapsed,
        setIsStepsSidebarCollapsed,
        
        // Player state
        playing,
        setPlaying,
        
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
        activeTab,
        activeVideoUrl
    } = state;

    // Expose setActiveTab globally for sidebar navigation
    useEffect(() => {
        window.setActiveTab = setActiveTab;
        return () => {
            delete window.setActiveTab;
        };
    }, [setActiveTab]);

    // Expose activeTab globally for sidebar synchronization
    useEffect(() => {
        window.globalActiveTab = activeTab;
        return () => {
            delete window.globalActiveTab;
        };
    }, [activeTab]);

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

        // Validate projectId format (should be a valid UUID)
        if (projectId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId)) {
            setErrorMessage('Invalid project ID format.');
            navigate('/my-projects');
            return;
        }

        const fetchProjectData = async () => {
            try {
                // Add authorization check - only allow access to own projects
                const response = await fetch(`${getApiUrl()}/projects/${projectId}?firebase_uid=${currentUser.uid}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    if (response.status === 403) {
                        setErrorMessage('Access denied. You can only edit your own projects.');
                        navigate('/my-projects');
                        return;
                    } else if (response.status === 404) {
                        setErrorMessage('Project not found.');
                        navigate('/my-projects');
                        return;
                    } else {
                        throw new Error('Failed to fetch project data');
                    }
                }

                const projectData = await response.json();
                console.log('Project data received:', projectData);
                
                setProjectName(projectData.name || `Project ${projectId}`);
                
                // Store existing thumbnail URL if it exists
                if (projectData.thumbnail_url) {
                    setExistingThumbnailUrl(projectData.thumbnail_url);
                }
                
                // Check if there's a saved buy list state in localStorage
                const savedBuyListState = localStorage.getItem(`buyListState_${projectId}`);
                
                // Now fetch the project's primary video files
                const stepsResponse = await fetch(`${getApiUrl()}/projects/${projectId}/steps?firebase_uid=${currentUser.uid}`, {
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
                    
                    // If this is a new project (no steps yet), try to get videos from location.state
                    if (!isExistingProject && location.state?.uploadedVideos) {
                        console.log('New project detected, using videos from location.state:', location.state.uploadedVideos);
                        videosFromAPI = location.state.uploadedVideos;
                        setUploadedVideos(videosFromAPI);
                    } else if (!isExistingProject) {
                        // If no location.state videos, try to fetch from project data
                        console.log('No location.state videos, trying to fetch from project data...');
                        console.log('Project ID:', projectId);
                        console.log('Location state:', location.state);
                        
                        try {
                            const projectFilesResponse = await fetch(`${getApiUrl()}/projects/${projectId}/files?firebase_uid=${currentUser.uid}`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            });
                            
                            console.log('Project files response status:', projectFilesResponse.status);
                            
                            if (projectFilesResponse.ok) {
                                const projectFiles = await projectFilesResponse.json();
                                console.log('Project files response:', projectFiles);
                                
                                const videoFiles = projectFiles.filter(file => file.role === 'PRIMARY_VIDEO');
                                console.log('Video files found:', videoFiles);
                                
                                for (const videoFile of videoFiles) {
                                    try {
                                        const fileRef = storageRef(storage, videoFile.file_key);
                                        const downloadURL = await getDownloadURL(fileRef);
                                        
                                        videosFromAPI.push({
                                            name: videoFile.original_filename,
                                            url: downloadURL,
                                            path: videoFile.file_key
                                        });
                                    } catch (error) {
                                        console.error('Error getting download URL for video file:', error);
                                        // Use file_url as fallback if available
                                        if (videoFile.file_url) {
                                            videosFromAPI.push({
                                                name: videoFile.original_filename,
                                                url: videoFile.file_url,
                                                path: videoFile.file_key
                                            });
                                        }
                                    }
                                }
                                
                                if (videosFromAPI.length > 0) {
                                    console.log('Found videos from project files:', videosFromAPI);
                                    setUploadedVideos(videosFromAPI);
                                } else {
                                    console.log('No videos found in project files');
                                }
                            } else {
                                console.error('Project files response not ok:', projectFilesResponse.status, projectFilesResponse.statusText);
                                const errorText = await projectFilesResponse.text();
                                console.error('Error response:', errorText);
                            }
                        } catch (error) {
                            console.error('Error fetching project files:', error);
                        }
                    }
                    
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
                            const buyListResponse = await fetch(`${getApiUrl()}/projects/${projectId}/buy_list?firebase_uid=${currentUser.uid}`, {
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
                    
                    // If we have videos from steps, use them
                    if (videoFilesMap.size > 0) {
                        videosFromAPI = Array.from(videoFilesMap.values());
                        setUploadedVideos(videosFromAPI);
                    } else if (isExistingProject) {
                        // If no videos from steps but project exists, try to fetch from project files
                        try {
                            const projectFilesResponse = await fetch(`${getApiUrl()}/projects/${projectId}/files?firebase_uid=${currentUser.uid}`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            });
                            
                            if (projectFilesResponse.ok) {
                                const projectFiles = await projectFilesResponse.json();
                                const videoFiles = projectFiles.filter(file => file.role === 'PRIMARY_VIDEO');
                                
                                for (const videoFile of videoFiles) {
                                    try {
                                        const fileRef = storageRef(storage, videoFile.file_key);
                                        const downloadURL = await getDownloadURL(fileRef);
                                        
                                        videosFromAPI.push({
                                            name: videoFile.original_filename,
                                            url: downloadURL,
                                            path: videoFile.file_key
                                        });
                                    } catch (error) {
                                        console.error('Error getting download URL for video file:', error);
                                        // Use file_url as fallback if available
                                        if (videoFile.file_url) {
                                            videosFromAPI.push({
                                                name: videoFile.original_filename,
                                                url: videoFile.file_url,
                                                path: videoFile.file_key
                                            });
                                        }
                                    }
                                }
                                
                                setUploadedVideos(videosFromAPI);
                            }
                        } catch (error) {
                            console.error('Error fetching project files:', error);
                        }
                    }
                    
                    // Also load the existing steps for editing
                    if (stepsData.length > 0) {
                        
                        // Transform the steps data to match frontend expectations
                        const transformedSteps = stepsData.map(step => {
                            // Transform validation data from backend format to frontend format
                            const transformedValidationMetric = step.validation_metric ? {
                                question: step.validation_metric.validation_data?.question || step.validation_metric.question || '',
                                expected_answer: step.validation_metric.validation_data?.expected_answer || step.validation_metric.expected_answer || ''
                            } : null;
                            
                            // Debug logging for validation data transformation
                            console.log('Transforming step validation data:', {
                                stepName: step.name,
                                originalValidationMetric: step.validation_metric,
                                transformedValidationMetric: transformedValidationMetric
                            });
                            
                            return {
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
                                })) || [],
                                // Use the transformed validation metric
                                validation_metric: transformedValidationMetric
                            };
                        });
                        
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
                    console.warn('Could not fetch steps data, trying alternative video detection...');
                    
                    // Try to get videos from project files even if steps failed
                    try {
                        const projectFilesResponse = await fetch(`${getApiUrl()}/projects/${projectId}/files`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        
                        console.log('Fallback project files response status:', projectFilesResponse.status);
                        
                        if (projectFilesResponse.ok) {
                            const projectFiles = await projectFilesResponse.json();
                            console.log('Fallback project files response:', projectFiles);
                            
                            const videoFiles = projectFiles.filter(file => file.role === 'PRIMARY_VIDEO');
                            console.log('Fallback video files found:', videoFiles);
                            
                            for (const videoFile of videoFiles) {
                                try {
                                    const fileRef = storageRef(storage, videoFile.file_key);
                                    const downloadURL = await getDownloadURL(fileRef);
                                    
                                    videosFromAPI.push({
                                        name: videoFile.original_filename,
                                        url: downloadURL,
                                        path: videoFile.file_key
                                    });
                                } catch (error) {
                                    console.error('Error getting download URL for video file:', error);
                                    // Use file_url as fallback if available
                                    if (videoFile.file_url) {
                                        videosFromAPI.push({
                                            name: videoFile.original_filename,
                                            url: videoFile.file_url,
                                            path: videoFile.file_key
                                        });
                                    }
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Error in fallback video detection:', error);
                    }
                    
                    // Initialize buy list as empty
                    setProjectBuyList([]);
                }
                
                // Set videos and check if we have any
                setUploadedVideos(videosFromAPI);
                
                if (videosFromAPI.length > 0 && videosFromAPI[0].url) {
                    setActiveVideoUrl(videosFromAPI[0].url);
                    setActiveVideoIndex(0);
                    console.log('✅ Videos loaded successfully:', videosFromAPI);
                } else {
                    console.error('❌ No videos found. videosFromAPI:', videosFromAPI);
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
            
            // Handle AI breakdown data if available
            if (location.state.aiBreakdownData && location.state.aiBreakdownData.length > 0) {
                console.log('🎯 Processing AI breakdown data:', location.state.aiBreakdownData);
                
                // Process AI breakdown data to create steps
                const aiSteps = [];
                let stepIndex = 0;
                
                location.state.aiBreakdownData.forEach((breakdown, breakdownIndex) => {
                    if (breakdown.steps && breakdown.steps.length > 0) {
                        breakdown.steps.forEach((aiStep, stepIndexInBreakdown) => {
                            // Use the timestamps provided by the backend if available
                            const startTimeMs = aiStep.video_start_time_ms || 0;
                            const endTimeMs = aiStep.video_end_time_ms || 0;
                            
                            const newStep = {
                                id: `ai-step-${stepIndex}`,
                                name: aiStep.name || `Step ${stepIndex + 1}`,
                                description: aiStep.description || '',
                                estimated_duration: aiStep.estimated_duration || 30,
                                difficulty_level: aiStep.difficulty_level || 'Beginner',
                                materials: [], // Remove AI-generated materials
                                tools: [], // Remove AI-generated tools
                                cautions: breakdown.cautions || [],
                                questions: breakdown.questions || [],
                                video_index: breakdownIndex,
                                // Use backend-provided timestamps
                                video_start_time_ms: startTimeMs,
                                video_end_time_ms: endTimeMs,
                                // Use backend-provided timestamp data
                                timestamps: aiStep.timestamps || {
                                    start: aiStep.timestamps?.start || "00:00.000",
                                    end: aiStep.timestamps?.end || "00:00.000",
                                    start_seconds: startTimeMs / 1000,
                                    end_seconds: endTimeMs / 1000,
                                    duration_seconds: (endTimeMs - startTimeMs) / 1000
                                },
                                timestamp_display: aiStep.timestamp_display || "00:00.000 - 00:00.000",
                                thumbnail_url: null,
                                annotation_frames: [],
                                is_ai_generated: true, // Flag to identify AI-generated steps
                                step_order: stepIndex + 1, // Add step_order based on timestamp order
                            };
                            aiSteps.push(newStep);
                            stepIndex++;
                        });
                    }
                });
                
                if (aiSteps.length > 0) {
                    console.log(`✅ Auto-populated ${aiSteps.length} steps from AI analysis`);
                    setProjectSteps(aiSteps);
                    setSuccessMessage(`AI analysis completed! ${aiSteps.length} steps have been auto-populated. You can now review and edit them.`);
                    setTimeout(() => setSuccessMessage(''), 5000);
                }
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
        // This effect is now handled by the onReady prop of ReactPlayer
        // and the logic is directly inside the CreateSteps component.
        // The onReady callback provides a reliable way to get video dimensions
        // without directly adding event listeners.
        
        // The new implementation in CreateSteps.js should look like this:
        //
        // <ReactPlayer
        //   ...
        //   onReady={() => {
        //     if (videoRef.current) {
        //       const videoElement = videoRef.current.getInternalPlayer();
        //       if (videoElement) {
        //         setVideoDimensions({
        //           width: videoElement.videoWidth,
        //           height: videoElement.videoHeight,
        //         });
        //       }
        //     }
        //   }}
        // />
        //
        // This keeps the logic within the component that owns the player
        // and uses the official ReactPlayer API.
        
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