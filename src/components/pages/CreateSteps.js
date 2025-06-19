// src/pages/ProjectStepsPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext'; // Adjust path as needed
import Annotation from 'react-image-annotation'; 
import { v4 as uuidv4 } from 'uuid'; 
import { storage } from '../../firebase/firebase'; // Assuming firebase.js exports storage
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// Import Tab Components
import VideoAnnotationTab from '../authoring/VideoAnnotationTab';
import StepDetailsTab from '../authoring/StepDetailsTab';
import MaterialsAndFilesTab from '../authoring/MaterialsAndFilesTab';
import ProjectOverviewTab from '../authoring/ProjectOverviewTab';
import FinalizeTab from '../authoring/FinalizeTab';

// --- Style Objects ---
const styles = {
    pageContainer: {
        display: 'flex',
        height: '100%',
        fontFamily: "'Inter', sans-serif", 
        color: '#333',
        backgroundColor: '#f8fafc',
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 30px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    pageTitle: {
        fontSize: '1.8rem', 
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    projectNameHighlight: {
        color: '#4A90E2', 
    },
    backLink: {
        fontSize: '0.9rem',
        color: '#4A90E2',
        textDecoration: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        backgroundColor: '#f0f9ff',
        transition: 'all 0.2s',
    },
    timelineContainer: {
        padding: '20px 30px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        minHeight: '120px',
    },
    timeline: {
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        padding: '10px 0',
    },
    stepCard: {
        minWidth: '200px',
        backgroundColor: '#f8fafc',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
    },
    stepCardActive: {
        borderColor: '#4A90E2',
        backgroundColor: '#e3f2fd',
        boxShadow: '0 4px 12px rgba(74, 144, 226, 0.15)',
    },
    stepCardEmpty: {
        minWidth: '200px',
        backgroundColor: '#f1f5f9',
        border: '2px dashed #cbd5e1',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    contentArea: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
    },
    tabContent: {
        flex: 1,
        padding: '30px',
        overflowY: 'auto',
        backgroundColor: 'white',
    },
    errorMessage: {
        padding: '12px',
        backgroundColor: '#FFF0F0', 
        border: '1px solid #FFCCCC',
        color: '#D8000C',
        borderRadius: '8px',
        fontSize: '0.9rem',
        marginBottom: '20px',
    },
    successMessage: {
        padding: '12px',
        backgroundColor: '#F0FFF0', 
        border: '1px solid #CCFFCC',
        color: '#008000',
        borderRadius: '8px',
        fontSize: '0.9rem',
        marginBottom: '20px',
        cursor: 'pointer',
    },
    card: {
        padding: '20px',
        border: '1px solid #e2e8f0', 
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        backgroundColor: '#ffffff',
        marginBottom: '20px',
    },
    sectionTitle: {
        fontSize: '1.4rem',
        fontWeight: '600',
        color: '#34495e',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '1px solid #eee'
    },
    inputLabel: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#4a5568', 
        marginBottom: '6px',
    },
    inputField: {
        width: '100%',
        padding: '10px 12px',
        fontSize: '0.9rem',
        color: '#4a5568',
        backgroundColor: '#f8fafc', 
        border: '1px solid #cbd5e1', 
        borderRadius: '8px',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
        transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        boxSizing: 'border-box', 
    },
    textareaField: {
        width: '100%',
        padding: '10px 12px',
        fontSize: '0.9rem',
        color: '#4a5568',
        backgroundColor: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
        transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        minHeight: '80px',
        boxSizing: 'border-box',
    },
    button: {
        padding: '10px 18px',
        fontSize: '0.9rem',
        fontWeight: '600',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease-in-out, transform 0.1s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    buttonPrimary: {
        backgroundColor: '#4A90E2', 
        color: 'white',
    },
    buttonSecondary: {
        backgroundColor: '#6c757d', 
        color: 'white',
    },
    buttonSecondarySm: {
        padding: '6px 12px',
        fontSize: '0.8rem',
        backgroundColor: '#6c757d',
        color: 'white',
    },
    buttonDisabled: {
        backgroundColor: '#e9ecef', 
        color: '#6c757d',
        cursor: 'not-allowed',
        opacity: 0.7,
    },
    fileInput: {
        width: '100%',
        fontSize: '0.9rem',
        color: '#4a5568',
        padding: '8px 0',
        boxSizing: 'border-box',
    },
    videoPlayer: {
        width: '100%',
        borderRadius: '8px',
        backgroundColor: '#000',
        aspectRatio: '16 / 9',
        minHeight: '300px', 
    },
    annotationAreaContainer: {
        width: '100%',
        margin: '0 auto',
        position: 'relative', 
        border: '1px dashed #cbd5e1',
        padding: '10px',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa'
    },
    listItem: {
        padding: '10px 0',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    listItemLast: {
        borderBottom: 'none',
    },
    removeButton: {
        color: '#e53e3e', 
        backgroundColor: 'transparent',
        border: 'none',
        padding: '4px 8px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    timeDisplay: {
        fontSize: '0.8rem',
        color: '#4a5568',
        marginTop: '4px',
        backgroundColor: '#e9ecef',
        padding: '4px 8px',
        borderRadius: '4px',
        display: 'inline-block',
    },
    flexWrapGap2: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
    },
    itemsCenter: {
        alignItems: 'center',
    },
    subSection: {
        paddingTop: '16px',
        borderTop: '1px solid #e9ecef', 
        marginTop: '20px',
    },
    subSectionTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#34495e',
        marginBottom: '12px',
    },

    // Action buttons
    actionButtons: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        gap: '12px',
        zIndex: 1000,
    },
    floatingButton: {
        padding: '12px 24px',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '50px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'all 0.2s',
    },
    saveButton: {
        backgroundColor: '#4A90E2',
        color: 'white',
    },
    finishButton: {
        backgroundColor: '#27ae60',
        color: 'white',
    },
};

