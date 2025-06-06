// src/pages/ProjectStepsPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext'; // Adjust path as needed
import Annotation from 'react-image-annotation'; 
import { v4 as uuidv4 } from 'uuid'; 
import { storage } from '../../firebase/firebase'; // Assuming firebase.js exports storage
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// --- Style Objects ---
const styles = {
    pageContainer: {
        maxWidth: '1200px', 
        margin: '0 auto',
        padding: '20px',
        fontFamily: "'Inter', sans-serif", 
        color: '#333',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
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
        hover: { textDecoration: 'underline' }
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
    gridContainer: { 
        display: 'grid',
        gridTemplateColumns: 'repeat(1, 1fr)', 
        gap: '24px',
        alignItems: 'start',
    },
    mainContentArea: { 
        gridColumn: 'span 1 / span 1', 
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    sideBarArea: { 
        gridColumn: 'span 1 / span 1', 
    },
    card: {
        padding: '20px',
        border: '1px solid #e2e8f0', 
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        backgroundColor: '#ffffff',
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
    }
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

    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

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

        const newStepData = {
            id: `local_step_${uuidv4()}`, 
            project_id: projectId, 
            name: currentStepName,
            description: currentStepDescription, 
            video_start_time_ms: Math.round(currentStepStartTime * 1000),
            video_end_time_ms: Math.round(currentStepEndTime * 1000),
            cautionary_notes: currentCautionaryNotes, 
            best_practice_notes: currentBestPracticeNotes,
            associated_video_index: activeVideoIndex, 
            associated_video_path: uploadedVideos[activeVideoIndex]?.path, 
            step_order: projectSteps.length, 
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

        setProjectSteps(prevSteps => [...prevSteps, newStepData]);
        setSuccessMessage(`Step "${currentStepName}" added locally. Save project to persist changes.`);
        console.log("Locally added step:", newStepData);

        setCurrentStepName(''); setCurrentStepDescription('');
        setCurrentStepStartTime(null); setCurrentStepEndTime(null);
        setCurrentCautionaryNotes(''); setCurrentBestPracticeNotes('');
        setFrameForAnnotation(null); setCurrentStepAnnotations([]);
        setCurrentStepTools([]); setCurrentStepMaterials([]); 
        setCurrentStepSupFiles([]); setCurrentStepSupFileName('');
        if (supFileInputRef.current) supFileInputRef.current.value = null;
        if (toolImageInputRef.current) toolImageInputRef.current.value = null;
        if (materialImageInputRef.current) materialImageInputRef.current.value = null;
        setCurrentStepValidationQuestion(''); setCurrentStepValidationAnswer('');
        setCurrentStepResultImageFile(null);
        if (resultImageInputRef.current) resultImageInputRef.current.value = null;
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
        <div style={styles.pageContainer}>
            <header style={styles.header}>
                <h1 style={styles.pageTitle}>
                    Authoring Steps for: <span style={styles.projectNameHighlight}>{projectName || `Project ID: ${projectId}`}</span>
                </h1>
                <button onClick={() => navigate('/')} style={styles.backLink}>Back to Home</button>
            </header>

            {errorMessage && <div role="alert" style={styles.errorMessage}>{errorMessage}</div>}
            {successMessage && <div role="alert" style={styles.successMessage} onClick={()=>setSuccessMessage('')}>{successMessage} (click to dismiss)</div>}

            <div style={getGridStyles(isLargeScreen)}>
                <div style={getMainContentStyles(isLargeScreen)}>
                    {uploadedVideos.length > 0 ? (
                        <div style={styles.card}>
                            <h2 style={styles.sectionTitle}>Project Videos</h2>
                            {uploadedVideos.length > 1 && (
                                <div style={{...styles.flexWrapGap2, marginBottom: '16px'}}>
                                    {uploadedVideos.map((video, index) => (
                                        <button key={video.path || index} onClick={() => handleVideoSelection(index)}
                                            style={{...styles.button, ...(activeVideoIndex === index ? styles.buttonPrimary : styles.buttonSecondarySm), fontSize: '0.8rem', padding: '6px 10px'}}>
                                            Video {index + 1}{video.name ? `: ${video.name.substring(0,20)}...` : ''}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {activeVideoUrl && (
                                <div style={{marginTop: '10px'}}>
                                    <h3 style={{fontSize: '1.1rem', fontWeight: '500', marginBottom: '8px', color: '#34495e'}}>Active: {uploadedVideos[activeVideoIndex]?.name || `Video ${activeVideoIndex + 1}`}</h3>
                                    <video ref={videoRef} key={activeVideoUrl} controls src={activeVideoUrl} crossOrigin="anonymous"
                                        style={styles.videoPlayer}
                                        onLoadedMetadata={() => { if (videoRef.current) setVideoDimensions({ width: videoRef.current.videoWidth, height: videoRef.current.videoHeight }); }}
                                        onError={(e) => { console.error("Video Error:", e); setErrorMessage(`Error loading video.`); }}
                                    />
                                    <div style={{...styles.flexWrapGap2, ...styles.itemsCenter, marginTop: '12px'}}>
                                        <button onClick={() => navigateFrame('backward')} style={{...styles.button, ...styles.buttonSecondarySm}}>◀ Frame (b)</button>
                                        <button onClick={() => navigateFrame('forward')} style={{...styles.button, ...styles.buttonSecondarySm}}>(c) Frame ▶</button>
                                        <button onClick={captureFrameForAnnotation} style={{...styles.button, backgroundColor: '#3498db', color: 'white'}}>Annotate This Frame</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : ( <div style={{...styles.card, textAlign: 'center'}}><p>No videos available for annotation.</p></div> )}
                    
                    {frameForAnnotation && (
                        <div style={{...styles.card, marginTop: '24px'}}>
                            <h2 style={styles.sectionTitle}>Annotate Frame (Time: {formatTime(frameTimestampMs / 1000)})</h2>
                            {videoDimensions.width > 0 && <p style={{fontSize: '0.8rem', color: '#555', marginBottom: '8px'}}>Video Res: {videoDimensions.width}x{videoDimensions.height}</p>}
                            <div style={{...styles.annotationAreaContainer, maxWidth: `${videoDimensions.width || 500}px`}}>
                                <Annotation src={frameForAnnotation} alt="Annotation Frame"
                                    annotations={currentStepAnnotations.filter(ann => ann.data.frame_timestamp_ms === frameTimestampMs)}
                                    value={currentAnnotationTool} onChange={setCurrentAnnotationTool} onSubmit={handleAnnotationSubmit} />
                            </div>
                            <div style={{marginTop: '12px', fontSize: '0.8rem', color: '#555', maxHeight: '100px', overflowY: 'auto'}}>
                                <h4 style={{fontWeight: '600', marginBottom: '4px'}}>Annotations on this frame:</h4>
                                {currentStepAnnotations.filter(ann => ann.data.frame_timestamp_ms === frameTimestampMs).map(ann => (
                                    <div key={ann.data.id} style={{padding: '2px 0', borderBottom: '1px solid #f0f0f0'}}>
                                        <p><strong>{ann.data.text}</strong> (Type: {ann.geometry.type})</p>
                                        <p>Coords ({ann.data.normalized_geometry.isPixelValue ? "Raw" : "Norm"}): 
                                            X:{ann.data.normalized_geometry.x.toFixed(ann.data.normalized_geometry.isPixelValue ? 0 : 3)}, Y:{ann.data.normalized_geometry.y.toFixed(ann.data.normalized_geometry.isPixelValue ? 0 : 3)},
                                            W:{ann.data.normalized_geometry.width.toFixed(ann.data.normalized_geometry.isPixelValue ? 0 : 3)}, H:{ann.data.normalized_geometry.height.toFixed(ann.data.normalized_geometry.isPixelValue ? 0 : 3)}
                                        </p>
                                    </div>
                                ))}
                                {currentStepAnnotations.filter(ann => ann.data.frame_timestamp_ms === frameTimestampMs).length === 0 && <p>No annotations yet for this frame.</p>}
                            </div>
                        </div>
                    )}

                    {activeVideoUrl && (
                        <div style={{...styles.card, marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px'}}>
                            <h2 style={styles.sectionTitle}>Define Step Details</h2>
                            <div><label htmlFor="stepName" style={styles.inputLabel}>Step Name <span style={{color: 'red'}}>*</span></label><input type="text" id="stepName" value={currentStepName} onChange={(e) => setCurrentStepName(e.target.value)} placeholder="e.g., Attach side panel A" style={styles.inputField}/></div>
                            <div><label htmlFor="stepDescription" style={styles.inputLabel}>Step Description <span style={{color: 'red'}}>*</span></label><textarea id="stepDescription" value={currentStepDescription} onChange={(e) => setCurrentStepDescription(e.target.value)} rows="4" placeholder="Detailed instructions..." style={styles.textareaField}/></div>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start'}}>
                                <div><label style={styles.inputLabel}>Video Start Time</label><button onClick={() => markTime('start')} style={{...styles.button, ...styles.buttonSecondarySm, width: '100%', backgroundColor: '#28a745'}}>Mark Start</button>{currentStepStartTime !== null && (<p style={styles.timeDisplay}>Start: {formatTime(currentStepStartTime)}</p>)}</div>
                                <div><label style={styles.inputLabel}>Video End Time</label><button onClick={() => markTime('end')} style={{...styles.button, ...styles.buttonSecondarySm, width: '100%', backgroundColor: '#dc3545'}}>Mark End</button>{currentStepEndTime !== null && (<p style={styles.timeDisplay}>End: {formatTime(currentStepEndTime)}</p>)}</div>
                            </div>
                            <div><label htmlFor="cautionaryNotes" style={styles.inputLabel}>Cautionary Notes</label><textarea id="cautionaryNotes" value={currentCautionaryNotes} onChange={(e) => setCurrentCautionaryNotes(e.target.value)} rows="2" placeholder="e.g., Wear safety glasses." style={styles.textareaField}/></div>
                            <div><label htmlFor="bestPracticeNotes" style={styles.inputLabel}>Best Practice Notes</label><textarea id="bestPracticeNotes" value={currentBestPracticeNotes} onChange={(e) => setCurrentBestPracticeNotes(e.target.value)} rows="2" placeholder="e.g., Pre-drill pilot holes." style={styles.textareaField}/></div>

                            {/* Materials for this Step */}
                            <div style={styles.subSection}><h3 style={styles.subSectionTitle}>Materials for this Step</h3>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px'}}>
                                    <input type="text" value={currentStepMaterialName} onChange={(e) => setCurrentStepMaterialName(e.target.value)} placeholder="Material Name (e.g., M3 Screw)" style={styles.inputField}/>
                                    <input type="text" value={currentStepMaterialSpec} onChange={(e) => setCurrentStepMaterialSpec(e.target.value)} placeholder="Material Specification (e.g., 10mm)" style={styles.inputField}/>
                                </div>
                                <div><label style={{...styles.inputLabel, fontSize: '0.8rem'}}>Material Image (Optional)</label><input type="file" accept="image/*" onChange={(e) => setCurrentStepMaterialImageFile(e.target.files[0])} ref={materialImageInputRef} style={styles.fileInput}/></div>
                                <button onClick={handleAddMaterialToCurrentStep} style={{...styles.button, ...styles.buttonSecondarySm, marginTop: '8px'}}>Add Material to Step</button>
                                {currentStepMaterials.length > 0 && <div style={{marginTop: '12px'}}><h4 style={{fontSize: '0.9rem', fontWeight: '500'}}>Added Materials:</h4><ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px', fontSize: '0.9rem'}}> {currentStepMaterials.map(mat => (<li key={mat.id} style={styles.listItem}><span>{mat.name} ({mat.specification || 'No spec'}) {mat.imageFile && `(${mat.imageFile.name.substring(0,15)}...)`}</span> <button onClick={() => removeMaterialFromCurrentStep(mat.id)} style={styles.removeButton}>Remove</button></li>))}</ul></div>}
                            </div>

                            {/* Tools for this Step */}
                            <div style={styles.subSection}><h3 style={styles.subSectionTitle}>Tools for this Step</h3>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px'}}>
                                    <input type="text" value={currentStepToolName} onChange={(e) => setCurrentStepToolName(e.target.value)} placeholder="Tool Name" style={styles.inputField}/>
                                    <input type="text" value={currentStepToolSpec} onChange={(e) => setCurrentStepToolSpec(e.target.value)} placeholder="Tool Specification" style={styles.inputField}/>
                                </div>
                                <div><label style={{...styles.inputLabel, fontSize: '0.8rem'}}>Tool Image (Optional)</label><input type="file" accept="image/*" onChange={(e) => setCurrentStepToolImageFile(e.target.files[0])} ref={toolImageInputRef} style={styles.fileInput}/></div>
                                <button onClick={handleAddToolToCurrentStep} style={{...styles.button, ...styles.buttonSecondarySm, marginTop: '8px'}}>Add Tool to Step</button>
                                {currentStepTools.length > 0 && <div style={{marginTop: '12px'}}><h4 style={{fontSize: '0.9rem', fontWeight: '500'}}>Added Tools:</h4><ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px', fontSize: '0.9rem'}}> {currentStepTools.map(tool => (<li key={tool.id} style={styles.listItem}><span>{tool.name} ({tool.specification || 'No spec'}) {tool.imageFile && `(${tool.imageFile.name.substring(0,15)}...)`}</span> <button onClick={() => removeToolFromCurrentStep(tool.id)} style={styles.removeButton}>Remove</button></li>))}</ul></div>}
                            </div>

                            {/* Supplementary Files for this Step */}
                            <div style={styles.subSection}><h3 style={styles.subSectionTitle}>Supplementary Files for this Step</h3>
                                <input type="text" value={currentStepSupFileName} onChange={(e) => setCurrentStepSupFileName(e.target.value)} placeholder="Display Name for File (optional)" style={{...styles.inputField, marginBottom: '8px'}}/>
                                <input type="file" onChange={handleSupFileChange} ref={supFileInputRef} style={styles.fileInput}/>
                                {currentStepSupFiles.length > 0 && <div style={{marginTop: '12px'}}><h4 style={{fontSize: '0.9rem', fontWeight: '500'}}>Added Files:</h4><ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px', fontSize: '0.9rem'}}> {currentStepSupFiles.map(f => (<li key={f.id} style={styles.listItem}><span>{f.displayName} ({f.fileObject.name.substring(0,20)}...)</span> <button onClick={() => removeSupFileFromCurrentStep(f.id)} style={styles.removeButton}>Remove</button></li>))}</ul></div>}
                            </div>
                            
                            {/* Step Result Image */}
                            <div style={styles.subSection}><h3 style={styles.subSectionTitle}>Step Result Image (Optional)</h3>
                                <input type="file" accept="image/*" onChange={handleResultImageChange} ref={resultImageInputRef} style={styles.fileInput}/>
                                {currentStepResultImageFile && <p style={{fontSize: '0.9rem', marginTop: '4px'}}>Selected: {currentStepResultImageFile.name}</p>}
                            </div>

                            {/* Step Validation */}
                            <div style={styles.subSection}><h3 style={styles.subSectionTitle}>Step Validation</h3>
                                <textarea value={currentStepValidationQuestion} onChange={(e) => setCurrentStepValidationQuestion(e.target.value)} placeholder="Validation Question Prompt" rows="2" style={{...styles.textareaField, marginBottom: '8px'}}/>
                                <input type="text" value={currentStepValidationAnswer} onChange={(e) => setCurrentStepValidationAnswer(e.target.value)} placeholder="Expected Answer/Range" style={styles.inputField}/>
                            </div>
                            <p style={{fontSize: '0.8rem', color: '#555', fontStyle: 'italic', marginTop: '10px'}}>Remember to capture and add any annotations for this step using the "Annotate This Frame" button above before adding the step.</p>
                            <button onClick={handleAddStep} disabled={isStepLoading} style={{...styles.button, ...styles.buttonPrimary, width: '100%', marginTop: '24px', ...(isStepLoading && styles.buttonDisabled)}}>
                                {isStepLoading ? "Adding Step..." : "Add This Complete Step"}
                            </button>
                        </div>
                    )}
                </div>

                <div style={styles.sideBarArea}>
                    <div style={{...styles.card, position: 'sticky', top: '20px'}}>
                        <h2 style={styles.sectionTitle}>Project Buy List</h2>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                            <div><label style={styles.inputLabel}>Item Name <span style={{color: 'red'}}>*</span></label><input type="text" value={buyListItemName} onChange={(e) => setBuyListItemName(e.target.value)} placeholder="e.g., M3x10mm Screw" style={styles.inputField}/></div>
                            <div><label style={styles.inputLabel}>Quantity</label><input type="number" value={buyListItemQty} onChange={(e) => setBuyListItemQty(e.target.value)} min="1" style={styles.inputField}/></div>
                            <div><label style={styles.inputLabel}>Specification</label><input type="text" value={buyListItemSpec} onChange={(e) => setBuyListItemSpec(e.target.value)} placeholder="e.g., Phillips head" style={styles.inputField}/></div>
                            <div><label style={styles.inputLabel}>Purchase Link</label><input type="url" value={buyListItemLink} onChange={(e) => setBuyListItemLink(e.target.value)} placeholder="https://example.com" style={styles.inputField}/></div>
                            <div><label style={{...styles.inputLabel, fontSize: '0.8rem'}}>Item Image</label><input type="file" accept="image/*" onChange={(e) => setBuyListItemImageFile(e.target.files[0])} ref={buyListImageInputRef} style={styles.fileInput}/></div>
                            <button onClick={handleAddBuyListItem} style={{...styles.button, ...styles.buttonSecondary, width: '100%'}}>Add to Buy List</button>
                        </div>
                        {projectBuyList.length > 0 && (
                            <div style={{marginTop: '20px', maxHeight: '250px', overflowY: 'auto'}}>
                                <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#34495e', marginBottom: '8px'}}>Current Items:</h3>
                                <ul style={{listStylePosition: 'inside', paddingLeft: '0', fontSize: '0.9rem', borderTop: '1px solid #eee'}}> 
                                    {projectBuyList.map((item, index) => (
                                        <li key={item.id} style={{...styles.listItem, ...(index === projectBuyList.length -1 && styles.listItemLast)}}>
                                            <div>{item.name} (Qty: {item.quantity}) {item.imageFile && <span style={{fontSize: '0.75rem', color: '#777'}}>({item.imageFile.name.substring(0,10)}...)</span>}</div> 
                                            <button onClick={() => removeBuyListItem(item.id)} style={styles.removeButton}>X</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {projectSteps.length > 0 && (
                <div style={{...styles.card, marginTop: '30px'}}>
                    <h2 style={styles.sectionTitle}>Defined Project Steps ({projectSteps.length})</h2>
                    <ul style={{listStyle: 'none', padding: 0}}>
                        {projectSteps.map((step, index) => (
                            <li key={step.id || index} style={{padding: '15px 0', borderBottom: '1px solid #eee', ...(index === projectSteps.length -1 && {borderBottom: 'none'})}}>
                                <h3 style={{fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50'}}>{index + 1}. {step.name} (Video {step.associated_video_index + 1})</h3>
                                <p style={{fontSize: '0.9rem', color: '#555', marginTop: '4px', whiteSpace: 'pre-wrap'}}>{step.description}</p>
                                {step.cautionary_notes && <p style={{fontSize: '0.85rem', color: '#e67e22', marginTop: '6px'}}><strong>Caution:</strong> {step.cautionary_notes}</p>}
                                {step.best_practice_notes && <p style={{fontSize: '0.85rem', color: '#3498db', marginTop: '6px'}}><strong>Best Practice:</strong> {step.best_practice_notes}</p>}
                                <p style={{fontSize: '0.8rem', color: '#7f8c8d', marginTop: '6px'}}>Video Segment: {formatTime(step.video_start_time_ms / 1000)} - {formatTime(step.video_end_time_ms / 1000)}</p>
                                {step.annotations?.length > 0 && <details style={{fontSize: '0.85rem', marginTop: '6px'}}><summary style={{color: '#8e44ad', cursor: 'pointer', fontWeight:'500'}}>Annotations ({step.annotations.length})</summary><ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px'}}>{step.annotations.map(ann => (<li key={ann.data.id}>{ann.data.text} at {formatTime(ann.data.frame_timestamp_ms / 1000)}</li>))}</ul></details>}
                                {step.materials?.length > 0 && <details style={{fontSize: '0.85rem', marginTop: '6px'}}><summary style={{color: '#d35400', cursor: 'pointer', fontWeight:'500'}}>Materials ({step.materials.length})</summary><ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px'}}>{step.materials.map(mat => (<li key={mat.id}>{mat.name} {mat.imageFile && `(${mat.imageFile.name.substring(0,15)}...)`}</li>))}</ul></details>}
                                {step.tools?.length > 0 && <details style={{fontSize: '0.85rem', marginTop: '6px'}}><summary style={{color: '#16a085', cursor: 'pointer', fontWeight:'500'}}>Tools ({step.tools.length})</summary><ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px'}}>{step.tools.map(tool => (<li key={tool.id}>{tool.name} {tool.imageFile && `(${tool.imageFile.name.substring(0,15)}...)`}</li>))}</ul></details>}
                                {step.supplementary_files?.length > 0 && <details style={{fontSize: '0.85rem', marginTop: '6px'}}><summary style={{color: '#2980b9', cursor: 'pointer', fontWeight:'500'}}>Files ({step.supplementary_files.length})</summary><ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px'}}>{step.supplementary_files.map(f => (<li key={f.id}>{f.displayName}</li>))}</ul></details>}
                                {step.result_image_file_info && <p style={{fontSize: '0.85rem', color: '#7f8c8d', marginTop: '6px'}}><strong>Result Image:</strong> {step.result_image_file_info.name}</p>}
                                {step.validation_metric?.question && <p style={{fontSize: '0.85rem', color: '#27ae60', marginTop: '6px'}}><strong>Validation:</strong> {step.validation_metric.question}</p>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {projectSteps.length > 0 && (
                 <button 
                    onClick={handleFinishProject}
                    disabled={isLoading}
                    style={{...styles.button, ...styles.buttonPrimary, backgroundColor: '#27ae60', width: '100%', marginTop: '30px', padding: '15px', fontSize: '1.1rem', textTransform: 'uppercase', ...(isLoading && styles.buttonDisabled)}}>
                    {isLoading ? 'Finalizing Project...' : "Finish Project & Save All Data"}
                </button>
            )}
        </div>
    );
};

export default ProjectStepsPage;