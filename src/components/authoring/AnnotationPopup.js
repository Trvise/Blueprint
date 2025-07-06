import React from 'react';
import Annotation from 'react-image-annotation';

// Helper function to get annotation timestamp from either structure
const getAnnotationTimestamp = (annotation) => {
    return annotation.frame_timestamp_ms || annotation.data?.frame_timestamp_ms;
};

// Helper function to transform database annotations to the format expected by react-image-annotation
const transformAnnotationForDisplay = (annotation) => {
    // If it's already in the correct format (has geometry), return as is
    if (annotation.geometry) {
        return annotation;
    }
    
    // If it's a database annotation, transform it
    if (annotation.data && typeof annotation.data === 'object') {
        let geometry = {};
        
        // Check if coordinates are in local format (0-100) or database format (0-1)
        if (annotation.data.x !== undefined) {
            // Local format - coordinates are already in percentage (0-100)
            geometry = {
                type: annotation.annotation_type || annotation.data.type || 'rectangle',
                x: annotation.data.x,
                y: annotation.data.y,
                width: annotation.data.width,
                height: annotation.data.height
            };
        } else if (annotation.data.normalized_geometry) {
            // Database format - coordinates are normalized (0-1), need to convert to percentage (0-100)
            const norm = annotation.data.normalized_geometry;
            geometry = {
                type: annotation.annotation_type || norm.type || 'rectangle',
                x: norm.x * 100,  // Convert from normalized to percentage
                y: norm.y * 100,
                width: norm.width * 100,
                height: norm.height * 100
            };
        } else {
            // Fallback - assume database format with coordinates in data field
            geometry = {
                type: annotation.annotation_type || 'rectangle',
                x: (annotation.data.x || 0) * 100,  // Convert from normalized to percentage
                y: (annotation.data.y || 0) * 100,
                width: (annotation.data.width || 0) * 100,
                height: (annotation.data.height || 0) * 100
            };
        }
        
        const data = {
            text: annotation.component_name || annotation.data.text || 'Untitled annotation',
            id: annotation.annotation_id || annotation.data.id || Math.random().toString()
        };
        
        return {
            geometry,
            data
        };
    }
    
    // Fallback - return original annotation
    return annotation;
};

const AnnotationPopup = ({
    isOpen,
    onClose,
    frameForAnnotation,
    frameTimestampMs,
    currentStepAnnotations,
    currentAnnotationTool,
    setCurrentAnnotationTool,
    handleAnnotationSubmit,
    removeAnnotation,
    formatTime,
    styles
}) => {
    if (!isOpen || !frameForAnnotation) {
        return null;
    }

    // Filter annotations for this specific frame - handle both data structures
    const frameAnnotations = currentStepAnnotations.filter(
        ann => getAnnotationTimestamp(ann) === frameTimestampMs
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
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: 0
                        }}>
                            Annotate Frame
                        </h2>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            margin: '4px 0 0 0'
                        }}>
                            Time: {formatTime(frameTimestampMs / 1000)}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '4px',
                            borderRadius: '4px'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div style={{
                    padding: '20px 24px'
                }}>
                    <div style={{
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '20px'
                    }}>
                        <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#1e40af',
                            margin: '0 0 8px 0'
                        }}>
                            How to annotate:
                        </h4>
                        <ul style={{
                            fontSize: '0.8rem',
                            color: '#1e40af',
                            margin: 0,
                            paddingLeft: '16px'
                        }}>
                            <li>Click and drag to create a rectangular annotation</li>
                            <li>Type a description for the highlighted area</li>
                            <li>Press Enter or click Submit to save the annotation</li>
                            <li>You can add multiple annotations to the same frame</li>
                        </ul>
                    </div>

                    {/* Annotation Interface */}
                    <div style={{
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        marginBottom: '20px',
                        maxHeight: '60vh',
                        display: 'flex',
                        justifyContent: 'center',
                        backgroundColor: '#f8fafc'
                    }}>
                        <Annotation
                            src={frameForAnnotation}
                            alt={`Frame at ${formatTime(frameTimestampMs / 1000)}`}
                            annotations={transformedAnnotations}
                            value={currentAnnotationTool}
                            onChange={setCurrentAnnotationTool}
                            onSubmit={handleAnnotationSubmit}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '60vh',
                                objectFit: 'contain'
                            }}
                        />
                    </div>

                    {/* Current Annotations List */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px'
                    }}>
                        <h4 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#374151',
                            margin: '0 0 12px 0'
                        }}>
                            Annotations on this frame ({frameAnnotations.length})
                        </h4>
                        
                        {frameAnnotations.length > 0 ? (
                            <div style={{
                                maxHeight: '120px',
                                overflowY: 'auto'
                            }}>
                                {frameAnnotations.map((ann, index) => {
                                    // Handle both data structures for displaying annotation text
                                    const annotationText = ann.component_name || ann.data?.text || 'Untitled annotation';
                                    const annotationId = ann.annotation_id || ann.data?.id;
                                    
                                    return (
                                        <div
                                            key={annotationId || `annotation-${index}`}
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: 'white',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px',
                                                marginBottom: '8px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div>
                                                <p style={{
                                                    margin: '0 0 4px 0',
                                                    fontWeight: '500',
                                                    color: '#374151'
                                                }}>
                                                    {annotationText}
                                                </p>
                                                <p style={{
                                                    margin: 0,
                                                    fontSize: '0.75rem',
                                                    color: '#6b7280'
                                                }}>
                                                    Type: {ann.geometry?.type || ann.annotation_type || 'rectangle'} • 
                                                    Position: ({(ann.data?.x || ann.data?.normalized_geometry?.x * 100 || 0).toFixed(1)}%, {(ann.data?.y || ann.data?.normalized_geometry?.y * 100 || 0).toFixed(1)}%)
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeAnnotation(annotationId)}
                                                style={{
                                                    backgroundColor: '#fecaca',
                                                    color: '#dc2626',
                                                    border: 'none',
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
                                color: '#6b7280',
                                fontStyle: 'italic',
                                margin: 0
                            }}>
                                No annotations yet. Click and drag on the image above to add one.
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
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <div style={{
                            fontSize: '0.875rem',
                            color: '#6b7280'
                        }}>
                            💡 Tip: You can annotate multiple areas on the same frame
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
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
    );
};

export default AnnotationPopup; 