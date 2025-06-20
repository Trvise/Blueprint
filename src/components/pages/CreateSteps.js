// CreateStepsNew.js - Refactored CreateSteps component using modular files
import React from 'react';

// Import modular components
import { useCreateStepsState, useCreateStepsEffects } from './CreateStepsHooks';
import { createStepHandlers } from './CreateStepsHandlers';
import { createStepActions } from './CreateStepsActions';
import { styles } from './CreateStepsStyles';
import { formatTime, navigateFrame, captureFrameForAnnotation } from './CreateStepsUtils';

// Import Tab Components
import VideoAnnotationTab from '../authoring/VideoAnnotationTab';
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
        frameForAnnotation,
        frameTimestampMs,
        currentStepAnnotations,
        currentAnnotationTool,
        setCurrentAnnotationTool,
        videoDimensions,
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
            state.setErrorMessage
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
        handleFinishProject: () => stepActions.handleFinishProject(projectName)
    };

    // Early returns for loading/error states
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
                            onClick={stepActions.addNewStep}
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
                                onClick={() => stepActions.loadStepForEditing(step, index)}
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
                            onClick={stepActions.addNewStep}
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
                                handleVideoSelection={enhancedHandlers.handleVideoSelection}
                                navigateFrame={enhancedHandlers.navigateFrame}
                                captureFrameForAnnotation={enhancedHandlers.captureFrameForAnnotation}
                                frameForAnnotation={frameForAnnotation}
                                frameTimestampMs={frameTimestampMs}
                                currentStepAnnotations={currentStepAnnotations}
                                currentAnnotationTool={currentAnnotationTool}
                                setCurrentAnnotationTool={setCurrentAnnotationTool}
                                handleAnnotationSubmit={enhancedHandlers.handleAnnotationSubmit}
                                formatTime={formatTime}
                                currentStepStartTime={currentStepStartTime}
                                currentStepEndTime={currentStepEndTime}
                                markTime={enhancedHandlers.markTime}
                                styles={styles}
                                setErrorMessage={setErrorMessage}
                            />
                        )}

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
                                handleAddBuyListItem={enhancedHandlers.handleAddBuyListItem}
                                removeBuyListItem={enhancedHandlers.removeBuyListItem}
                                handleFinishProject={enhancedHandlers.handleFinishProject}
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
                        onClick={enhancedHandlers.handleAddStep}
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