import React from 'react';
import { COMPONENTS, COLORS, LAYOUT, TYPOGRAPHY } from './shared/styles';

const getAnnotationText = (annotation) => {
    return annotation.component_name || annotation.data?.text || 'Untitled annotation';
};

const getAnnotationTimestamp = (annotation) => {
    return annotation.frame_timestamp_ms || annotation.data?.frame_timestamp_ms;
};

const getAnnotationId = (annotation) => {
    return annotation.annotation_id || annotation.data?.id;
};

const StepDetailsTab = ({
    currentStepName,
    setCurrentStepName,
    currentStepDescription,
    setCurrentStepDescription,
    currentStepStartTime,
    currentStepEndTime,
    currentStepAnnotations,
    formatTime,
    onEditAnnotation,
    styles
}) => (
    <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Step Details</h2>
        <div style={COMPONENTS.flexColumn}>
            <div>
                <label htmlFor="stepName" style={styles.inputLabel}>
                    Step Name <span style={{color: COLORS.danger}}>*</span>
                </label>
                <input 
                    type="text" 
                    id="stepName" 
                    value={currentStepName} 
                    onChange={(e) => setCurrentStepName(e.target.value)} 
                    placeholder="e.g., Attach side panel A" 
                    style={styles.inputField}
                />
            </div>

            <div>
                <label htmlFor="stepDescription" style={styles.inputLabel}>
                    Step Description <span style={{color: COLORS.danger}}>*</span>
                </label>
                <textarea 
                    id="stepDescription" 
                    value={currentStepDescription} 
                    onChange={(e) => setCurrentStepDescription(e.target.value)} 
                    rows="4" 
                    placeholder="Detailed instructions for completing this step..." 
                    style={styles.textareaField}
                />
            </div>

            <div style={COMPONENTS.timeDisplay}>
                <label style={styles.inputLabel}>Video Time Range</label>
                <div style={{fontSize: '0.9rem', color: COLORS.text.secondary, marginTop: '4px'}}>
                    <div style={{marginBottom: '2px'}}>
                        <strong>Start:</strong> {currentStepStartTime !== null ? formatTime(currentStepStartTime) : 'Not set'}
                    </div>
                    <div>
                        <strong>End:</strong> {currentStepEndTime !== null ? formatTime(currentStepEndTime) : 'Not set'}
                    </div>
                </div>
            </div>

            {/* Annotations Management Section */}
            <div style={{
                ...COMPONENTS.timeDisplay,
                backgroundColor: COLORS.gray[50],
                border: `1px solid ${COLORS.gray[200]}`
            }}>
                <label style={styles.inputLabel}>Step Annotations</label>
                <div style={{marginTop: LAYOUT.sm}}>
                    {currentStepAnnotations && currentStepAnnotations.length > 0 ? (
                        <div>
                            <p style={{
                                fontSize: '0.85rem',
                                color: COLORS.text.secondary,
                                marginBottom: LAYOUT.sm
                            }}>
                                {currentStepAnnotations.length} annotation{currentStepAnnotations.length !== 1 ? 's' : ''} in this step
                            </p>
                            <div style={{
                                maxHeight: '120px',
                                overflowY: 'auto',
                                marginBottom: LAYOUT.sm
                            }}>
                                {currentStepAnnotations.map((annotation, index) => {
                                    const annotationText = getAnnotationText(annotation);
                                    const annotationTimestamp = getAnnotationTimestamp(annotation);
                                    const annotationId = getAnnotationId(annotation);
                                    
                                    return (
                                        <div 
                                            key={annotationId || `annotation-${index}`}
                                            style={{
                                                padding: LAYOUT.sm,
                                                backgroundColor: 'white',
                                                border: `1px solid ${COLORS.gray[200]}`,
                                                borderRadius: '4px',
                                                marginBottom: LAYOUT.xs,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div style={{flex: 1}}>
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '0.85rem',
                                                    fontWeight: '500',
                                                    color: COLORS.text.primary
                                                }}>
                                                    {annotationText}
                                                </p>
                                                <p style={{
                                                    margin: '2px 0 0 0',
                                                    fontSize: '0.75rem',
                                                    color: COLORS.text.muted
                                                }}>
                                                    {annotationTimestamp 
                                                        ? `At ${formatTime(annotationTimestamp / 1000)}`
                                                        : 'No timestamp'
                                                    }
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => onEditAnnotation && onEditAnnotation(annotation)}
                                                style={{
                                                    backgroundColor: COLORS.primary,
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '4px 8px',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            <p style={{
                                fontSize: '0.75rem',
                                color: COLORS.text.muted,
                                fontStyle: 'italic',
                                margin: 0
                            }}>
                                💡 Click "Edit" to modify an annotation or "Capture Frame" to add new ones
                            </p>
                        </div>
                    ) : (
                        <div style={{textAlign: 'center', padding: LAYOUT.lg}}>
                            <p style={{
                                margin: 0,
                                color: COLORS.text.muted,
                                fontStyle: 'italic',
                                fontSize: '0.85rem'
                            }}>
                                No annotations yet
                            </p>
                            <p style={{
                                margin: '4px 0 0 0',
                                fontSize: '0.75rem',
                                color: COLORS.text.muted
                            }}>
                                Use "Capture Frame" in the video section to add annotations
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
);

export default StepDetailsTab; 