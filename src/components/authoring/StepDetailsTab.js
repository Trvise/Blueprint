import React, { useEffect } from 'react';
import { COMPONENTS, COLORS } from './shared/styles';

// Chrome detection function
const isChrome = () => {
    return navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edg') && !navigator.userAgent.includes('Safari');
};

const getAnnotationText = (annotation) => {
    return annotation.component_name || annotation.data?.text || 'Untitled annotation';
};

const getAnnotationTimestamp = (annotation) => {
    return annotation.frame_timestamp_ms || annotation.data?.frame_timestamp_ms;
};

const getAnnotationId = (annotation) => {
    return annotation.annotation_id || annotation.data?.id;
};

// --- Unified sub-card style for both Video Time Range and Step Annotations ---
const subCardStyle = {
  background: '#202124',
  border: '1px solid #F1C232',
  borderRadius: '8px',
  padding: '1rem',
  marginTop: '1.25rem',
  marginBottom: '1.25rem',
  boxShadow: 'none',
  ...(isChrome() && {
    padding: '0.75rem',
    marginTop: '1rem',
    marginBottom: '1rem',
  }),
};
const subCardTitleStyle = {
  fontWeight: 600,
  color: '#F5F5F5',
  fontSize: '1.05rem',
  marginBottom: '0.5rem',
  letterSpacing: '0.01em',
  ...(isChrome() && {
    fontSize: '0.95rem',
    marginBottom: '0.4rem',
  }),
};
const subCardTextStyle = {
  color: '#E5E5E5',
  fontSize: '0.97rem',
  ...(isChrome() && {
    fontSize: '0.9rem',
  }),
};
const goldAccent = { color: '#F1C232', fontWeight: 500 };
const blueAccent = { color: '#3B82F6', fontWeight: 500 };

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
}) => {
    // Track when step times change for debugging
    useEffect(() => {
        console.log('StepDetailsTab - Step times changed:', {
            startTime: currentStepStartTime,
            endTime: currentStepEndTime,
            startFormatted: currentStepStartTime !== null ? formatTime(currentStepStartTime) : 'Not set',
            endFormatted: currentStepEndTime !== null ? formatTime(currentStepEndTime) : 'Not set'
        });
    }, [currentStepStartTime, currentStepEndTime, formatTime]);
    
    return (
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



            {/* Annotations Management Section */}
            <div style={subCardStyle}>
                <label style={subCardTitleStyle}>Step Annotations</label>
                <div style={{marginTop: '0.3rem'}}>
                    {currentStepAnnotations && currentStepAnnotations.length > 0 ? (
                        <div>
                            <p style={{
                                ...subCardTextStyle,
                                marginBottom: '0.7rem',
                            }}>
                                <span style={goldAccent}>{currentStepAnnotations.length}</span> annotation{currentStepAnnotations.length !== 1 ? 's' : ''} in this step
                            </p>
                            <div style={{
                                maxHeight: '160px',
                                overflowY: 'auto',
                                marginBottom: '0.7rem',
                                paddingRight: '2px',
                            }}>
                                {currentStepAnnotations.map((annotation, index) => {
                                    const annotationText = getAnnotationText(annotation);
                                    const annotationTimestamp = getAnnotationTimestamp(annotation);
                                    const annotationId = getAnnotationId(annotation);
                                    return (
                                        <div
                                            key={annotationId || `annotation-${index}`}
                                            style={{
                                                padding: '0.5rem 0.75rem',
                                                background: '#232323',
                                                border: '1px solid #292929',
                                                borderRadius: '6px',
                                                marginBottom: '0.5rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                color: '#F5F5F5',
                                                fontSize: '0.97rem',
                                                transition: 'box-shadow 0.15s',
                                                ...(isChrome() && {
                                                    padding: '0.4rem 0.6rem',
                                                    marginBottom: '0.4rem',
                                                    fontSize: '0.9rem',
                                                }),
                                            }}
                                        >
                                            <div style={{flex: 1, minWidth: 0}}>
                                                <p style={{
                                                    margin: 0,
                                                    fontWeight: 600,
                                                    color: '#F5F5F5',
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden',
                                                    whiteSpace: 'nowrap',
                                                }}>{annotationText}</p>
                                                <p style={{
                                                    margin: '2px 0 0 0',
                                                    fontSize: '0.92em',
                                                    color: '#BDBDBD',
                                                }}>
                                                    {annotationTimestamp ? `At ${formatTime(annotationTimestamp / 1000)}` : 'No timestamp'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => onEditAnnotation && onEditAnnotation(annotation)}
                                                style={{
                                                    background: '#F1C232',
                                                    color: '#18181b',
                                                    border: 'none',
                                                    borderRadius: '5px',
                                                    padding: '4px 12px',
                                                    fontSize: '0.93rem',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    marginLeft: '0.7rem',
                                                    transition: 'background 0.15s, color 0.15s',
                                                    ...(isChrome() && {
                                                        padding: '3px 8px',
                                                        fontSize: '0.85rem',
                                                        marginLeft: '0.5rem',
                                                    }),
                                                }}
                                                onMouseOver={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#F1C232'; }}
                                                onMouseOut={e => { e.currentTarget.style.background = '#F1C232'; e.currentTarget.style.color = '#18181b'; }}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            <p style={{
                                fontSize: '0.93rem',
                                color: '#BDBDBD',
                                fontStyle: 'italic',
                                margin: 0,
                            }}>
                                💡 Click "Edit" to modify an annotation or "Capture Frame" to add new ones
                            </p>
                        </div>
                    ) : (
                        <div style={{textAlign: 'center', padding: '1.2rem'}}>
                            <p style={{
                                margin: 0,
                                color: '#BDBDBD',
                                fontStyle: 'italic',
                                fontSize: '0.97rem',
                                ...(isChrome() && {
                                    fontSize: '0.9rem',
                                }),
                            }}>
                                No annotations yet
                            </p>
                            <p style={{
                                margin: '4px 0 0 0',
                                fontSize: '0.93rem',
                                color: '#BDBDBD',
                                ...(isChrome() && {
                                    fontSize: '0.85rem',
                                }),
                            }}>
                                Use "Capture Frame" in the video section to add annotations
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
)};

export default StepDetailsTab;