const getGridStyles = (isLargeScreen) => ({
    ...styles.gridContainer,
    gridTemplateColumns: isLargeScreen ? '2fr 1fr' : '1fr', 
});

const getMainContentStyles = (isLargeScreen) => ({
    ...styles.mainContentArea,
    gridColumn: isLargeScreen ? 'span 2 / span 2' : 'span 1 / span 1',
});

const ProjectStepsPage = () => {
    const location = useLocation();
    const projectId  = location.state.projectId
    
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('video');
    const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1 means no step selected

    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

    // Expose setActiveTab globally for sidebar navigation
    useEffect(() => {
        window.setActiveTab = setActiveTab;
        return () => {
            delete window.setActiveTab;
        };
    }, []);

    useEffect(() => {
        const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [projectName, setProjectName] = useState('');
    const [uploadedVideos, setUploadedVideos] = useState([]); 
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const [activeVideoUrl, setActiveVideoUrl] = useState('');
    const videoRef = useRef(null);
    const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

    const [currentStepName, setCurrentStepName] = useState('');
    const [currentStepDescription, setCurrentStepDescription] = useState('');
    const [currentStepStartTime, setCurrentStepStartTime] = useState(null);
    const [currentStepEndTime, setCurrentStepEndTime] = useState(null);
    const [currentCautionaryNotes, setCurrentCautionaryNotes] = useState('');
    const [currentBestPracticeNotes, setCurrentBestPracticeNotes] = useState('');
    
    const [frameForAnnotation, setFrameForAnnotation] = useState(null); 
    const [frameTimestampMs, setFrameTimestampMs] = useState(null); 
    const [currentStepAnnotations, setCurrentStepAnnotations] = useState([]); 
    const [currentAnnotationTool, setCurrentAnnotationTool] = useState({});

    const [currentStepTools, setCurrentStepTools] = useState([]); 
    const [currentStepToolName, setCurrentStepToolName] = useState('');
    const [currentStepToolSpec, setCurrentStepToolSpec] = useState('');
    const [currentStepToolImageFile, setCurrentStepToolImageFile] = useState(null); 
    const toolImageInputRef = useRef(null); 

    const [currentStepMaterials, setCurrentStepMaterials] = useState([]);
    const [currentStepMaterialName, setCurrentStepMaterialName] = useState('');
    const [currentStepMaterialSpec, setCurrentStepMaterialSpec] = useState('');
    const [currentStepMaterialImageFile, setCurrentStepMaterialImageFile] = useState(null);
    const materialImageInputRef = useRef(null);

    const [currentStepSupFiles, setCurrentStepSupFiles] = useState([]); 
    const [currentStepSupFileName, setCurrentStepSupFileName] = useState(''); 
    const supFileInputRef = useRef(null); 
    
    const [currentStepValidationQuestion, setCurrentStepValidationQuestion] = useState('');
    const [currentStepValidationAnswer, setCurrentStepValidationAnswer] = useState(''); 

    const [currentStepResultImageFile, setCurrentStepResultImageFile] = useState(null);
    const resultImageInputRef = useRef(null);

    const [projectBuyList, setProjectBuyList] = useState([]); 
    const [buyListItemName, setBuyListItemName] = useState('');
    const [buyListItemQty, setBuyListItemQty] = useState(1);
    const [buyListItemSpec, setBuyListItemSpec] = useState('');
    const [buyListItemLink, setBuyListItemLink] = useState('');
    const [buyListItemImageFile, setBuyListItemImageFile] = useState(null); 
    const buyListImageInputRef = useRef(null); 

    const [projectSteps, setProjectSteps] = useState([]);
    const [isLoading, setIsLoading] = useState(false); 
    const [isStepLoading, setIsStepLoading] = useState(false); 
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Function to load step data for editing
    const loadStepForEditing = (step, index) => {
        setCurrentStepIndex(index);
        setCurrentStepName(step.name || '');
        setCurrentStepDescription(step.description || '');
        setCurrentStepStartTime(step.video_start_time_ms ? step.video_start_time_ms / 1000 : null);
        setCurrentStepEndTime(step.video_end_time_ms ? step.video_end_time_ms / 1000 : null);
        setCurrentCautionaryNotes(step.cautionary_notes || '');
        setCurrentBestPracticeNotes(step.best_practice_notes || '');
        setCurrentStepAnnotations(step.annotations || []);
        setCurrentStepTools(step.tools || []);
        setCurrentStepMaterials(step.materials || []);
        setCurrentStepSupFiles(step.supplementary_files || []);
        setCurrentStepValidationQuestion(step.validation_metric?.question || '');
        setCurrentStepValidationAnswer(step.validation_metric?.expected_answer || '');
        setCurrentStepResultImageFile(step.result_image_file_info ? new File([], step.result_image_file_info.name) : null);
        
        // Set active video if different
        if (step.associated_video_index !== undefined && step.associated_video_index !== activeVideoIndex) {
            handleVideoSelection(step.associated_video_index);
        }
    };

    // Function to clear current step form
    const clearCurrentStepForm = () => {
        setCurrentStepIndex(-1);
        setCurrentStepName('');
        setCurrentStepDescription('');
        setCurrentStepStartTime(null);
        setCurrentStepEndTime(null);
        setCurrentCautionaryNotes('');
        setCurrentBestPracticeNotes('');
        setCurrentStepAnnotations([]);
        setCurrentStepTools([]);
        setCurrentStepMaterials([]);
        setCurrentStepSupFiles([]);
        setCurrentStepSupFileName('');
        setCurrentStepValidationQuestion('');
        setCurrentStepValidationAnswer('');
        setCurrentStepResultImageFile(null);
        setFrameForAnnotation(null);
        setCurrentAnnotationTool({});
    };

    // Function to delete a step
    const deleteStep = (index) => {
        setProjectSteps(prev => prev.filter((_, i) => i !== index));
        if (currentStepIndex === index) {
            clearCurrentStepForm();
        } else if (currentStepIndex > index) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    // Function to add new step
    const addNewStep = () => {
        clearCurrentStepForm();
        setCurrentStepIndex(projectSteps.length);
    };

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
    }, [projectId, location.state, currentUser, navigate]);

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
    }, [activeVideoUrl]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                return;
            }
            if (videoRef.current && activeVideoUrl) { 
                if (e.key === 'c' || e.key === 'C') {
                    e.preventDefault(); 
                    navigateFrame('forward');
                } else if (e.key === 'b' || e.key === 'B') {
                    e.preventDefault(); 
                    navigateFrame('backward');
                }
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [activeVideoUrl]);


    const handleVideoSelection = (index) => {
        if (uploadedVideos[index] && uploadedVideos[index].url) {
            setActiveVideoIndex(index);
            setActiveVideoUrl(uploadedVideos[index].url);
            setCurrentStepStartTime(null);
            setCurrentStepEndTime(null);
            setFrameForAnnotation(null); 
            setCurrentStepAnnotations([]); 
            setVideoDimensions({ width: 0, height: 0 });
        } else {
            console.warn(`Video at index ${index} is missing a URL.`);
            setErrorMessage(`Video ${index + 1} could not be loaded.`);
        }
    };

    const markTime = (type) => {
        if (videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            if (type === 'start') {
                setCurrentStepStartTime(currentTime);
            } else if (type === 'end') {
                if (currentStepStartTime !== null && currentTime <= currentStepStartTime) {
                    alert("End time must be after start time.");
                    return;
                }
                setCurrentStepEndTime(currentTime);
            }
        }
    };

    const navigateFrame = (direction) => {
        if (videoRef.current && videoRef.current.duration) {
            videoRef.current.pause();
            const frameDuration = 1 / 30; 
            let newTime = videoRef.current.currentTime + (direction === 'forward' ? frameDuration : -frameDuration);
            newTime = Math.max(0, Math.min(newTime, videoRef.current.duration));
            videoRef.current.currentTime = newTime;
        }
    };

    const captureFrameForAnnotation = () => {
        if (videoRef.current) {
            const video = videoRef.current;
            if (video.readyState < video.HAVE_METADATA) { 
                alert("Video metadata is not loaded yet."); return;
            }
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                alert("Video dimensions are not available. Cannot capture frame."); return;
            }
            if (!video.paused) { video.pause(); }
            const timestamp = Math.round(video.currentTime * 1000); 
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            try {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                setFrameForAnnotation(canvas.toDataURL("image/jpeg")); 
                setFrameTimestampMs(timestamp);
                setCurrentStepAnnotations([]); 
                setCurrentAnnotationTool({});
            } catch (e) {
                console.error("Error capturing frame:", e);
                alert("Could not capture frame. Check CORS settings on video source if it's remote.");
                setErrorMessage("Error capturing frame (CORS).");
            }
        }
    };
    
    const handleAnnotationSubmit = (newAnnotationFromLibrary) => {
        const { geometry, data: libraryData } = newAnnotationFromLibrary; 
        if (!geometry) { setErrorMessage("Annotation missing geometry."); return; }
        const customDataForAnnotation = {
            id: uuidv4(), 
            text: libraryData?.text || `Annotation ${currentStepAnnotations.filter(a => a.data.frame_timestamp_ms === frameTimestampMs).length + 1}`, 
            frame_timestamp_ms: frameTimestampMs, 
            normalized_geometry: (videoDimensions.width && videoDimensions.height) ? {
                x: geometry.x / videoDimensions.width, y: geometry.y / videoDimensions.height,
                width: geometry.width / videoDimensions.width, height: geometry.height / videoDimensions.height,
                type: geometry.type 
            } : { 
                x: geometry.x, y: geometry.y, width: geometry.width, height: geometry.height,
                type: geometry.type, isPixelValue: true 
            }
        };
        const annotationToAdd = { geometry: geometry, data: customDataForAnnotation };
        setCurrentStepAnnotations(prev => [...prev, annotationToAdd]);
        setCurrentAnnotationTool({}); 
    };

    const handleAddToolToCurrentStep = () => {
        if (!currentStepToolName.trim()) { alert("Tool name is required."); return; }
        setCurrentStepTools(prev => [...prev, { 
            id: `tool_${uuidv4()}`, name: currentStepToolName, 
            specification: currentStepToolSpec, imageFile: currentStepToolImageFile 
        }]);
        setCurrentStepToolName(''); setCurrentStepToolSpec(''); setCurrentStepToolImageFile(null);
        if (toolImageInputRef.current) toolImageInputRef.current.value = "";
    };
    const removeToolFromCurrentStep = (toolId) => setCurrentStepTools(prev => prev.filter(tool => tool.id !== toolId));

    const handleAddMaterialToCurrentStep = () => {
        if (!currentStepMaterialName.trim()) { alert("Material name is required."); return; }
        setCurrentStepMaterials(prev => [...prev, { 
            id: `material_${uuidv4()}`, name: currentStepMaterialName, 
            specification: currentStepMaterialSpec, imageFile: currentStepMaterialImageFile 
        }]);
        setCurrentStepMaterialName(''); setCurrentStepMaterialSpec(''); setCurrentStepMaterialImageFile(null);
        if (materialImageInputRef.current) materialImageInputRef.current.value = "";
    };
    const removeMaterialFromCurrentStep = (materialId) => setCurrentStepMaterials(prev => prev.filter(mat => mat.id !== materialId));

    const handleSupFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCurrentStepSupFiles(prev => [...prev, {
                id: `supfile_${uuidv4()}`,
                fileObject: file, 
                displayName: currentStepSupFileName || file.name
            }]);
            setCurrentStepSupFileName(''); 
            if (supFileInputRef.current) supFileInputRef.current.value = null; 
        }
    };
    const removeSupFileFromCurrentStep = (fileId) => setCurrentStepSupFiles(prev => prev.filter(f => f.id !== fileId));

    const handleResultImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setCurrentStepResultImageFile(e.target.files[0]);
        } else {
            setCurrentStepResultImageFile(null);
        }
    };

    const handleAddBuyListItem = () => {
        if (!buyListItemName.trim()) { alert("Item name is required for buy list."); return; }
        setProjectBuyList(prev => [...prev, {
            id: `buyitem_${uuidv4()}`, name: buyListItemName,
            quantity: parseInt(buyListItemQty, 10) || 1, specification: buyListItemSpec,
            purchase_link: buyListItemLink, imageFile: buyListItemImageFile 
        }]);
        setBuyListItemName(''); setBuyListItemQty(1); setBuyListItemSpec('');
        setBuyListItemLink(''); setBuyListItemImageFile(null);
        if (buyListImageInputRef.current) buyListImageInputRef.current.value = "";
    };
    const removeBuyListItem = (itemId) => setProjectBuyList(prev => prev.filter(item => item.id !== itemId));


    const handleAddStep = async () => {
        if (isStepLoading) return;
        if (!currentStepName.trim()) { alert("Step name is required."); return; }
        if (currentStepStartTime === null || currentStepEndTime === null) { alert("Mark start/end times."); return; }
        if (currentStepEndTime <= currentStepStartTime) { alert("End time must be after start time."); return; }
        
        setIsStepLoading(true); 
        setErrorMessage('');
        setSuccessMessage('');

        const stepData = {
            id: currentStepIndex >= 0 && currentStepIndex < projectSteps.length 
                ? projectSteps[currentStepIndex].id 
                : `local_step_${uuidv4()}`,
            project_id: projectId, 
            name: currentStepName,
            description: currentStepDescription, 
            video_start_time_ms: Math.round(currentStepStartTime * 1000),
            video_end_time_ms: Math.round(currentStepEndTime * 1000),
            cautionary_notes: currentCautionaryNotes, 
            best_practice_notes: currentBestPracticeNotes,
            associated_video_index: activeVideoIndex, 
            associated_video_path: uploadedVideos[activeVideoIndex]?.path, 
            step_order: currentStepIndex >= 0 ? currentStepIndex : projectSteps.length, 
            annotations: [...currentStepAnnotations], 
            tools: currentStepTools.map(tool => ({ 
                name: tool.name,
                specification: tool.specification,
                image_file_name: tool.imageFile ? tool.imageFile.name : null,
            })), 
            materials: currentStepMaterials.map(mat => ({ 
                name: mat.name,
                specification: mat.specification,
                image_file_name: mat.imageFile ? mat.imageFile.name : null,
            })),
            supplementary_files: currentStepSupFiles.map(f => ({ 
                displayName: f.displayName, 
                fileName: f.fileObject.name, 
                fileType: f.fileObject.type,
            })), 
            validation_metric: { 
                question: currentStepValidationQuestion,
                expected_answer: currentStepValidationAnswer 
            },
            result_image_file_info: currentStepResultImageFile 
                ? { name: currentStepResultImageFile.name, type: currentStepResultImageFile.type, size: currentStepResultImageFile.size } 
                : null,
            _toolImageFiles: currentStepTools.map(t => t.imageFile).filter(Boolean),
            _materialImageFiles: currentStepMaterials.map(m => m.imageFile).filter(Boolean),
            _supplementaryFileObjects: currentStepSupFiles.map(f => f.fileObject),
            _resultImageFileObject: currentStepResultImageFile,
        };

        if (currentStepIndex >= 0 && currentStepIndex < projectSteps.length) {
            // Update existing step
            setProjectSteps(prevSteps => {
                const newSteps = [...prevSteps];
                newSteps[currentStepIndex] = stepData;
                return newSteps;
            });
            setSuccessMessage(`Step "${currentStepName}" updated successfully!`);
        } else {
            // Add new step
            setProjectSteps(prevSteps => [...prevSteps, stepData]);
            setCurrentStepIndex(projectSteps.length);
            setSuccessMessage(`Step "${currentStepName}" added successfully!`);
        }

        console.log("Step data:", stepData);
        setIsStepLoading(false);
    };

    const uploadFileToFirebase = async (file, pathPrefix) => {
        if (!file) return null;
        if (!currentUser || !currentUser.uid) {
            throw new Error("User not authenticated for file upload.");
        }
        // Create a more unique file name for storage to avoid collisions
        const uniqueFileName = `${uuidv4()}-${file.name}`;
        const filePath = `${pathPrefix}/${uniqueFileName}`;
        const fileStorageRef = storageRef(storage, filePath);
        
        console.log(`Uploading ${file.name} to ${filePath}...`);
        setSuccessMessage(`Uploading ${file.name}...`); // Provide feedback
        const snapshot = await uploadBytes(fileStorageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log(`${file.name} uploaded. URL: ${downloadURL}`);
        return { url: downloadURL, path: filePath, name: file.name, type: file.type, size: file.size };
    };
    

    const handleFinishProject = async () => {
        if (!projectSteps.length) {
            alert("Please add at least one step before finishing the project.");
            return;
        }
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('Finalizing project... Uploading files...');

        try {
            const processedStepsPayload = [];
            for (const step of projectSteps) {
                const stepPayload = {
                    name: step.name,
                    description: step.description,
                    video_start_time_ms: step.video_start_time_ms,
                    video_end_time_ms: step.video_end_time_ms,
                    cautionary_notes: step.cautionary_notes,
                    best_practice_notes: step.best_practice_notes,
                    associated_video_path: step.associated_video_path, // Path of the main video for this step
                    step_order: step.step_order,
                    annotations: step.annotations.map(ann => ({ // Send normalized annotation data
                        frame_timestamp_ms: ann.data.frame_timestamp_ms,
                        annotation_type: ann.geometry.type, // Use type from geometry
                        component_name: ann.data.text,
                        data: ann.data.normalized_geometry // Send the normalized geometry
                    })),
                    tools: [],
                    materials: [],
                    supplementary_files: [],
                    validation_metric: step.validation_metric,
                    result_image_url: null,
                    result_image_path: null,
                };

                // Upload Tool Images
                console.log("Uploading tool images for step:", step._toolImageFiles);
                for (const toolFile of step._toolImageFiles || []) {
                    const uploaded = await uploadFileToFirebase(toolFile, `users/${currentUser.uid}/${projectId}/tools`);
                    if (uploaded) {
                        stepPayload.tools.push({
                            name: step.tools.find(t => t.image_file_name === toolFile.name)?.name || 'Unknown Tool',
                            specification: step.tools.find(t => t.image_file_name === toolFile.name)?.specification || '',
                            image_url: uploaded.url,
                            image_path: uploaded.path,
                        });
                    }
                }
                 // Add tools without images
                for (const tool of step.tools || []) {
                    if (!tool.image_file_name && !stepPayload.tools.some(t => t.name === tool.name)) {
                         stepPayload.tools.push({ name: tool.name, specification: tool.specification, image_url: null, image_path: null });
                    }
                }


                // Upload Material Images
                for (const materialFile of step._materialImageFiles || []) {
                    const uploaded = await uploadFileToFirebase(materialFile, `users/${currentUser.uid}/${projectId}/materials`);
                    if (uploaded) {
                        stepPayload.materials.push({
                            name: step.materials.find(m => m.image_file_name === materialFile.name)?.name || 'Unknown Material',
                            specification: step.materials.find(m => m.image_file_name === materialFile.name)?.specification || '',
                            image_url: uploaded.url,
                            image_path: uploaded.path,
                        });
                    }
                }
                // Add materials without images
                for (const material of step.materials || []) {
                    if (!material.image_file_name && !stepPayload.materials.some(m => m.name === material.name)) {
                         stepPayload.materials.push({ name: material.name, specification: material.specification, image_url: null, image_path: null });
                    }
                }


                // Upload Supplementary Files
                for (const supFileObj of step._supplementaryFileObjects || []) {
                    const uploaded = await uploadFileToFirebase(supFileObj, `users/${currentUser.uid}/${projectId}/supplementary_files`);
                    if (uploaded) {
                        stepPayload.supplementary_files.push({
                            display_name: step.supplementary_files.find(sf => sf.fileName === supFileObj.name)?.displayName || supFileObj.name,
                            file_url: uploaded.url,
                            file_path: uploaded.path,
                            original_filename: uploaded.name,
                            mime_type: uploaded.type,
                            file_size_bytes: uploaded.size,
                        });
                    }
                }

                // Upload Step Result Image
                if (step._resultImageFileObject) {
                    const uploaded = await uploadFileToFirebase(step._resultImageFileObject, `users/${currentUser.uid}/${projectId}/result_images`);
                    if (uploaded) {
                        stepPayload.result_image_url = uploaded.url;
                        stepPayload.result_image_path = uploaded.path;
                    }
                }
                processedStepsPayload.push(stepPayload);
            }

            // Upload Buy List Item Images
            const processedBuyListPayload = [];
            for (const item of projectBuyList) {
                let itemImageUrl = null;
                let itemImagePath = null;
                if (item.imageFile) {
                    const uploaded = await uploadFileToFirebase(item.imageFile, `users/${currentUser.uid}/${projectId}/buy_list_images`);
                    if (uploaded) {
                        itemImageUrl = uploaded.url;
                        itemImagePath = uploaded.path;
                    }
                }
                processedBuyListPayload.push({
                    name: item.name,
                    quantity: item.quantity,
                    specification: item.specification,
                    purchase_link: item.purchase_link,
                    image_url: itemImageUrl,
                    image_path: itemImagePath,
                });
            }

            const finalApiPayload = {
                project_id: projectId,
                project_name: projectName,
                user_id: currentUser.uid,
                steps: processedStepsPayload,
                buy_list: processedBuyListPayload,
            };

            console.log("Final API Payload to send to backend:", JSON.stringify(finalApiPayload, null, 2));

            // TODO: Replace with your actual API endpoint for finalizing project steps
            const backendApiUrl = `http://localhost:8000/upload_steps`; 
            const token = currentUser.uid;

            const response = await fetch(backendApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(finalApiPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to save project steps to backend.");
            }
            
            const responseData = await response.json();
            console.log("Backend response from finalize_steps:", responseData);

            setSuccessMessage("Project finalized and all data saved successfully! Redirecting...");
            navigate(`/videos`);

        } catch (error) {
            console.error("Error during project finalization:", error);
            setErrorMessage(`Finalization failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatTime = (timeInSeconds) => {
        if (timeInSeconds === null || isNaN(timeInSeconds) || typeof timeInSeconds === 'undefined') return "00:00.000";
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        const milliseconds = Math.floor((timeInSeconds * 1000) % 1000);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
    };

    if (!currentUser) return <div style={styles.pageContainer}><p>Loading...</p></div>;
    if (errorMessage && uploadedVideos.length === 0 && !location.state) {
         return <div style={styles.pageContainer}><p style={styles.errorMessage}>{errorMessage} <button onClick={() => navigate(-1)} style={{...styles.backLink, marginLeft: '10px'}}>Go Back</button></p></div>;
    }

    return (
        <div style={{...styles.pageContainer, padding: 0, margin: 0}}>
            {/* Main content area */}
            <div style={{...styles.mainContent, width: '100%'}}>
                {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.pageTitle}>
                    Authoring Steps for: <span style={styles.projectNameHighlight}>{projectName || `Project ID: ${projectId}`}</span>
                </h1>
                    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                        {currentStepIndex >= 0 && (
                            <span style={{color: '#6b7280', fontSize: '0.9rem'}}>
                                Editing Step {currentStepIndex + 1}
                            </span>
                        )}
                    </div>
            </header>

                {/* Timeline */}
                <div style={styles.timelineContainer}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                        <h3 style={{fontSize: '1.1rem', fontWeight: '600', color: '#2d3748'}}>Project Timeline</h3>
                        <button 
                            onClick={addNewStep}
                            style={{
                                ...styles.button,
                                ...styles.buttonPrimary,
                                fontSize: '0.9rem',
                                padding: '8px 16px'
                            }}
                        >
                            + Add Step
                                        </button>
                                </div>
                    
                    <div style={styles.timeline}>
                        {projectSteps.map((step, index) => (
                            <div
                                key={step.id}
                                onClick={() => loadStepForEditing(step, index)}
                                style={{
                                    ...styles.stepCard,
                                    ...(currentStepIndex === index ? styles.stepCardActive : {})
                                }}
                            >
                                <div style={{fontWeight: '600', marginBottom: '4px', color: '#2d3748'}}>
                                    Step {index + 1}
                                    </div>
                                <div style={{fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px'}}>
                                    {step.name}
                                </div>
                                <div style={{fontSize: '0.7rem', color: '#9ca3af'}}>
                                    Video {step.associated_video_index + 1}
                        </div>
                                <div style={{fontSize: '0.7rem', color: '#9ca3af'}}>
                                    {formatTime(step.video_start_time_ms / 1000)} - {formatTime(step.video_end_time_ms / 1000)}
                            </div>
                                    </div>
                                ))}
                        
                        {/* Empty step card for adding new step */}
                        <div
                            onClick={addNewStep}
                            style={styles.stepCardEmpty}
                        >
                            + Add New Step
                            </div>
                                </div>
                            </div>

                {/* Error and success messages */}
                {errorMessage && <div role="alert" style={styles.errorMessage}>{errorMessage}</div>}
                {successMessage && <div role="alert" style={styles.successMessage} onClick={()=>setSuccessMessage('')}>{successMessage} (click to dismiss)</div>}

                {/* Tab content */}
                <div style={styles.contentArea}>
                    <div style={styles.tabContent}>
                        {activeTab === 'video' && (
                            <VideoAnnotationTab 
                                uploadedVideos={uploadedVideos}
                                activeVideoIndex={activeVideoIndex}
                                activeVideoUrl={activeVideoUrl}
                                videoRef={videoRef}
                                videoDimensions={videoDimensions}
                                handleVideoSelection={handleVideoSelection}
                                navigateFrame={navigateFrame}
                                captureFrameForAnnotation={captureFrameForAnnotation}
                                frameForAnnotation={frameForAnnotation}
                                frameTimestampMs={frameTimestampMs}
                                currentStepAnnotations={currentStepAnnotations}
                                currentAnnotationTool={currentAnnotationTool}
                                setCurrentAnnotationTool={setCurrentAnnotationTool}
                                handleAnnotationSubmit={handleAnnotationSubmit}
                                formatTime={formatTime}
                                currentStepStartTime={currentStepStartTime}
                                currentStepEndTime={currentStepEndTime}
                                markTime={markTime}
                                styles={styles}
                                setErrorMessage={setErrorMessage}
                            />
                        )}

                        {activeTab === 'details' && (
                            <StepDetailsTab 
                                currentStepName={currentStepName}
                                setCurrentStepName={setCurrentStepName}
                                currentStepDescription={currentStepDescription}
                                setCurrentStepDescription={setCurrentStepDescription}
                                currentStepStartTime={currentStepStartTime}
                                currentStepEndTime={currentStepEndTime}
                                currentCautionaryNotes={currentCautionaryNotes}
                                setCurrentCautionaryNotes={setCurrentCautionaryNotes}
                                currentBestPracticeNotes={currentBestPracticeNotes}
                                setBestPracticeNotes={setCurrentBestPracticeNotes}
                                currentStepValidationQuestion={currentStepValidationQuestion}
                                setCurrentStepValidationQuestion={setCurrentStepValidationQuestion}
                                currentStepValidationAnswer={currentStepValidationAnswer}
                                setCurrentStepValidationAnswer={setCurrentStepValidationAnswer}
                                formatTime={formatTime}
                                styles={styles}
                            />
                        )}

                        {activeTab === 'materials' && (
                            <MaterialsAndFilesTab 
                                // Tools props
                                currentStepTools={currentStepTools}
                                currentStepToolName={currentStepToolName}
                                setCurrentStepToolName={setCurrentStepToolName}
                                currentStepToolSpec={currentStepToolSpec}
                                setCurrentStepToolSpec={setCurrentStepToolSpec}
                                currentStepToolImageFile={currentStepToolImageFile}
                                setCurrentStepToolImageFile={setCurrentStepToolImageFile}
                                toolImageInputRef={toolImageInputRef}
                                handleAddToolToCurrentStep={handleAddToolToCurrentStep}
                                removeToolFromCurrentStep={removeToolFromCurrentStep}
                                // Materials props
                                currentStepMaterials={currentStepMaterials}
                                currentStepMaterialName={currentStepMaterialName}
                                setCurrentStepMaterialName={setCurrentStepMaterialName}
                                currentStepMaterialSpec={currentStepMaterialSpec}
                                setCurrentStepMaterialSpec={setCurrentStepMaterialSpec}
                                currentStepMaterialImageFile={currentStepMaterialImageFile}
                                setCurrentStepMaterialImageFile={setCurrentStepMaterialImageFile}
                                materialImageInputRef={materialImageInputRef}
                                handleAddMaterialToCurrentStep={handleAddMaterialToCurrentStep}
                                removeMaterialFromCurrentStep={removeMaterialFromCurrentStep}
                                // Files props
                                currentStepSupFiles={currentStepSupFiles}
                                currentStepSupFileName={currentStepSupFileName}
                                setCurrentStepSupFileName={setCurrentStepSupFileName}
                                supFileInputRef={supFileInputRef}
                                currentStepResultImageFile={currentStepResultImageFile}
                                setCurrentStepResultImageFile={setCurrentStepResultImageFile}
                                resultImageInputRef={resultImageInputRef}
                                handleSupFileChange={handleSupFileChange}
                                removeSupFileFromCurrentStep={removeSupFileFromCurrentStep}
                                styles={styles}
                            />
                        )}

                        {activeTab === 'overview' && (
                            <ProjectOverviewTab 
                                projectSteps={projectSteps}
                                formatTime={formatTime}
                                styles={styles}
                            />
                        )}

                        {activeTab === 'finalize' && (
                            <FinalizeTab 
                                projectSteps={projectSteps}
                                projectBuyList={projectBuyList}
                                buyListItemName={buyListItemName}
                                setBuyListItemName={setBuyListItemName}
                                buyListItemQty={buyListItemQty}
                                setBuyListItemQty={setBuyListItemQty}
                                buyListItemSpec={buyListItemSpec}
                                setBuyListItemSpec={setBuyListItemSpec}
                                buyListItemLink={buyListItemLink}
                                setBuyListItemLink={setBuyListItemLink}
                                buyListItemImageFile={buyListItemImageFile}
                                setBuyListItemImageFile={setBuyListItemImageFile}
                                buyListImageInputRef={buyListImageInputRef}
                                handleAddBuyListItem={handleAddBuyListItem}
                                removeBuyListItem={removeBuyListItem}
                                handleFinishProject={handleFinishProject}
                                isLoading={isLoading}
                                formatTime={formatTime}
                                styles={styles}
                            />
                        )}
                    </div>
                </div>
            </div>
            
            {/* Floating action buttons */}
            <div style={styles.actionButtons}>
                {currentStepIndex >= 0 && (
                    <button 
                        onClick={handleAddStep}
                        disabled={isStepLoading}
                        style={{
                            ...styles.floatingButton,
                            ...styles.saveButton,
                            ...(isStepLoading && styles.buttonDisabled)
                        }}
                    >
                        {isStepLoading ? 'Saving...' : 'Save Step'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProjectStepsPage;