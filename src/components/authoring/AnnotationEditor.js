import React from 'react';
import Annotation from 'react-image-annotation'; 

const AnnotationEditor = ({ 
    styles, frameSrc, timestampMs, annotations, annotationTool, 
    onAnnotationChange, onAnnotationSubmit, videoDimensions, formatTime 
}) => {
    if (!frameSrc) {
        return null;
    }

    return (
        <div style={{...styles.card, marginTop: '24px'}}>
            <h2 style={styles.sectionTitle}>Annotate Frame (Time: {formatTime(timestampMs / 1000)})</h2>
            {videoDimensions.width > 0 && <p style={{fontSize: '0.8rem', color: '#555', marginBottom: '8px'}}>Video Res: {videoDimensions.width}x{videoDimensions.height}</p>}
            <div style={{...styles.annotationAreaContainer, maxWidth: `${videoDimensions.width || 500}px`}}>
                <Annotation 
                    src={frameSrc} 
                    alt={`Frame at ${formatTime(timestampMs / 1000)}`}
                    annotations={annotations}
                    value={annotationTool} 
                    onChange={onAnnotationChange} 
                    onSubmit={onAnnotationSubmit} 
                />
            </div>
            <div style={{marginTop: '12px', fontSize: '0.8rem', color: '#555', maxHeight: '100px', overflowY: 'auto'}}>
                <h4 style={{fontWeight: '600', marginBottom: '4px'}}>Annotations on this frame:</h4>
                {annotations.map(ann => (
                    <div key={ann.data.id} style={{padding: '2px 0', borderBottom: '1px solid #f0f0f0'}}>
                        <p><strong>{ann.data.text}</strong> (Type: {ann.geometry.type})</p>
                        <p>Coords ({ann.data.normalized_geometry.isPixelValue ? "Raw" : "Norm"}): 
                            X:{ann.data.normalized_geometry.x.toFixed(ann.data.normalized_geometry.isPixelValue ? 0 : 3)}, 
                            Y:{ann.data.normalized_geometry.y.toFixed(ann.data.normalized_geometry.isPixelValue ? 0 : 3)},
                            W:{ann.data.normalized_geometry.width.toFixed(ann.data.normalized_geometry.isPixelValue ? 0 : 3)}, 
                            H:{ann.data.normalized_geometry.height.toFixed(ann.data.normalized_geometry.isPixelValue ? 0 : 3)}
                        </p>
                    </div>
                ))}
                {annotations.length === 0 && <p>No annotations yet for this frame.</p>}
            </div>
        </div>
    );
};

export default AnnotationEditor;