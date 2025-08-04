// CreateSteps.js - Refactored CreateSteps component using modular files
import React, { useEffect, useRef, useState, useCallback } from 'react';

// Import modular components
import { useCreateStepsState, useCreateStepsEffects } from './createsteps helpers/CreateStepsHooks';
import { createStepHandlers } from './createsteps helpers/CreateStepsHandlers';
import { createStepActions } from './createsteps helpers/CreateStepsActions';
import { styles } from './createsteps helpers/CreateStepsStyles';
import { formatTime, navigateFrame, captureFrameForAnnotation, getApiUrl } from './createsteps helpers/CreateStepsUtils';
import { AnimatedLogo } from './createsteps helpers/CommonComponents';

// Import Tab Components
import StepDetailsTab from '../authoring/StepDetailsTab';
import MaterialsAndToolsTab from '../authoring/MaterialsAndFilesTab';
import FilesTab from '../authoring/FilesTab';
import ResultTab from '../authoring/ResultTab';
import ProjectOverviewTab from '../authoring/ProjectOverviewTab';
import SignOffTab from '../authoring/SignOffTab';
import FinalizeTab from '../authoring/FinalizeTab';
import ProjectRepositoryTab from '../authoring/ProjectRepositoryTab';
import AnnotationPopup from '../authoring/AnnotationPopup';
import FloatingTimeline from '../authoring/FloatingTimeline';
import StepsSidebar from '../authoring/StepsSidebar';
import ReactPlayer from 'react-player';

// Chrome detection
const isChrome = typeof window !== 'undefined' && /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

// Chrome-specific scaling factor
const chromeScale = isChrome ? 0.85 : 1;

// Chrome-optimized styles
const getChromeStyles = () => {
    if (!isChrome) return styles;
    
    return {
        ...styles,
        // Scale down header and titles
        pageTitle: {
            ...styles.pageTitle,
            fontSize: `${Math.max(1.5 * chromeScale, 1.2)}rem`,
            marginBottom: `${8 * chromeScale}px`,
        },
        header: {
            ...styles.header,
            padding: `${12 * chromeScale}px ${16 * chromeScale}px`,
            marginBottom: `${12 * chromeScale}px`,
        },
        // Scale down tab navigation
        tabNavigation: {
            ...styles.tabNavigation,
            gap: `${4 * chromeScale}px`,
            padding: `${8 * chromeScale}px`,
        },
        tabButton: {
            ...styles.tabButton,
            padding: `${8 * chromeScale}px ${12 * chromeScale}px`,
            fontSize: `${0.85 * chromeScale}rem`,
            borderRadius: `${6 * chromeScale}px`,
        },
        // Scale down content areas
        leftPanelContent: {
            ...styles.leftPanelContent,
            padding: isChrome ? '4px' : `${12 * chromeScale}px`,
        },
        videoSection: {
            ...styles.videoSection,
            padding: `${12 * chromeScale}px`,
        },
        stepsSection: {
            ...styles.stepsSection,
            padding: `${12 * chromeScale}px`,
        },
        // Scale down video controls
        videoControls: {
            ...styles.videoControls,
            gap: `${6 * chromeScale}px`,
            padding: `${8 * chromeScale}px`,
        },
        button: {
            ...styles.button,
            padding: `${6 * chromeScale}px ${12 * chromeScale}px`,
            fontSize: `${0.8 * chromeScale}rem`,
            borderRadius: `${4 * chromeScale}px`,
        },
        buttonPrimary: {
            ...styles.buttonPrimary,
            padding: `${8 * chromeScale}px ${16 * chromeScale}px`,
            fontSize: `${0.85 * chromeScale}rem`,
        },
        buttonSecondary: {
            ...styles.buttonSecondary,
            padding: `${6 * chromeScale}px ${12 * chromeScale}px`,
            fontSize: `${0.8 * chromeScale}rem`,
        },
        buttonSecondarySm: {
            ...styles.buttonSecondarySm,
            padding: `${4 * chromeScale}px ${8 * chromeScale}px`,
            fontSize: `${0.75 * chromeScale}rem`,
        },
        buttonDanger: {
            ...styles.buttonDanger,
            padding: `${6 * chromeScale}px ${12 * chromeScale}px`,
            fontSize: `${0.8 * chromeScale}rem`,
        },
        // Scale down step items
        stepItem: {
            ...styles.stepItem,
            padding: `${8 * chromeScale}px`,
            marginBottom: `${6 * chromeScale}px`,
        },
        stepItemHeader: {
            ...styles.stepItemHeader,
            marginBottom: `${4 * chromeScale}px`,
        },
        stepItemNumber: {
            ...styles.stepItemNumber,
            fontSize: `${0.75 * chromeScale}rem`,
        },
        stepItemNumberActive: {
            ...styles.stepItemNumberActive,
            fontSize: `${0.75 * chromeScale}rem`,
        },
        stepItemTime: {
            ...styles.stepItemTime,
            fontSize: `${0.7 * chromeScale}rem`,
        },
        stepItemTimeActive: {
            ...styles.stepItemTimeActive,
            fontSize: `${0.7 * chromeScale}rem`,
        },
        stepItemName: {
            ...styles.stepItemName,
            fontSize: `${0.85 * chromeScale}rem`,
        },
        stepItemNameActive: {
            ...styles.stepItemNameActive,
            fontSize: `${0.85 * chromeScale}rem`,
        },
        // Scale down sections
        stepsSectionHeader: {
            ...styles.stepsSectionHeader,
            marginBottom: `${12 * chromeScale}px`,
        },
        stepsSectionTitle: {
            ...styles.stepsSectionTitle,
            fontSize: `${1.1 * chromeScale}rem`,
        },
        // Scale down messages
        errorMessage: {
            ...styles.errorMessage,
            padding: `${8 * chromeScale}px ${12 * chromeScale}px`,
            fontSize: `${0.85 * chromeScale}rem`,
            marginBottom: `${8 * chromeScale}px`,
        },
        successMessage: {
            ...styles.successMessage,
            padding: `${8 * chromeScale}px ${12 * chromeScale}px`,
            fontSize: `${0.85 * chromeScale}rem`,
            marginBottom: `${8 * chromeScale}px`,
        },
        // Scale down video selection
        videoSelection: {
            ...styles.videoSelection,
            gap: `${6 * chromeScale}px`,
            marginBottom: `${8 * chromeScale}px`,
        },
        videoSelectButton: {
            ...styles.videoSelectButton,
            padding: `${6 * chromeScale}px ${10 * chromeScale}px`,
            fontSize: `${0.8 * chromeScale}rem`,
        },
        videoSelectButtonActive: {
            ...styles.videoSelectButtonActive,
            padding: `${6 * chromeScale}px ${10 * chromeScale}px`,
            fontSize: `${0.8 * chromeScale}rem`,
        },
        // Scale down layout spacing
        videoTimelineLayout: {
            ...styles.videoTimelineLayout,
            gap: `${16 * chromeScale}px`,
        },
        leftPanel: {
            ...styles.leftPanel,
            gap: `${8 * chromeScale}px`,
        },
        rightPanel: {
            ...styles.rightPanel,
            gap: `${12 * chromeScale}px`,
        },
        // Scale down floating save button
        floatingSaveButton: {
            position: 'fixed',
            left: `${20 * chromeScale}px`,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
        },
        floatingSaveButtonInner: {
            padding: `${10 * chromeScale}px ${20 * chromeScale}px`,
            fontSize: `${0.9 * chromeScale}rem`,
            borderRadius: `${20 * chromeScale}px`,
        },
    };
};

