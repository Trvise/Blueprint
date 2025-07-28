import React from 'react';
import Annotation from 'react-image-annotation';
import { generateResultImageWithAnnotations } from '../pages/createsteps helpers/CreateStepsUtils';

// Helper function to get annotation timestamp from either structure
const getAnnotationTimestamp = (annotation) => {
    return annotation.frame_timestamp_ms || annotation.data?.frame_timestamp_ms;
};

// Helper function to transform database annotations to the format expected by react-image-annotation
const transformAnnotationForDisplay = (annotation) => {
    // If it's already in the correct format (has geometry), return as is
    if (annotation.geometry && annotation.data) {
        return annotation;
    }
    
    // This should not be needed anymore since transformation happens in loadStepForEditing
    // But keep as fallback
    return annotation;
};

const ResultAnnotationPopup = ({
    isOpen,
    onClose,
    resultFrameForCapture,
    resultFrameTimestamp,
    resultAnnotations,
    resultAnnotationTool,
    setResultAnnotationTool,
    handleResultAnnotationSubmit,
    removeResultAnnotation,
    handleClearResultAnnotations,
    formatTime,
    styles,
    // Additional props for generating final image
    setCurrentStepResultImageFile,
    setCurrentStepResultImage,
    setSuccessMessage
}) => {
    if (!isOpen || !resultFrameForCapture) {
        return null;
    }

    // Filter annotations for this specific frame - handle both data structures
    const frameAnnotations = resultAnnotations.filter(
        ann => getAnnotationTimestamp(ann) === resultFrameTimestamp
    );

    // Transform annotations for display in the annotation library
    const transformedAnnotations = frameAnnotations.map(transformAnnotationForDisplay);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: '#000000',
                borderRadius: '12px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative',
                boxShadow: '0 20px 25px -5px rgba(241,194,50,0.15), 0 10px 10px -5px rgba(0,0,0,0.4)',
                border: '2px solid #F1C232'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px 16px',
                    borderBottom: '1px solid #F1C232',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#000000'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            color: '#F1C232',
                            margin: 0
                        }}>
                            Annotate Result Frame
                        </h2>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#D9D9D9',
                            margin: '4px 0 0 0'
                        }}>
                            Time: {formatTime(resultFrameTimestamp / 1000)}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: '#F1C232',
                            padding: '4px',
                            borderRadius: '4px'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    padding: '20px 24px',
                    backgroundColor: '#000000',
                    color: '#D9D9D9'
                }}>
                    {/* How to annotate info box */}
                    <div style={{
                        backgroundColor: '#222222',
                        border: '1px solid #F1C232',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '18px'
                    }}>
                        <h4 style={{
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            color: '#F1C232',
                            margin: '0 0 6px 0'
                        }}>
                            How to annotate the result:
                        </h4>
                        <ul style={{
                            fontSize: '0.88rem',
                            color: '#D9D9D9',
                            margin: 0,
                            paddingLeft: '18px',
                            lineHeight: 1.6
                        }}>
                            <li>Click and drag on the image to highlight result areas.</li>
                            <li>Enter a description in the text box above.</li>
                            <li>Click <b style={{color:'#F1C232'}}>Submit Annotation</b> to save.</li>
                            <li>Use annotations to highlight key features of the expected result.</li>
                        </ul>
                    </div>

                    {/* Annotation label and textbox */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            marginBottom: '6px',
                            color: '#F1C232'
                        }}>Result Annotation</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="Describe this result feature..."
                                value={resultAnnotationTool?.data?.text || ''}
                                onChange={e => setResultAnnotationTool({
                                    ...resultAnnotationTool,
                                    data: {
                                        ...resultAnnotationTool.data,
                                        text: e.target.value
                                    }
                                })}
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    fontSize: '1rem',
                                    border: '1px solid #F1C232',
                                    borderRadius: '6px',
                                    minWidth: '180px',
                                    marginBottom: '6px',
                                    backgroundColor: '#000000',
                                    color: '#D9D9D9'
                                }}
                            />
                            <button
                                onClick={() => {
                                    if (resultAnnotationTool && resultAnnotationTool.geometry) {
                                        handleResultAnnotationSubmit(resultAnnotationTool);
                                    }
                                }}
                                disabled={!(resultAnnotationTool && resultAnnotationTool.geometry)}
                                style={{
                                    backgroundColor: '#F1C232',
                                    color: '#000000',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '8px 18px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: (resultAnnotationTool && resultAnnotationTool.geometry) ? 'pointer' : 'not-allowed',
                                    opacity: (resultAnnotationTool && resultAnnotationTool.geometry) ? 1 : 0.6,
                                    marginBottom: '6px',
                                    boxShadow: '0 2px 8px rgba(241,194,50,0.15)'
                                }}
                            >
                                Submit Annotation
                            </button>
                        </div>
                    </div>

                    {/* Annotation Interface */}
                    <div style={{
                        border: '2px solid #F1C232',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        marginBottom: '20px',
                        maxHeight: '60vh',
                        display: 'flex',
                        justifyContent: 'center',
                        backgroundColor: '#111111'
                    }}>
                        <Annotation
                            src={resultFrameForCapture}
                            alt={`Result frame at ${formatTime(resultFrameTimestamp / 1000)}`}
                            annotations={transformedAnnotations}
                            value={resultAnnotationTool}
                            onChange={setResultAnnotationTool}
                            // Remove the default editor overlay
                            disableEditor
                            onSubmit={() => {}}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '60vh',
                                objectFit: 'contain',
                                backgroundColor: '#111111'
                            }}
                        />
                    </div>

                    {/* Current Annotations List */}
                    <div style={{
                        backgroundColor: '#111111',
                        border: '1px solid #F1C232',
                        borderRadius: '8px',
                        padding: '16px',
                        color: '#D9D9D9'
                    }}>
                        <h4 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#F1C232',
                            margin: '0 0 12px 0'
                        }}>
                            Result Annotations ({frameAnnotations.length})
                        </h4>
                        {frameAnnotations.length > 0 ? (
                            <div style={{
                                maxHeight: '120px',
                                overflowY: 'auto'
                            }}>
                                {frameAnnotations.map((ann, index) => {
                                    // Handle both data structures for displaying annotation text
                                    const annotationText = ann.component_name || ann.data?.text || 'Untitled result annotation';
                                    const annotationId = ann.annotation_id || ann.data?.id;
                                    return (
                                        <div
                                            key={annotationId || `result-annotation-${index}`}
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: '#222222',
                                                border: '1px solid #F1C232',
                                                borderRadius: '6px',
                                                marginBottom: '8px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                color: '#D9D9D9'
                                            }}
                                        >
                                            <div>
                                                <p style={{
                                                    margin: '0 0 4px 0',
                                                    fontWeight: '500',
                                                    color: '#F1C232'
                                                }}>
                                                    {annotationText}
                                                </p>
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '0.75rem',
                                                    color: '#D9D9D9'
                                                }}>
                                                    Type: {ann.geometry?.type || ann.annotation_type || 'rectangle'} • 
                                                    Position: ({(ann.data?.x || ann.data?.normalized_geometry?.x * 100 || 0).toFixed(1)}%, {(ann.data?.y || ann.data?.normalized_geometry?.y * 100 || 0).toFixed(1)}%)
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeResultAnnotation(annotationId)}
                                                style={{
                                                    backgroundColor: '#222222',
                                                    color: '#F1C232',
                                                    border: '1px solid #F1C232',
                                                    borderRadius: '4px',
                                                    padding: '4px 8px',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p style={{
                                color: '#D9D9D9',
                                fontStyle: 'italic',
                                margin: 0
                            }}>
                                No result annotations yet. Click and drag on the image above to add one.
                            </p>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '24px',
                        paddingTop: '16px',
                        borderTop: '1px solid #F1C232'
                    }}>
                        <div style={{
                            fontSize: '0.875rem',
                            color: '#D9D9D9'
                        }}>
                            💡 Tip: Highlight key features that show successful completion
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center'
                        }}>
                            {resultAnnotations.length > 0 && (
                                <button
                                    onClick={handleClearResultAnnotations}
                                    style={{
                                        backgroundColor: '#000000',
                                        color: '#F1C232',
                                        border: '1px solid #F1C232',
                                        borderRadius: '8px',
                                        padding: '8px 16px',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Clear All
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    // Generate final image with annotations baked in
                                    generateResultImageWithAnnotations(
                                        resultFrameForCapture,
                                        resultAnnotations,
                                        setCurrentStepResultImageFile,
                                        setCurrentStepResultImage,
                                        setSuccessMessage
                                    );
                                    onClose();
                                }}
                                style={{
                                    backgroundColor: '#0000FF',
                                    color: '#D9D9D9',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '10px 20px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Done Annotating
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultAnnotationPopup; 