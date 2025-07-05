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
import MaterialsAndFilesTab from '../authoring/MaterialsAndFilesTab';
import ProjectOverviewTab from '../authoring/ProjectOverviewTab';
import FinalizeTab from '../authoring/FinalizeTab';

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
        toolImageInputRef,
        // Materials data
        currentStepMaterials,
        currentStepMaterialName,
        setCurrentStepMaterialName,
        currentStepMaterialSpec,
        setCurrentStepMaterialSpec,
        currentStepMaterialImageFile,
        setCurrentStepMaterialImageFile,
        materialImageInputRef,
        // Files data
        currentStepSupFiles,
        currentStepSupFileName,
        setCurrentStepSupFileName,
        supFileInputRef,
        currentStepResultImageFile,
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
            formatTime
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
        handleFinishProject: () => stepActions.handleFinishProject(projectName, capturedAnnotationFrames)
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
                    Authoring: <span style={styles.projectNameHighlight}>{projectName || `Project ${projectId}`}</span>
                </h1>
                    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                        {currentStepIndex >= 0 && (
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
                        handleFinishProject={enhancedHandlers.handleFinishProject}
                        isLoading={isLoading}
                        formatTime={formatTime}
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
                            Details
                                        </button>
                        <button 
                            onClick={() => state.setActiveTab('materials')}
                                style={{
                                ...styles.tabButton,
                                ...(activeTab === 'materials' ? styles.tabButtonActive : {})
                            }}
                        >
                            Materials
                        </button>
                        <button 
                            onClick={() => state.setActiveTab('overview')}
                            style={{
                                ...styles.tabButton,
                                ...(activeTab === 'overview' ? styles.tabButtonActive : {})
                            }}
                        >
                            Overview
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
                                currentCautionaryNotes={currentCautionaryNotes}
                                setCurrentCautionaryNotes={state.setCurrentCautionaryNotes}
                                currentBestPracticeNotes={currentBestPracticeNotes}
                                setBestPracticeNotes={state.setCurrentBestPracticeNotes}
                                currentStepValidationQuestion={currentStepValidationQuestion}
                                setCurrentStepValidationQuestion={state.setCurrentStepValidationQuestion}
                                currentStepValidationAnswer={currentStepValidationAnswer}
                                setCurrentStepValidationAnswer={state.setCurrentStepValidationAnswer}
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
                                handleAddToolToCurrentStep={enhancedHandlers.handleAddToolToCurrentStep}
                                removeToolFromCurrentStep={enhancedHandlers.removeToolFromCurrentStep}
                                // Materials props
                                currentStepMaterials={currentStepMaterials}
                                currentStepMaterialName={currentStepMaterialName}
                                setCurrentStepMaterialName={setCurrentStepMaterialName}
                                currentStepMaterialSpec={currentStepMaterialSpec}
                                setCurrentStepMaterialSpec={setCurrentStepMaterialSpec}
                                currentStepMaterialImageFile={currentStepMaterialImageFile}
                                setCurrentStepMaterialImageFile={setCurrentStepMaterialImageFile}
                                materialImageInputRef={materialImageInputRef}
                                handleAddMaterialToCurrentStep={enhancedHandlers.handleAddMaterialToCurrentStep}
                                removeMaterialFromCurrentStep={enhancedHandlers.removeMaterialFromCurrentStep}
                                // Files props
                                currentStepSupFiles={currentStepSupFiles}
                                currentStepSupFileName={currentStepSupFileName}
                                setCurrentStepSupFileName={setCurrentStepSupFileName}
                                supFileInputRef={supFileInputRef}
                                currentStepResultImageFile={currentStepResultImageFile}
                                setCurrentStepResultImageFile={state.setCurrentStepResultImageFile}
                                resultImageInputRef={resultImageInputRef}
                                handleSupFileChange={enhancedHandlers.handleSupFileChange}
                                removeSupFileFromCurrentStep={enhancedHandlers.removeSupFileFromCurrentStep}
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
                                            {currentStepStartTime !== null && (
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
                                            {currentStepEndTime !== null && (
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
                                            {currentStepStartTime !== null && currentStepEndTime !== null && (
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
                                                        state.setCurrentStepStartTime(videoRef.current.currentTime);
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
                                                        if (currentStepStartTime && currentTime <= currentStepStartTime) {
                                                            setErrorMessage("End time must be after start time");
                                                            return;
                                                        }
                                                        state.setCurrentStepEndTime(currentTime);
                                                    }
                                                }}
                                                style={{...styles.button, ...styles.buttonSecondary, fontSize: '0.8rem', padding: '6px 12px'}}
                                            >
                                                Mark End
                                            </button>
                                            <button
                                                onClick={() => {
                                                    state.setCurrentStepStartTime(null);
                                                    state.setCurrentStepEndTime(null);
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
                                        <span style={styles.stepItemNumber}>Step {index + 1}</span>
                                        <span style={styles.stepItemTime}>
                                            {formatTime(step.video_start_time_ms / 1000)} - {formatTime(step.video_end_time_ms / 1000)}
                                        </span>
                                    </div>
                                    <div style={styles.stepItemName}>{step.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            )}
            
            {/* Floating action button */}
            <div style={styles.floatingActionButton}>
                {currentStepIndex >= 0 && (
                    <button 
                        onClick={enhancedHandlers.handleAddStep}
                        disabled={isStepLoading}
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
                        {isStepLoading ? 'Saving...' : 'Save Step'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProjectStepsPage;