// CreateSteps.js - Refactored CreateSteps component using modular files
import React, { useEffect } from 'react';

// Import modular components
import { useCreateStepsState, useCreateStepsEffects } from './createsteps helpers/CreateStepsHooks';
import { createStepHandlers } from './createsteps helpers/CreateStepsHandlers';
import { createStepActions } from './createsteps helpers/CreateStepsActions';
import { styles } from './createsteps helpers/CreateStepsStyles';
import { formatTime, navigateFrame, captureFrameForAnnotation } from './createsteps helpers/CreateStepsUtils';
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
            padding: `${12 * chromeScale}px`,
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
        navigate
    } = state;

    // Enhanced handlers with utilities
    const enhancedHandlers = {
        ...handlers,
        navigateFrame: (direction) => navigateFrame(videoRef, direction),
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
        window.isStepLoading = isStepLoading;
        window.currentStepName = currentStepName;
        window.currentStepDescription = currentStepDescription;
        window.currentStepStartTime = currentStepStartTime;
        window.currentStepEndTime = currentStepEndTime;
        window.currentStepIndex = currentStepIndex;
        
        return () => {
            delete window.handleAddStep;
            delete window.isStepLoading;
            delete window.currentStepName;
            delete window.currentStepDescription;
            delete window.currentStepStartTime;
            delete window.currentStepEndTime;
            delete window.currentStepIndex;
        };
    }, [enhancedHandlers.handleAddStep, isStepLoading, currentStepName, currentStepDescription, currentStepStartTime, currentStepEndTime, currentStepIndex]);

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
    if (errorMessage && uploadedVideos.length === 0 && !location.state) {
         return <div style={chromeStyles.pageContainer}><p style={chromeStyles.errorMessage}>{errorMessage} <button onClick={() => navigate(-1)} style={{...chromeStyles.backLink, marginLeft: '10px'}}>Go Back</button></p></div>;
    }

    // Chrome-specific layout adjustments
    const isChrome = navigator.userAgent.includes('Chrome');

    return (
        <div style={{
            ...styles.videoTimelineContainer,
            ...(activeTab !== 'repository' && activeTab !== 'finalize' && activeTab !== 'overview' && styles.contentPadding),
            // Chrome-specific adjustments for smaller space
            ...(isChrome && {
                marginLeft: '4rem', // Smaller margin for Chrome
                width: 'calc(100vw - 4rem)', // Adjust width for Chrome
                maxWidth: 'calc(100vw - 4rem)'
            })
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
                // Regular step authoring layout
                <div style={chromeStyles.videoTimelineLayout}>

                {/* Left side - Tabs and controls (2/5ths) */}
                <div style={chromeStyles.leftPanel}>
                    {/* Tab navigation */}
                    <div style={chromeStyles.tabNavigation}>
                        <button 
                            onClick={() => safeSetActiveTab('details')}
                            style={{
                                ...chromeStyles.tabButton,
                                ...(activeTab === 'details' ? chromeStyles.tabButtonActive : {})
                            }}
                        >
                            Step Details
                                        </button>
                        <button 
                            onClick={() => safeSetActiveTab('materials')}
                                style={{
                                ...chromeStyles.tabButton,
                                ...(activeTab === 'materials' ? chromeStyles.tabButtonActive : {})
                            }}
                        >
                            Step Materials
                        </button>
                        <button 
                            onClick={() => safeSetActiveTab('files')}
                            style={{
                                ...chromeStyles.tabButton,
                                ...(activeTab === 'files' ? chromeStyles.tabButtonActive : {})
                            }}
                        >
                            Files
                        </button>
                        <button 
                            onClick={() => safeSetActiveTab('result')}
                            style={{
                                ...chromeStyles.tabButton,
                                ...(activeTab === 'result' ? chromeStyles.tabButtonActive : {})
                            }}
                        >
                            Result
                        </button>
                        <button 
                            onClick={() => safeSetActiveTab('signoff')}
                            style={{
                                ...chromeStyles.tabButton,
                                ...(activeTab === 'signoff' ? chromeStyles.tabButtonActive : {})
                            }}
                        >
                            Sign Off
                        </button>
                            </div>

                {/* Tab content */}
                    <div style={chromeStyles.leftPanelContent}>
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
            
                {/* Right side - Video and steps (3/5ths) */}
                <div style={chromeStyles.rightPanel}>
                    
                    {/* Video section */}
                    <div style={chromeStyles.videoSection}>
                        <div style={chromeStyles.videoContainer}>
                            {uploadedVideos.length > 0 && activeVideoUrl ? (
                                <div>
                                    {/* Video selection */}
                                    {uploadedVideos.length > 1 && (
                                        <div style={chromeStyles.videoSelection}>
                                            {uploadedVideos.map((video, index) => (
                    <button 
                                                    key={video.path || index} 
                                                    onClick={() => enhancedHandlers.handleVideoSelection(index)}
                        style={{
                                                        ...chromeStyles.videoSelectButton,
                                                        ...(activeVideoIndex === index ? chromeStyles.videoSelectButtonActive : {})
                        }}
                    >
                                                    Video {index + 1}
                    </button>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Video player */}
                                    <video 
                                        ref={videoRef} 
                                        key={activeVideoUrl} 
                                        controls 
                                        src={activeVideoUrl} 
                                        crossOrigin="anonymous"
                                        style={chromeStyles.videoPlayer}
                                        onError={(e) => { 
                                            console.error("Video Error:", e);
                                            console.error("Failed video URL:", activeVideoUrl);
                                            setErrorMessage(`Error loading video: ${uploadedVideos[activeVideoIndex]?.name || 'Unknown video'}`); 
                                        }}
                                        onTimeUpdate={(e) => {
                                            // Debug log for current time
                                            if (videoRef.current) {
                                                console.log('Video currentTime:', videoRef.current.currentTime);
                                            }
                                        }}
                                    />
            
                                    {/* Video controls */}
                                    <div style={chromeStyles.videoControls}>
                    <button 
                                            onClick={() => enhancedHandlers.navigateFrame('backward')} 
                                            style={{...chromeStyles.button, ...chromeStyles.buttonSecondarySm}}
                                        >
                                            ◀ Frame
                                        </button>
                                        <button 
                                            onClick={() => enhancedHandlers.navigateFrame('forward')} 
                                            style={{...chromeStyles.button, ...chromeStyles.buttonSecondarySm}}
                                        >
                                            Frame ▶
                                        </button>
                                        <button 
                                            onClick={enhancedHandlers.captureFrameForAnnotation} 
                                            style={{...chromeStyles.button, backgroundColor: '#3498db', color: 'white'}}
                                        >
                                            Capture Frame
                                        </button>
                                        {/* Mark Start/End/Clear buttons */}
                                            <button
                                                onClick={() => {
                                                    if (videoRef.current) {
                                                        const currentTime = videoRef.current.currentTime;
                                                        state.setCurrentStepStartTime(currentTime);
                                                }
                                            }}
                                            style={{...chromeStyles.button, ...chromeStyles.buttonPrimary, marginLeft: 8}}
                                            >
                                                Mark Start
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (videoRef.current) {
                                                        const currentTime = videoRef.current.currentTime;
                                                    if (state.currentStepStartTime !== null && currentTime <= state.currentStepStartTime) {
                                                        return; // End time must be after start time
                                                        }
                                                        state.setCurrentStepEndTime(currentTime);
                                                }
                                            }}
                                            style={{...chromeStyles.button, ...chromeStyles.buttonSecondary, marginLeft: 8}}
                                            >
                                                Mark End
                                            </button>
                                            <button
                                                onClick={() => {
                                                    state.setCurrentStepStartTime(null);
                                                    state.setCurrentStepEndTime(null);
                                                }}
                                            style={{...chromeStyles.button, ...chromeStyles.buttonDanger, marginLeft: 8}}
                                            >
                                                Clear
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={chromeStyles.noVideoMessage}>
                                    <p>No videos available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Steps section */}
                    <div style={chromeStyles.stepsSection}>
                        <div style={chromeStyles.stepsSectionHeader}>
                            <h3 style={chromeStyles.stepsSectionTitle}>Project Steps</h3>
                            <button 
                                onClick={stepActions.addNewStep}
                                style={{...chromeStyles.button, ...chromeStyles.buttonPrimary}}
                            >
                                + Add Step
                            </button>
                        </div>
                        
                        <div style={chromeStyles.stepsList}>
                            {projectSteps.map((step, index) => (
                                <div
                                    key={step.id || `step-${index}`}
                        style={{
                                        ...chromeStyles.stepItem,
                                        ...(currentStepIndex === index ? chromeStyles.stepItemActive : {}),
                                        position: 'relative'
                                    }}
                                >
                                    <div
                                        onClick={() => stepActions.loadStepForEditing(step, index)}
                                        style={{flex: 1, cursor: 'pointer'}}
                                >
                                    <div style={chromeStyles.stepItemHeader}>
                                        <span style={currentStepIndex === index ? chromeStyles.stepItemNumberActive : chromeStyles.stepItemNumber}>Step {index + 1}</span>
                                        <span style={currentStepIndex === index ? chromeStyles.stepItemTimeActive : chromeStyles.stepItemTime}>
                                            {formatTime(step.video_start_time_ms / 1000)} - {formatTime(step.video_end_time_ms / 1000)}
                                        </span>
                                    </div>
                                    <div style={currentStepIndex === index ? chromeStyles.stepItemNameActive : chromeStyles.stepItemName}>{step.name}</div>
                                </div>
                                    
                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm(`Are you sure you want to delete "Step ${index + 1}: ${step.name}"? This action cannot be undone.`)) {
                                                stepActions.deleteStep(index);
                                                setSuccessMessage(`Step "${step.name}" deleted successfully!`);
                                                setTimeout(() => setSuccessMessage(''), 3000);
                                            }
                                        }}
                        style={{
                                            position: 'absolute',
                                            bottom: '8px',
                                            right: '8px',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            opacity: 0.7,
                                            transition: 'opacity 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => e.target.style.opacity = 1}
                                        onMouseLeave={(e) => e.target.style.opacity = 0.7}
                                        title="Delete step"
                                    >
                                        ×
                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
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
                    currentStepStartTime={currentStepStartTime}
                    currentStepEndTime={currentStepEndTime}
                    setCurrentStepStartTime={state.setCurrentStepStartTime}
                    setCurrentStepEndTime={state.setCurrentStepEndTime}
                    formatTime={formatTime}
                    styles={chromeStyles}
                    isVisible={true}
                />
            )}
        </div>
    );
};

export default ProjectStepsPage;