const ProjectStepsPage = () => {
    // Initialize state using custom hook
    const state = useCreateStepsState();
    
    // Initialize effects
    useCreateStepsEffects(state);
    
    // Create handlers
    const handlers = createStepHandlers(state);
    
    // Create step actions
    const stepActions = createStepActions(state);

    // Get Chrome-optimized styles
    const chromeStyles = getChromeStyles();

    // Destructure commonly used state values
    const {
        currentUser,
        activeTab,
        currentStepIndex,
        projectName,
        projectId,
        projectSteps,
        uploadedVideos,
        activeVideoIndex,
        activeVideoUrl,
        videoRef,
        errorMessage,
        successMessage,
        setSuccessMessage,
        isStepLoading,
        isLoading,
                    // Tab warning state
        showTabWarning,
        safeSetActiveTab,
        confirmTabSwitch,
        cancelTabSwitch,
        // Current step data
        currentStepName,
        currentStepDescription,
        currentStepStartTime,
        currentStepEndTime,
        currentCautionaryNotes,
        currentBestPracticeNotes,
        currentStepValidationQuestion,
        currentStepValidationAnswer,
        // Annotation data
        currentStepAnnotations,
        setErrorMessage,
        // Tools data
        currentStepTools,
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
        toolImageInputRef,
        // Materials data
        currentStepMaterials,
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
        materialImageInputRef,
        // Files data
        currentStepSupFiles,
        currentStepSupFileName,
        setCurrentStepSupFileName,
        supFileInputRef,
        currentStepResultImageFile,
        currentStepResultImage,
        resultImageInputRef,
        // Buy list data
        projectBuyList,
        // Add missing captured annotation frames
        capturedAnnotationFrames,
        setCapturedAnnotationFrames,
        setSuccessMessage: setSuccessMessageState,
        // Annotation popup state
        isAnnotationPopupOpen,
        setIsAnnotationPopupOpen,
        location,
        navigate,
        playing,
        setPlaying
    } = state;
    
    // Function to delete unsaved project
    const deleteUnsavedProject = useCallback(async () => {
        if (!projectId || !currentUser) return;
        
        try {
            console.log('Deleting unsaved project:', projectId);
            
            const response = await fetch(`${getApiUrl()}/projects/${projectId}?firebase_uid=${currentUser.uid}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (response.ok) {
                console.log('Unsaved project deleted successfully');
                // Navigate to projects page
                navigate('/videos');
            } else {
                console.error('Failed to delete unsaved project');
            }
        } catch (error) {
            console.error('Error deleting unsaved project:', error);
        }
    }, [projectId, currentUser, navigate]);
    
    // Add cleanup effect for unsaved projects
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            // Only show warning if project has no steps (new project)
            if (projectSteps.length === 0 && projectId) {
                e.preventDefault();
                e.returnValue = 'You have an unsaved project. Are you sure you want to leave?';
                return e.returnValue;
            }
        };
        
        const handlePopState = (e) => {
            // Only show warning if project has no steps (new project)
            if (projectSteps.length === 0 && projectId) {
                const confirmed = window.confirm('You have an unsaved project. Are you sure you want to leave? This will delete the project.');
                if (confirmed) {
                    // Delete the project before navigating away
                    deleteUnsavedProject();
                } else {
                    // Prevent navigation
                    window.history.pushState(null, '', window.location.href);
                }
            }
        };
        
        // Add event listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);
        
        // Cleanup function
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [projectSteps.length, projectId, deleteUnsavedProject]);

    // Chrome-specific layout adjustments
    const isChrome = navigator.userAgent.includes('Chrome');

    // State for scrollable tabs
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const tabsContainerRef = useRef(null);

    // State for resizable panels
    const [leftPanelWidth, setLeftPanelWidth] = useState(isChrome ? 0.48 : 0.45);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragStartWidth, setDragStartWidth] = useState(0);
    
    // State for video current time
    const [currentVideoTime, setCurrentVideoTime] = useState(0);
    
    // Minimum and maximum panel widths (as percentages)
    const MIN_LEFT_PANEL_WIDTH = 0.25; // 25% minimum
    const MAX_LEFT_PANEL_WIDTH = 0.75; // 75% maximum

    // Check if tabs need scrolling
    useEffect(() => {
        const checkScrollNeeded = () => {
            if (tabsContainerRef.current) {
                const container = tabsContainerRef.current;
                const scrollWidth = container.scrollWidth;
                const clientWidth = container.clientWidth;
                
                // Always show arrows if content could potentially overflow
                const shouldShowLeft = scrollPosition > 0;
                const shouldShowRight = scrollWidth > clientWidth;
                
                console.log('Tab scroll check:', { scrollWidth, clientWidth, scrollPosition, shouldShowLeft, shouldShowRight });
                
                setShowLeftArrow(shouldShowLeft);
                setShowRightArrow(shouldShowRight || scrollWidth > clientWidth + 10); // Add small buffer
            }
        };

        checkScrollNeeded();
        window.addEventListener('resize', checkScrollNeeded);
        return () => window.removeEventListener('resize', checkScrollNeeded);
    }, [scrollPosition]);

    // Scroll handlers
    const scrollLeft = () => {
        if (tabsContainerRef.current) {
            tabsContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (tabsContainerRef.current) {
            tabsContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    // Handle scroll event
    const handleScroll = (e) => {
        setScrollPosition(e.target.scrollLeft);
    };

    // Add CSS for hiding scrollbar
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .scrollbar-hide::-webkit-scrollbar {
                display: none;
            }
            .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    // Panel resize handlers
    const handleDragStart = (e) => {
        setIsDragging(true);
        setDragStartX(e.clientX);
        setDragStartWidth(leftPanelWidth);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    };

    const handleDragMove = useCallback((e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - dragStartX;
        const containerWidth = window.innerWidth;
        const deltaPercent = deltaX / containerWidth;
        
        let newWidth = dragStartWidth + deltaPercent;
        newWidth = Math.max(MIN_LEFT_PANEL_WIDTH, Math.min(MAX_LEFT_PANEL_WIDTH, newWidth));
        
        setLeftPanelWidth(newWidth);
    }, [isDragging, dragStartX, dragStartWidth]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    // Add global mouse event listeners for dragging
    useEffect(() => {
        if (isDragging) {
            const handleMouseMove = handleDragMove;
            const handleMouseUp = handleDragEnd;
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragStartX, dragStartWidth, handleDragMove, handleDragEnd]);

    // Update current video time with smooth cross-browser updates
    useEffect(() => {
        const player = videoRef.current;
        if (!player) return;

        // The onProgress prop of ReactPlayer handles time updates.
        // We can keep this effect for other potential interactions if needed,
        // but the core time update logic is now handled by onProgress.
        
        // Example of how you might handle other events if necessary in the future:
        const handlePlay = () => {
            console.log('Video started playing');
        };

        const handlePause = () => {
            console.log('Video paused');
        };

        // ReactPlayer doesn't directly expose event listeners on the component itself.
        // Instead, you pass callbacks as props, like onPlay, onPause, onEnded, etc.
        // For this reason, the old addEventListener logic is no longer needed.
        
        // If you need to add listeners for specific events, you would pass them to ReactPlayer:
        // <ReactPlayer 
        //   ...
        //   onPlay={handlePlay}
        //   onPause={handlePause} 
        // />

    }, [videoRef, activeVideoUrl]);

    // Enhanced handlers with utilities
    const enhancedHandlers = {
        ...handlers,
        navigateFrame: (direction) => navigateFrame(videoRef, direction, setPlaying),
        captureFrameForAnnotation: () => captureFrameForAnnotation(
            videoRef,
            state.setFrameForAnnotation,
            state.setFrameTimestampMs,
            state.setCurrentStepAnnotations,
            state.setCurrentAnnotationTool,
            state.setErrorMessage,
            setCapturedAnnotationFrames,
            setSuccessMessageState,
            formatTime,
            setIsAnnotationPopupOpen
        ),
        handleAddStep: () => stepActions.handleAddStep({
            currentStepName,
            currentStepDescription,
            currentStepStartTime,
            currentStepEndTime,
            currentCautionaryNotes,
            currentBestPracticeNotes,
            currentStepAnnotations,
            currentStepTools,
            currentStepMaterials,
            currentStepSupFiles,
            currentStepValidationQuestion,
            currentStepValidationAnswer,
            currentStepResultImageFile
        }),
        handleFinishProject: () => stepActions.handleFinishProject(projectName, capturedAnnotationFrames),
        removeAnnotation: (annotationId) => {
            state.setCurrentStepAnnotations(prev => 
                prev.filter(ann => {
                    // Handle both database structure and local structure
                    const id = ann.annotation_id || ann.data?.id;
                    return id !== annotationId;
                })
            );
        },
        onEditStep: (step, index) => {
            stepActions.loadStepForEditing(step, index);
            state.setActiveTab('details');
            setSuccessMessageState(`Loaded step "${step.name}" for editing`);
            setTimeout(() => setSuccessMessageState(''), 2000);
        },
        onEditAnnotation: async (annotation) => {
            // Handle both database structure and local structure
            const timestamp = annotation.frame_timestamp_ms || annotation.data?.frame_timestamp_ms;
            if (!timestamp) {
                state.setErrorMessage("Cannot edit annotation: missing timestamp");
            return;
        }

            setSuccessMessageState("Loading annotation frame...");

            // Check if we have the captured frame for this timestamp
            let frameFile = capturedAnnotationFrames[timestamp];
            
            // If frame not available, try to download it from Firebase if we have the path
            if (!frameFile) {
                // Check multiple possible paths for the frame image
                const framePath = annotation.frame_image_file?.file_key || 
                                annotation.frame_image_path ||
                                annotation.data?.frame_image_path;
                
                if (framePath) {
                    try {
                        const { downloadFirebaseFileAsFileObject } = await import('./createsteps helpers/CreateStepsUtils');
                        frameFile = await downloadFirebaseFileAsFileObject(
                            framePath, 
                            `frame_${timestamp}.jpg`
                        );
                        
                        if (frameFile) {
                            // Store it for future use
                    setCapturedAnnotationFrames(prev => ({ ...prev, [timestamp]: frameFile }));
                            setSuccessMessageState("Frame downloaded successfully");
                        }
                    } catch (error) {
                        console.error("Error downloading frame:", error);
                    }
                }
            }

            if (!frameFile) {
                state.setErrorMessage(`Cannot edit annotation: frame at ${formatTime(timestamp / 1000)} not available. Try re-capturing this frame by navigating to that time in the video and clicking "Capture Frame".`);
            return;
        }

            // Convert the file back to a data URL for display
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataURL = e.target.result;
                
                // Set up the annotation editing state
                state.setFrameForAnnotation(dataURL);
                state.setFrameTimestampMs(timestamp);
                
                // Open the annotation popup for editing
                state.setIsAnnotationPopupOpen(true);
                
                setSuccessMessageState(`Editing annotations for frame at ${formatTime(timestamp / 1000)}`);
                setTimeout(() => setSuccessMessageState(''), 2000);
            };
            
            reader.onerror = () => {
                state.setErrorMessage("Error loading frame for editing");
            };
            
            reader.readAsDataURL(frameFile);
        }
    };

    // Expose functions and state to global window for sidebar access
    useEffect(() => {
        window.handleAddStep = enhancedHandlers.handleAddStep;
        window.handleRegenerateStep = stepActions.handleRegenerateStep;
        window.isStepLoading = isStepLoading;
        window.currentStepName = currentStepName;
        window.currentStepDescription = currentStepDescription;
        window.currentStepStartTime = currentStepStartTime;
        window.currentStepEndTime = currentStepEndTime;
        window.currentStepIndex = currentStepIndex;
        window.projectSteps = projectSteps;
        
        // Debug logging to help track the issue
        console.log('Window currentStepIndex updated:', currentStepIndex);
        
        return () => {
            delete window.handleAddStep;
            delete window.handleRegenerateStep;
            delete window.isStepLoading;
            delete window.currentStepName;
            delete window.currentStepDescription;
            delete window.currentStepStartTime;
            delete window.currentStepEndTime;
            delete window.currentStepIndex;
            delete window.projectSteps;
        };
    }, [enhancedHandlers.handleAddStep, stepActions.handleRegenerateStep, isStepLoading, currentStepName, currentStepDescription, currentStepStartTime, currentStepEndTime, currentStepIndex, projectSteps]);

    // Get missing fields for warning message
    const getMissingFields = () => {
        if (currentStepIndex === -1) return [];
        
        const missing = [];
        switch (activeTab) {
            case 'details':
                if (!currentStepName.trim()) missing.push('Step Name');
                if (!currentStepDescription.trim()) missing.push('Step Description');
                if (currentStepStartTime === null) missing.push('Start Time');
                if (currentStepEndTime === null) missing.push('End Time');
                break;
            case 'signoff':
                if (!currentCautionaryNotes.trim()) missing.push('Cautionary Notes');
                if (!currentBestPracticeNotes.trim()) missing.push('Best Practice Notes');
                if (!currentStepValidationQuestion.trim()) missing.push('Validation Question');
                if (!currentStepValidationAnswer.trim()) missing.push('Validation Answer');
                break;
            default:
                // Other tabs are optional, no validation needed
                break;
        }
        return missing;
    };

    // Early returns for loading/error states
    if (!currentUser) return <div style={chromeStyles.pageContainer}><div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        gap: 16,
    }}><AnimatedLogo size={80} /><div style={{ marginTop: 16, fontSize: 20, fontWeight: 600, color: '#D9D9D9', letterSpacing: 1 }}>Loading...</div></div></div>;
    if (errorMessage && uploadedVideos.length === 0 && !location.state?.uploadedVideos) {
         return (
             <div style={chromeStyles.pageContainer}>
                 <p style={chromeStyles.errorMessage}>
                     {errorMessage} 
                     <button 
                         onClick={() => {
                             if (projectSteps.length === 0 && projectId) {
                                 // Always delete project when going back to home with no steps
                                 deleteUnsavedProject();
                             } else {
                                 navigate(-1);
                             }
                         }} 
                         style={{...chromeStyles.backLink, marginLeft: '10px'}}
                     >
                         Go Back
                     </button>
                 </p>
             </div>
         );
    }

    return (
        <div style={{
            ...styles.videoTimelineContainer,
            ...(activeTab !== 'repository' && activeTab !== 'finalize' && activeTab !== 'overview' && styles.contentPadding),
            // Add bottom padding to prevent content from being covered by floating timeline
            paddingBottom: activeTab !== 'repository' && activeTab !== 'finalize' && activeTab !== 'overview' ? '180px' : '20px'
        }}>
                {/* Header */}
            <header style={chromeStyles.header}>
                <h1 style={chromeStyles.pageTitle}>
                    {activeTab === 'repository' ? 'Repository Management' : 
                     activeTab === 'finalize' ? 'Finalize Project' :
                     activeTab === 'overview' ? 'Project Overview' :
                     `Authoring: ${projectName || `Project ${projectId}`}`}
                </h1>
                    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                        {currentStepIndex >= 0 && activeTab !== 'repository' && activeTab !== 'finalize' && (
                            <span style={{color: '#6b7280', fontSize: '0.9rem'}}>
                                Editing Step {currentStepIndex + 1}
                            </span>
                        )}
                    </div>
            </header>

            {/* Error and success messages */}
            {errorMessage && <div role="alert" style={chromeStyles.errorMessage}>{errorMessage}</div>}
            {successMessage && <div role="alert" style={chromeStyles.successMessage} onClick={()=>setSuccessMessage('')}>{successMessage} (click to dismiss)</div>}

            {/* Tab Warning Modal */}
            {showTabWarning && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                }}>
                    <div style={{
                        backgroundColor: '#111111',
                        border: '2px solid #F1C232',
                        borderRadius: '12px',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '90%',
                        color: '#D9D9D9',
                    }}>
                        <h3 style={{
                            color: '#F1C232',
                            marginBottom: '1rem',
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                        }}>
                            ⚠️ Incomplete Step Information
                        </h3>
                        <p style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
                            You have incomplete required fields in the <strong>{activeTab === 'details' ? 'Step Details' : activeTab === 'signoff' ? 'Sign Off' : activeTab}</strong> tab:
                        </p>
                        <ul style={{
                            marginBottom: '1.5rem',
                            paddingLeft: '1.5rem',
                            color: '#ef4444',
                        }}>
                            {getMissingFields().map((field, index) => (
                                <li key={index} style={{ marginBottom: '0.5rem' }}>• {field}</li>
                            ))}
                        </ul>
                        <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#9ca3af' }}>
                            Your changes won't be lost, but it's recommended to complete all required fields before proceeding.
                        </p>
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'flex-end',
                        }}>
                            <button
                                onClick={cancelTabSwitch}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#6b7280',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
                            >
                                Stay on Current Tab
                            </button>
                            <button
                                onClick={confirmTabSwitch}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#F1C232',
                                    color: '#000000',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#E6B800'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#F1C232'}
                            >
                                Continue Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main content area - conditional layout */}
            {activeTab === 'finalize' ? (
                // Finalize page - dedicated layout
                <div style={chromeStyles.finalizeContainer}>
                    <FinalizeTab 
                        projectSteps={projectSteps}
                        projectBuyList={projectBuyList}
                        handleFinishProject={enhancedHandlers.handleFinishProject}
                        isLoading={isLoading}
                        formatTime={formatTime}
                        styles={styles}
                        setProjectBuyList={state.setProjectBuyList}
                        projectId={projectId}
                    />
                </div>
            ) : activeTab === 'repository' ? (
                // Repository page - dedicated layout
                <div style={chromeStyles.finalizeContainer}>
                    <ProjectRepositoryTab 
                        styles={chromeStyles}
                        onRepositoryUpdate={() => state.setRepositoryRefreshTrigger(prev => prev + 1)}
                    />
                </div>
            ) : activeTab === 'overview' ? (
                // Overview page - dedicated layout
                <div style={chromeStyles.finalizeContainer}>
                    <ProjectOverviewTab 
                        projectSteps={projectSteps}
                        projectBuyList={projectBuyList}
                        formatTime={formatTime}
                        onEditStep={enhancedHandlers.onEditStep}
                        onDeleteStep={(index) => {
                            stepActions.deleteStep(index);
                            setSuccessMessage(`Step deleted successfully!`);
                            setTimeout(() => setSuccessMessage(''), 3000);
                        }}
                        styles={chromeStyles}
                    />
                </div>
            ) : (
                // New layout with StepsSidebar
                <div className="flex h-screen">
                    {/* Left side - Tabs and controls */}
                    <div
                        className="bg-black border-r border-gray-800 flex flex-col"
                        style={{ 
                            flex: leftPanelWidth, 
                            minWidth: `${MIN_LEFT_PANEL_WIDTH * 100}%`,
                            maxWidth: `${MAX_LEFT_PANEL_WIDTH * 100}%`
                        }}
                    >
                        {/* Tab navigation */}
                        <div className="relative border-b border-gray-800">
                            {/* Left arrow */}
                            <button
                                onClick={scrollLeft}
                                className={`absolute left-0 top-0 bottom-0 z-20 bg-black bg-opacity-90 hover:bg-opacity-100 text-white px-3 flex items-center justify-center transition-all duration-200 ${
                                    showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                }`}
                                style={{ 
                                    minWidth: '36px',
                                    boxShadow: '2px 0 4px rgba(0,0,0,0.5)'
                                }}
                                title="Scroll left"
                            >
                                ◀
                            </button>
                            
                            {/* Right arrow */}
                            <button
                                onClick={scrollRight}
                                className={`absolute right-0 top-0 bottom-0 z-20 bg-black bg-opacity-90 hover:bg-opacity-100 text-white px-3 flex items-center justify-center transition-all duration-200 ${
                                    showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                }`}
                                style={{ 
                                    minWidth: '36px',
                                    boxShadow: '-2px 0 4px rgba(0,0,0,0.5)'
                                }}
                                title="Scroll right"
                            >
                                ▶
                            </button>
                            
                            {/* Scrollable tabs container */}
                            <div 
                                ref={tabsContainerRef}
                                onScroll={handleScroll}
                                className="flex overflow-x-auto scrollbar-hide"
                                style={{ 
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    paddingLeft: showLeftArrow ? '32px' : '0',
                                    paddingRight: showRightArrow ? '32px' : '0'
                                }}
                            >
                                <button 
                                    onClick={() => safeSetActiveTab('details')}
                                    className={`flex-shrink-0 py-3 px-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                        activeTab === 'details' 
                                            ? 'text-black bg-[#F1C232] border-b-2 border-[#0000FF]' 
                                            : 'text-[#D9D9D9] hover:bg-gray-800'
                                    }`}
                                >
                                    Step Details
                                </button>
                                <button 
                                    onClick={() => safeSetActiveTab('materials')}
                                    className={`flex-shrink-0 py-3 px-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                        activeTab === 'materials' 
                                            ? 'text-black bg-[#F1C232] border-b-2 border-[#0000FF]' 
                                            : 'text-[#D9D9D9] hover:bg-gray-800'
                                    }`}
                                >
                                    Step Materials
                                </button>
                                <button 
                                    onClick={() => safeSetActiveTab('files')}
                                    className={`flex-shrink-0 py-3 px-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                        activeTab === 'files' 
                                            ? 'text-black bg-[#F1C232] border-b-2 border-[#0000FF]' 
                                            : 'text-[#D9D9D9] hover:bg-gray-800'
                                    }`}
                                >
                                    Files
                                </button>
                                <button 
                                    onClick={() => safeSetActiveTab('result')}
                                    className={`flex-shrink-0 py-3 px-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                        activeTab === 'result' 
                                            ? 'text-black bg-[#F1C232] border-b-2 border-[#0000FF]' 
                                            : 'text-[#D9D9D9] hover:bg-gray-800'
                                    }`}
                                >
                                    Result
                                </button>
                                <button 
                                    onClick={() => safeSetActiveTab('signoff')}
                                    className={`flex-shrink-0 py-3 px-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                        activeTab === 'signoff' 
                                            ? 'text-black bg-[#F1C232] border-b-2 border-[#0000FF]' 
                                            : 'text-[#D9D9D9] hover:bg-gray-800'
                                    }`}
                                >
                                    Sign Off
                                </button>
                            </div>
                        </div>

                        {/* Tab content */}
                        <div className={`flex-1 overflow-y-auto ${isChrome ? 'p-1' : 'p-4'}`} style={{
                            // Add bottom margin to ensure content isn't covered by floating timeline
                            marginBottom: activeTab !== 'repository' && activeTab !== 'finalize' && activeTab !== 'overview' ? '160px' : '0'
                        }}>
                            {activeTab === 'details' && (
                                <StepDetailsTab 
                                    currentStepName={currentStepName}
                                    setCurrentStepName={state.setCurrentStepName}
                                    currentStepDescription={currentStepDescription}
                                    setCurrentStepDescription={state.setCurrentStepDescription}
                                    currentStepStartTime={currentStepStartTime}
                                    currentStepEndTime={currentStepEndTime}
                                    currentStepAnnotations={state.currentStepAnnotations}
                                    formatTime={formatTime}
                                    onEditAnnotation={enhancedHandlers.onEditAnnotation}
                                    styles={chromeStyles}
                                />
                            )}

                            {activeTab === 'materials' && (
                                <MaterialsAndToolsTab 
                                    // Tools props
                                    currentStepTools={currentStepTools}
                                    currentStepToolName={currentStepToolName}
                                    setCurrentStepToolName={setCurrentStepToolName}
                                    currentStepToolSpec={currentStepToolSpec}
                                    setCurrentStepToolSpec={setCurrentStepToolSpec}
                                    currentStepToolImageFile={currentStepToolImageFile}
                                    setCurrentStepToolImageFile={setCurrentStepToolImageFile}
                                    currentStepToolPurchaseLink={currentStepToolPurchaseLink}
                                    setCurrentStepToolPurchaseLink={setCurrentStepToolPurchaseLink}
                                    currentStepToolQuantity={currentStepToolQuantity}
                                    setCurrentStepToolQuantity={setCurrentStepToolQuantity}
                                    toolImageInputRef={toolImageInputRef}
                                    handleAddToolToCurrentStep={enhancedHandlers.handleAddToolToCurrentStep}
                                    removeToolFromCurrentStep={enhancedHandlers.removeToolFromCurrentStep}
                                    // Add direct state setters for repository items
                                    setCurrentStepTools={state.setCurrentStepTools}
                                    setCurrentStepMaterials={state.setCurrentStepMaterials}
                                    // Materials props
                                    currentStepMaterials={currentStepMaterials}
                                    currentStepMaterialName={currentStepMaterialName}
                                    setCurrentStepMaterialName={setCurrentStepMaterialName}
                                    currentStepMaterialSpec={currentStepMaterialSpec}
                                    setCurrentStepMaterialSpec={setCurrentStepMaterialSpec}
                                    currentStepMaterialImageFile={currentStepMaterialImageFile}
                                    setCurrentStepMaterialImageFile={setCurrentStepMaterialImageFile}
                                    currentStepMaterialPurchaseLink={currentStepMaterialPurchaseLink}
                                    setCurrentStepMaterialPurchaseLink={setCurrentStepMaterialPurchaseLink}
                                    currentStepMaterialQuantity={currentStepMaterialQuantity}
                                    setCurrentStepMaterialQuantity={setCurrentStepMaterialQuantity}
                                    materialImageInputRef={materialImageInputRef}
                                    handleAddMaterialToCurrentStep={enhancedHandlers.handleAddMaterialToCurrentStep}
                                    removeMaterialFromCurrentStep={enhancedHandlers.removeMaterialFromCurrentStep}
                                    // Repository refresh trigger
                                    repositoryRefreshTrigger={state.repositoryRefreshTrigger}
                                    styles={chromeStyles}
                                />
                            )}

                            {activeTab === 'files' && (
                                <FilesTab 
                                    currentStepSupFiles={currentStepSupFiles}
                                    currentStepSupFileName={currentStepSupFileName}
                                    setCurrentStepSupFileName={setCurrentStepSupFileName}
                                    supFileInputRef={supFileInputRef}
                                    handleSupFileChange={enhancedHandlers.handleSupFileChange}
                                    removeSupFileFromCurrentStep={enhancedHandlers.removeSupFileFromCurrentStep}
                                    styles={chromeStyles}
                                />
                            )}

                            {activeTab === 'result' && (
                                <ResultTab 
                                    currentStepResultImage={currentStepResultImage}
                                    currentStepResultImageFile={currentStepResultImageFile}
                                    handleResultImageChange={enhancedHandlers.handleResultImageChange}
                                    resultImageInputRef={resultImageInputRef}
                                    styles={chromeStyles}
                                />
                            )}

                            {activeTab === 'signoff' && (
                                <SignOffTab 
                                    currentCautionaryNotes={currentCautionaryNotes}
                                    setCurrentCautionaryNotes={state.setCurrentCautionaryNotes}
                                    currentBestPracticeNotes={currentBestPracticeNotes}
                                    setBestPracticeNotes={state.setCurrentBestPracticeNotes}
                                    currentStepValidationQuestion={currentStepValidationQuestion}
                                    setCurrentStepValidationQuestion={state.setCurrentStepValidationQuestion}
                                    currentStepValidationAnswer={currentStepValidationAnswer}
                                    setCurrentStepValidationAnswer={state.setCurrentStepValidationAnswer}
                                    styles={chromeStyles}
                                />
                            )}
                        </div>
                    </div>

                    {/* Draggable divider */}
                    <div
                        className="w-1 bg-gray-700 hover:bg-[#F1C232] cursor-col-resize transition-colors duration-200 relative"
                        onMouseDown={handleDragStart}
                        style={{
                            backgroundColor: isDragging ? '#F1C232' : '#374151',
                            cursor: 'col-resize',
                            marginLeft: '4px',
                            marginRight: '4px'
                        }}
                        title="Drag to resize panels"
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-0.5 h-8 bg-gray-500 rounded-full opacity-50"></div>
                        </div>
                    </div>

                    {/* Center - Video content */}
                    <div
                        className={`bg-black flex flex-col ${state.isStepsSidebarCollapsed ? 'mr-12' : 'mr-64'}`}
                        style={{ 
                            flex: 1 - leftPanelWidth, 
                            minWidth: `${(1 - MAX_LEFT_PANEL_WIDTH) * 100}%`,
                            padding: isChrome ? '2px 1px 0 1px' : '20px 16px 0 16px'
                        }}
                    >
                        {/* Video section */}
                        <div className="flex-1" style={isChrome ? { padding: 0 } : {}}>
                            {uploadedVideos.length > 0 && activeVideoUrl ? (
                                <div className="h-full flex flex-col">
                                    {/* Video selection */}
                                    {uploadedVideos.length > 1 && (
                                        <div className="flex gap-2 mb-4 flex-wrap">
                                            {uploadedVideos.map((video, index) => (
                                                <button 
                                                    key={video.path || index} 
                                                    onClick={() => enhancedHandlers.handleVideoSelection(index)}
                                                    className={`px-3 py-1 text-sm font-medium border rounded-md transition-all duration-200 ${
                                                        activeVideoIndex === index 
                                                            ? 'bg-[#0000FF] text-[#D9D9D9] border-[#0000FF]' 
                                                            : 'bg-black text-[#D9D9D9] border-[#D9D9D9] hover:bg-gray-800'
                                                    }`}
                                                >
                                                    Video {index + 1}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Video player */}
                                    <div className="player-wrapper">
                                        <ReactPlayer
                                            ref={videoRef}
                                            className="react-player"
                                            url={activeVideoUrl}
                                            width="100%"
                                            height="100%"
                                            controls
                                            playing={playing}
                                            onPlay={() => setPlaying(true)}
                                            onPause={() => setPlaying(false)}
                                            config={{
                                                file: {
                                                    attributes: {
                                                        crossOrigin: 'anonymous'
                                                    }
                                                }
                                            }}
                                            onProgress={({ played, playedSeconds }) => setCurrentVideoTime(playedSeconds)}
                                            onError={(e) => {
                                                console.error("Video Error:", e);
                                                console.error("Failed video URL:", activeVideoUrl);
                                                setErrorMessage(`Error loading video: ${uploadedVideos[activeVideoIndex]?.name || 'Unknown video'}`);
                                            }}
                                        />
                                    </div>
                                    
                                    {/* Video controls below video */}
                                    <div className="border-t border-gray-800 pt-4">
                                        <div className="flex gap-2 mb-4 flex-wrap">
                                            <button 
                                                onClick={() => enhancedHandlers.navigateFrame('backward')} 
                                                className="px-3 py-2 text-sm bg-[#0000FF] text-[#D9D9D9] rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                ◀ Frame
                                            </button>
                                            <button 
                                                onClick={() => enhancedHandlers.navigateFrame('forward')} 
                                                className="px-3 py-2 text-sm bg-[#0000FF] text-[#D9D9D9] rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                Frame ▶
                                            </button>
                                            <button 
                                                onClick={enhancedHandlers.captureFrameForAnnotation} 
                                                className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                            >
                                                Capture Frame
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (videoRef.current) {
                                                        const currentTime = videoRef.current.getCurrentTime();
                                                        state.setCurrentStepStartTime(currentTime);
                                                    }
                                                }}
                                                className="px-3 py-2 text-sm bg-[#F1C232] text-black rounded-md hover:bg-yellow-600 transition-colors"
                                            >
                                                Mark Start
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (videoRef.current) {
                                                        const currentTime = videoRef.current.getCurrentTime();
                                                        if (state.currentStepStartTime !== null && currentTime <= state.currentStepStartTime) {
                                                            return;
                                                        }
                                                        state.setCurrentStepEndTime(currentTime);
                                                    }
                                                }}
                                                className="px-3 py-2 text-sm bg-[#0000FF] text-[#D9D9D9] rounded-md hover:bg-blue-700 transition-colors"
                                            >
                                                Mark End
                                            </button>
                                            <button
                                                onClick={() => {
                                                    state.setCurrentStepStartTime(null);
                                                    state.setCurrentStepEndTime(null);
                                                }}
                                                className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                        
                                        {/* Current time and timing info */}
                                        <div className="flex gap-4">
                                            <div className="p-3 bg-gray-800 rounded-lg">
                                                <h3 className="text-[#F1C232] font-semibold mb-2">Current Time</h3>
                                                <p className="text-white text-lg">
                                                    {formatTime(currentVideoTime)}
                                                </p>
                                            </div>
                                            
                                            {(currentStepStartTime !== null || currentStepEndTime !== null) && (
                                                <div className="p-3 bg-gray-800 rounded-lg">
                                                    <h3 className="text-[#F1C232] font-semibold mb-2">Step Timing</h3>
                                                    <div className="space-y-1 text-sm">
                                                        {currentStepStartTime !== null && (
                                                            <p className="text-white">
                                                                Start: {formatTime(currentStepStartTime)}
                                                            </p>
                                                        )}
                                                        {currentStepEndTime !== null && (
                                                            <p className="text-white">
                                                                End: {formatTime(currentStepEndTime)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-[#D9D9D9]">
                                    <p>No videos available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Steps Sidebar */}
                    <StepsSidebar
                        isCollapsed={state.isStepsSidebarCollapsed}
                        toggleStepsSidebar={() => state.setIsStepsSidebarCollapsed(!state.isStepsSidebarCollapsed)}
                        projectSteps={projectSteps}
                        currentStepIndex={currentStepIndex}
                        onStepClick={(step, index) => {
                            window.currentStepIndex = index;
                            window.dispatchEvent(new Event('stepIndexChanged'));
                            stepActions.loadStepForEditing(step, index);
                            // Switch to details tab to show the Update Step button
                            state.setActiveTab('details');
                            setSuccessMessage(`Loaded step "${step.name}" for editing`);
                            setTimeout(() => setSuccessMessage(''), 2000);
                        }}
                        onAddStep={stepActions.addNewStep}
                        onDeleteStep={(index) => {
                            const step = projectSteps[index];
                            if (window.confirm(`Are you sure you want to delete "Step ${index + 1}: ${step.name}"? This action cannot be undone.`)) {
                                stepActions.deleteStep(index);
                                setSuccessMessage(`Step "${step.name}" deleted successfully!`);
                                setTimeout(() => setSuccessMessage(''), 3000);
                            }
                        }}
                        formatTime={formatTime}
                    />
                </div>
            )}
            


            {/* Annotation Popup */}
            <AnnotationPopup
                isOpen={isAnnotationPopupOpen}
                onClose={() => setIsAnnotationPopupOpen(false)}
                frameForAnnotation={state.frameForAnnotation}
                frameTimestampMs={state.frameTimestampMs}
                currentStepAnnotations={state.currentStepAnnotations}
                currentAnnotationTool={state.currentAnnotationTool}
                setCurrentAnnotationTool={state.setCurrentAnnotationTool}
                handleAnnotationSubmit={handlers.handleAnnotationSubmit}
                removeAnnotation={enhancedHandlers.removeAnnotation}
                handleClearAnnotations={handlers.handleClearAnnotations}
                formatTime={formatTime}
                styles={chromeStyles}
            />
            
            {/* Floating Timeline - always visible on video steps page */}
            {activeTab !== 'repository' && activeTab !== 'finalize' && activeTab !== 'overview' && !isAnnotationPopupOpen && (
                <FloatingTimeline
                    videoRef={videoRef}
                    projectSteps={projectSteps}
                    currentVideoTime={currentVideoTime}
                    currentStepStartTime={currentStepStartTime}
                    currentStepEndTime={currentStepEndTime}
                    setCurrentStepStartTime={state.setCurrentStepStartTime}
                    setCurrentStepEndTime={state.setCurrentStepEndTime}
                    formatTime={formatTime}
                    styles={chromeStyles}
                    isVisible={true}
                    isStepsSidebarCollapsed={state.isStepsSidebarCollapsed}
                    onStepClick={(step, index) => {
                        // Update global step index for sidebar
                        window.currentStepIndex = index;
                        window.dispatchEvent(new Event('stepIndexChanged'));
                        // Load step for editing
                        stepActions.loadStepForEditing(step, index);
                        // Switch to details tab
                        state.setActiveTab('details');
                        // Show success message
                        setSuccessMessage(`Loaded step "${step.name}" for editing`);
                        setTimeout(() => setSuccessMessage(''), 2000);
                    }}
                />
            )}
        </div>
    );
};

export default ProjectStepsPage;