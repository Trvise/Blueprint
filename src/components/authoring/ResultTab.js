import React from 'react';
import { COMPONENTS, TYPOGRAPHY, COLORS, LAYOUT } from './shared/styles';
import { captureFrameForResult } from '../pages/createsteps helpers/CreateStepsUtils';

const ResultTab = ({
    currentStepResultImage,
    currentStepResultImageFile,
    handleResultImageChange,
    resultImageInputRef,
    styles,
    // Video frame capture props
    videoRef,
    activeVideoUrl,
    state,
    formatTime,
    setSuccessMessage,
    setErrorMessage
}) => (
    <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Step Result</h2>
        <p style={TYPOGRAPHY.sectionDescription}>
            Upload an image showing what the completed step should look like
        </p>
        
        <div style={{marginBottom: LAYOUT.sectionSpacing}}>
            <label style={styles.inputLabel}>Result Image</label>
            
            {/* Option 1: Upload Image File */}
            <div style={{marginBottom: '24px'}}>
                <h4 style={{...TYPOGRAPHY.listTitle, marginBottom: '8px', color: '#F1C232'}}>
                    Option 1: Upload Image File
                </h4>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleResultImageChange} 
                    ref={resultImageInputRef} 
                    style={styles.fileInput}
                />
                <p style={TYPOGRAPHY.helpText}>
                    Choose an image that clearly shows the expected result after completing this step
                </p>
            </div>

            {/* OR Separator */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '24px 0',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '1px',
                    backgroundColor: '#F1C232',
                    top: '50%'
                }}></div>
                <div style={{
                    backgroundColor: '#000000',
                    padding: '0 16px',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#F1C232',
                    zIndex: 1
                }}>
                    OR
                </div>
            </div>

            {/* Option 2: Capture from Video */}
            <div style={{
                backgroundColor: '#222222',
                border: '1px solid #F1C232',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
            }}>
                <h4 style={{...TYPOGRAPHY.listTitle, marginBottom: '8px', color: '#F1C232'}}>
                    Option 2: Capture from Video with Annotations
                </h4>
                <p style={{...TYPOGRAPHY.helpText, marginBottom: '12px'}}>
                    Capture a frame from the current video position and add optional annotations to highlight result details
                </p>
                
                {activeVideoUrl && videoRef ? (
                    <button
                        onClick={() => captureFrameForResult(
                            videoRef,
                            state.setResultFrameForCapture,
                            state.setResultFrameTimestamp,
                            state.setResultAnnotations,
                            state.setResultAnnotationTool,
                            setErrorMessage,
                            state.setCurrentStepResultImageFile,
                            state.setCurrentStepResultImage,
                            setSuccessMessage,
                            formatTime,
                            state.setIsResultAnnotationPopupOpen
                        )}
                        style={{
                            backgroundColor: '#F1C232',
                            color: '#000000',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '12px 24px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(241,194,50,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                                            >
                            Capture Result Frame
                        </button>
                ) : (
                    <p style={{...TYPOGRAPHY.helpText, color: '#888', fontStyle: 'italic'}}>
                        Video not available for frame capture
                    </p>
                )}
            </div>
        </div>
        
        {(currentStepResultImage || (currentStepResultImageFile && (currentStepResultImageFile.hasExistingImage || currentStepResultImageFile instanceof File))) && (
            <div style={{marginTop: LAYOUT.sectionSpacing}}>
                <h4 style={TYPOGRAPHY.listTitle}>Preview:</h4>
                <div style={{
                    ...COMPONENTS.fileList,
                    padding: LAYOUT.sectionSpacing,
                    textAlign: 'center'
                }}>
                    <img 
                        src={
                            currentStepResultImage || 
                            (currentStepResultImageFile?.hasExistingImage ? currentStepResultImageFile.image_url : null) ||
                            (currentStepResultImageFile instanceof File ? URL.createObjectURL(currentStepResultImageFile) : null)
                        } 
                        alt="Step result preview" 
                        style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            borderRadius: '8px',
                            border: `2px solid ${COLORS.gray[200]}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                        }}
                    />
                    <div style={{display: 'none', color: '#666', fontSize: '14px'}}>
                        📷 Image failed to load
                    </div>
                    {currentStepResultImageFile && (
                        <p style={{
                            ...COMPONENTS.fileListItemSubtext,
                            marginTop: LAYOUT.inputSpacing,
                            textAlign: 'center'
                        }}>
                            {currentStepResultImageFile instanceof File ? (
                                `New image: ${currentStepResultImageFile.name}`
                            ) : currentStepResultImageFile.hasExistingImage ? (
                                `Existing image: ${currentStepResultImageFile.name}`
                            ) : (
                                `File: ${currentStepResultImageFile.name}`
                            )}
                        </p>
                    )}
                </div>
            </div>
        )}
        
        {!currentStepResultImage && (
            <div style={COMPONENTS.emptyState}>
                <p style={COMPONENTS.emptyStateText}>
                    No result image uploaded yet. Upload an image showing the expected outcome of this step.
                </p>
            </div>
        )}
    </div>
);

export default ResultTab; 