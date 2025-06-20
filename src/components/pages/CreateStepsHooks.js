// CreateStepsHooks.js - Custom hooks and state management for CreateSteps component
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';

export const useCreateStepsState = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const projectId = location.state?.projectId;
    
    // Tab and UI state
    const [activeTab, setActiveTab] = useState('video');
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
        if (location.state) {
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
            } else {
                setErrorMessage("No videos found for this project. Please go back and add videos.");
            }
        } else {
            setErrorMessage("Project details not found. Please start from project creation.");
            console.warn("Project details not passed via location state. Consider fetching from backend.");
        }
    }, [projectId, location.state, currentUser, navigate, setProjectName, setUploadedVideos, setActiveVideoUrl, setActiveVideoIndex, setErrorMessage]);

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