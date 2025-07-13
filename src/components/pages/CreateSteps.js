// CreateSteps.js - Refactored CreateSteps component using modular files
import React from 'react';

// Import modular components
import { useCreateStepsState, useCreateStepsEffects } from './createsteps helpers/CreateStepsHooks';
import { createStepHandlers } from './createsteps helpers/CreateStepsHandlers';
import { createStepActions } from './createsteps helpers/CreateStepsActions';
import { styles } from './createsteps helpers/CreateStepsStyles';
import { formatTime, navigateFrame, captureFrameForAnnotation } from './createsteps helpers/CreateStepsUtils';

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

const ProjectStepsPage = () => {
    // Initialize state using custom hook
    const state = useCreateStepsState();
    
    // Initialize effects
    useCreateStepsEffects(state);
    
    // Create handlers
    const handlers = createStepHandlers(state);
    
    // Create step actions
    const stepActions = createStepActions(state);

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
        buyListImageInputRef,
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

    // Early returns for loading/error states
    if (!currentUser) return <div style={styles.pageContainer}><p>Loading...</p></div>;
    if (errorMessage && uploadedVideos.length === 0 && !location.state) {
         return <div style={styles.pageContainer}><p style={styles.errorMessage}>{errorMessage} <button onClick={() => navigate(-1)} style={{...styles.backLink, marginLeft: '10px'}}>Go Back</button></p></div>;
    }

    return (
        <div style={styles.videoTimelineContainer}>
                {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.pageTitle}>
                    {activeTab === 'repository' ? 'Repository Management' : 
                     activeTab === 'finalize' ? 'Finalize Project' :
                     `Authoring: ${projectName || `Project ${projectId}`}`}
                    {activeTab !== 'repository' && activeTab !== 'finalize' && (
                        <span style={styles.projectNameHighlight}>{projectName || `Project ${projectId}`}</span>
                    )}
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
            {errorMessage && <div role="alert" style={styles.errorMessage}>{errorMessage}</div>}
            {successMessage && <div role="alert" style={styles.successMessage} onClick={()=>setSuccessMessage('')}>{successMessage} (click to dismiss)</div>}

            {/* Main content area - conditional layout */}
            {activeTab === 'finalize' ? (
                // Finalize page - dedicated layout
                <div style={styles.finalizeContainer}>
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
                        handleAddBuyListItem={enhancedHandlers.handleAddBuyListItem}
                        removeBuyListItem={enhancedHandlers.removeBuyListItem}
                        handleAutoPopulateBuyList={enhancedHandlers.handleAutoPopulateBuyList}
                        handleUpdateBuyListFromProject={enhancedHandlers.handleUpdateBuyListFromProject}
                        handleClearBuyList={enhancedHandlers.handleClearBuyList}
                        handleFinishProject={enhancedHandlers.handleFinishProject}
                        isLoading={isLoading}
                        formatTime={formatTime}
                        styles={styles}
                    />
                </div>
            ) : activeTab === 'repository' ? (
                // Repository page - dedicated layout
                <div style={styles.finalizeContainer}>
                    <ProjectRepositoryTab 
                        styles={styles}
                        onRepositoryUpdate={() => state.setRepositoryRefreshTrigger(prev => prev + 1)}
                    />
                </div>
            ) : activeTab === 'overview' ? (
                // Overview page - dedicated layout
                <div style={styles.finalizeContainer}>
                    <ProjectOverviewTab 
                        projectSteps={projectSteps}
                        projectBuyList={projectBuyList}
                        formatTime={formatTime}
                        onEditStep={enhancedHandlers.onEditStep}
                        styles={styles}
                    />
                </div>
            ) : (
                // Regular step authoring layout
                <div style={styles.videoTimelineLayout}>

                {/* Left side - Tabs and controls (2/5ths) */}
                <div style={styles.leftPanel}>
                    {/* Tab navigation */}
                    <div style={styles.tabNavigation}>
                        <button 
                            onClick={() => state.setActiveTab('details')}
                            style={{
                                ...styles.tabButton,
                                ...(activeTab === 'details' ? styles.tabButtonActive : {})
                            }}
                        >
                            Step Details
                                        </button>
                        <button 
                            onClick={() => state.setActiveTab('materials')}
                                style={{
                                ...styles.tabButton,
                                ...(activeTab === 'materials' ? styles.tabButtonActive : {})
                            }}
                        >
                            Step Materials
                        </button>
                        <button 
                            onClick={() => state.setActiveTab('files')}
                            style={{
                                ...styles.tabButton,
                                ...(activeTab === 'files' ? styles.tabButtonActive : {})
                            }}
                        >
                            Files
                        </button>
                        <button 
                            onClick={() => state.setActiveTab('result')}
                            style={{
                                ...styles.tabButton,
                                ...(activeTab === 'result' ? styles.tabButtonActive : {})
                            }}
                        >
                            Result
                        </button>
                        <button 
                            onClick={() => state.setActiveTab('signoff')}
                            style={{
                                ...styles.tabButton,
                                ...(activeTab === 'signoff' ? styles.tabButtonActive : {})
                            }}
                        >
                            Sign Off
                        </button>
                            </div>

                {/* Tab content */}
                    <div style={styles.leftPanelContent}>
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
                                styles={styles}
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
                                materialImageInputRef={materialImageInputRef}
                                handleAddMaterialToCurrentStep={enhancedHandlers.handleAddMaterialToCurrentStep}
                                removeMaterialFromCurrentStep={enhancedHandlers.removeMaterialFromCurrentStep}
                                // Repository refresh trigger
                                repositoryRefreshTrigger={state.repositoryRefreshTrigger}
                                styles={styles}
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
                                styles={styles}
                            />
                        )}

                        {activeTab === 'result' && (
                            <ResultTab 
                                currentStepResultImage={currentStepResultImage}
                                currentStepResultImageFile={currentStepResultImageFile}
                                handleResultImageChange={enhancedHandlers.handleResultImageChange}
                                resultImageInputRef={resultImageInputRef}
                                styles={styles}
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
                                styles={styles}
                            />
                        )}
                    </div>


            </div>
            
                {/* Right side - Video and steps (3/5ths) */}
                <div style={styles.rightPanel}>
                    
                    {/* Video section */}
                    <div style={styles.videoSection}>
                        <div style={styles.videoContainer}>
                            {uploadedVideos.length > 0 && activeVideoUrl ? (
                                <div>
                                    {/* Video selection */}
                                    {uploadedVideos.length > 1 && (
                                        <div style={styles.videoSelection}>
                                            {uploadedVideos.map((video, index) => (
                    <button 
                                                    key={video.path || index} 
                                                    onClick={() => enhancedHandlers.handleVideoSelection(index)}
                        style={{
                                                        ...styles.videoSelectButton,
                                                        ...(activeVideoIndex === index ? styles.videoSelectButtonActive : {})
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
                                        style={styles.videoPlayer}
                                        onError={(e) => { 
                                            console.error("Video Error:", e);
                                            console.error("Failed video URL:", activeVideoUrl);
                                            setErrorMessage(`Error loading video: ${uploadedVideos[activeVideoIndex]?.name || 'Unknown video'}`); 
                                        }}
                                    />
                                    
                                    {/* Timeline under video */}
                                    <div style={styles.videoTimelineUnderVideo}>
                                        <div style={styles.videoTimelineTrack} onClick={(e) => {
                                            if (videoRef.current) {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                const clickX = e.clientX - rect.left;
                                                const timelineWidth = rect.width;
                                                const videoDuration = videoRef.current.duration || 0;
                                                const clickedTime = (clickX / timelineWidth) * videoDuration;
                                                videoRef.current.currentTime = clickedTime;
                                            }
                                        }}>
                                            {/* Background track */}
                                            <div style={styles.timelineBackground}></div>
                                            
                                            {/* Current time indicator */}
                                            <div 
                                                style={{
                                                    ...styles.currentTimeIndicator,
                                                    left: `${videoRef.current ? ((videoRef.current.currentTime || 0) / (videoRef.current.duration || 1)) * 100 : 0}%`
                                                }}
                                            ></div>
                                            
                                            {/* Existing steps on timeline */}
                                            {projectSteps.map((step, index) => (
                                                <div
                                                    key={step.id || index}
                                                    style={{
                                                        ...styles.timelineStep,
                                                        left: `${videoRef.current ? ((step.video_start_time_ms / 1000) / (videoRef.current.duration || 1)) * 100 : 0}%`,
                                                        width: `${videoRef.current ? (((step.video_end_time_ms - step.video_start_time_ms) / 1000) / (videoRef.current.duration || 1)) * 100 : 0}%`
                                                    }}
                                                    title={`Step ${index + 1}: ${step.name}`}
                                                >
                                                    <div style={styles.timelineStepLabel}>
                                                        {index + 1}
            </div>
                                                </div>
                                            ))}
                                            
                                            {/* Start time marker */}
                                            {(currentStepStartTime !== null && currentStepStartTime !== undefined) && (
                                                <div
                                                    style={{
                                                        ...styles.timelineMarker,
                                                        ...styles.startMarker,
                                                        left: `${videoRef.current ? (currentStepStartTime / (videoRef.current.duration || 1)) * 100 : 0}%`
                                                    }}
                                                >
                                                    <div style={styles.markerHandle}>S</div>
                                                    <div style={styles.markerTime}>{formatTime(currentStepStartTime)}</div>
                                                </div>
                                            )}
                                            
                                            {/* End time marker */}
                                            {(currentStepEndTime !== null && currentStepEndTime !== undefined) && (
                                                <div
                                                    style={{
                                                        ...styles.timelineMarker,
                                                        ...styles.endMarker,
                                                        left: `${videoRef.current ? (currentStepEndTime / (videoRef.current.duration || 1)) * 100 : 0}%`
                                                    }}
                                                >
                                                    <div style={styles.markerHandle}>E</div>
                                                    <div style={styles.markerTime}>{formatTime(currentStepEndTime)}</div>
                    </div>
                                            )}
                                            
                                            {/* Selection area between start and end */}
                                            {(currentStepStartTime !== null && currentStepStartTime !== undefined) && 
                                             (currentStepEndTime !== null && currentStepEndTime !== undefined) && (
                                                <div
                                                    style={{
                                                        ...styles.selectionArea,
                                                        left: `${videoRef.current ? (currentStepStartTime / (videoRef.current.duration || 1)) * 100 : 0}%`,
                                                        width: `${videoRef.current ? ((currentStepEndTime - currentStepStartTime) / (videoRef.current.duration || 1)) * 100 : 0}%`
                                                    }}
                                                ></div>
                                            )}
                                        </div>
                                        
                                        {/* Timeline controls */}
                                        <div style={styles.videoTimelineControls}>
                                            <button
                                                onClick={() => {
                                                    if (videoRef.current) {
                                                        const currentTime = videoRef.current.currentTime;
                                                        console.log('Marking start time:', currentTime);
                                                        console.log('Current step start time before setting:', currentStepStartTime);
                                                        state.setCurrentStepStartTime(currentTime);
                                                        console.log('setCurrentStepStartTime called with:', currentTime);
                                                        setSuccessMessage(`Start time set to ${formatTime(currentTime)}`);
                                                        setTimeout(() => setSuccessMessage(''), 2000);
                                                    } else {
                                                        console.log('Video ref not available');
                                                        setErrorMessage("Video not ready. Please wait and try again.");
                                                    }
                                                }}
                                                style={{...styles.button, ...styles.buttonPrimary, fontSize: '0.8rem', padding: '6px 12px'}}
                                            >
                                                Mark Start
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (videoRef.current) {
                                                        const currentTime = videoRef.current.currentTime;
                                                        console.log('Marking end time:', currentTime, 'Start time:', currentStepStartTime);
                                                        console.log('Current step end time before setting:', currentStepEndTime);
                                                        if (currentStepStartTime !== null && currentStepStartTime !== undefined && currentTime <= currentStepStartTime) {
                                                            setErrorMessage("End time must be after start time");
                                                            return;
                                                        }
                                                        state.setCurrentStepEndTime(currentTime);
                                                        console.log('setCurrentStepEndTime called with:', currentTime);
                                                        setSuccessMessage(`End time set to ${formatTime(currentTime)}`);
                                                        setTimeout(() => setSuccessMessage(''), 2000);
                                                    } else {
                                                        console.log('Video ref not available');
                                                        setErrorMessage("Video not ready. Please wait and try again.");
                                                    }
                                                }}
                                                style={{...styles.button, ...styles.buttonSecondary, fontSize: '0.8rem', padding: '6px 12px'}}
                                            >
                                                Mark End
                                            </button>
                                            <button
                                                onClick={() => {
                                                    console.log('Clearing video times');
                                                    state.setCurrentStepStartTime(null);
                                                    state.setCurrentStepEndTime(null);
                                                    setSuccessMessage('Video times cleared');
                                                    setTimeout(() => setSuccessMessage(''), 2000);
                                                }}
                                                style={{...styles.button, backgroundColor: '#dc3545', color: 'white', fontSize: '0.8rem', padding: '6px 12px'}}
                                            >
                                                Clear
                                            </button>
                </div>
            </div>
            
                                    {/* Video controls */}
                                    <div style={styles.videoControls}>
                    <button 
                                            onClick={() => enhancedHandlers.navigateFrame('backward')} 
                                            style={{...styles.button, ...styles.buttonSecondarySm}}
                                        >
                                            ◀ Frame
                                        </button>
                                        <button 
                                            onClick={() => enhancedHandlers.navigateFrame('forward')} 
                                            style={{...styles.button, ...styles.buttonSecondarySm}}
                                        >
                                            Frame ▶
                                        </button>
                                        <button 
                                            onClick={enhancedHandlers.captureFrameForAnnotation} 
                                            style={{...styles.button, backgroundColor: '#3498db', color: 'white'}}
                                        >
                                            Capture Frame
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={styles.noVideoMessage}>
                                    <p>No videos available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Steps section */}
                    <div style={styles.stepsSection}>
                        <div style={styles.stepsSectionHeader}>
                            <h3 style={styles.stepsSectionTitle}>Project Steps</h3>
                            <button 
                                onClick={stepActions.addNewStep}
                                style={{...styles.button, ...styles.buttonPrimary}}
                            >
                                + Add Step
                            </button>
                        </div>
                        
                        <div style={styles.stepsList}>
                            {projectSteps.map((step, index) => (
                                <div
                                    key={step.id || `step-${index}`}
                                    onClick={() => stepActions.loadStepForEditing(step, index)}
                        style={{
                                        ...styles.stepItem,
                                        ...(currentStepIndex === index ? styles.stepItemActive : {})
                                    }}
                                >
                                    <div style={styles.stepItemHeader}>
                                        <span style={currentStepIndex === index ? styles.stepItemNumberActive : styles.stepItemNumber}>Step {index + 1}</span>
                                        <span style={currentStepIndex === index ? styles.stepItemTimeActive : styles.stepItemTime}>
                                            {formatTime(step.video_start_time_ms / 1000)} - {formatTime(step.video_end_time_ms / 1000)}
                                        </span>
                                    </div>
                                    <div style={currentStepIndex === index ? styles.stepItemNameActive : styles.stepItemName}>{step.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            )}
            
            {/* Floating save button - left middle */}
            {activeTab !== 'finalize' && (currentStepIndex >= 0 || currentStepName.trim() || currentStepDescription.trim() || 
             (currentStepStartTime !== null && currentStepStartTime !== undefined) || 
             (currentStepEndTime !== null && currentStepEndTime !== undefined)) && (
                <div style={{
                    position: 'fixed',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1000
                }}>
                    <button 
                        onClick={enhancedHandlers.handleAddStep}
                        disabled={isStepLoading || !currentStepName.trim() || !currentStepDescription.trim() || (currentStepStartTime === null || currentStepStartTime === undefined) || (currentStepEndTime === null || currentStepEndTime === undefined)}
                        style={{
                            ...styles.button,
                            ...styles.buttonPrimary,
                            ...(isStepLoading && styles.buttonDisabled),
                            padding: '12px 24px',
                            fontSize: '1rem',
                            borderRadius: '25px',
                            boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
                        }}
                    >
                        {isStepLoading ? 'Saving...' : 
                         currentStepIndex >= 0 ? 'Update Step' : 'Save New Step'}
                    </button>
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
                styles={styles}
            />
        </div>
    );
};

export default ProjectStepsPage;