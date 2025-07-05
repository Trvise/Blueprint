import React from 'react';
import Annotation from 'react-image-annotation';

const VideoAnnotationTab = ({ 
    uploadedVideos, 
    activeVideoIndex, 
    activeVideoUrl, 
    videoRef, 
    videoDimensions,
    handleVideoSelection, 
    navigateFrame, 
    captureFrameForAnnotation, 
    frameForAnnotation,
    frameTimestampMs, 
    currentStepAnnotations, 
    currentAnnotationTool, 
    setCurrentAnnotationTool,
    handleAnnotationSubmit, 
    formatTime,
    currentStepStartTime,
    currentStepEndTime,
    markTime,
    styles,
    setErrorMessage
}) => {
    // Helper function to get current video time
    const getCurrentVideoTime = () => {
        if (videoRef.current) {
            return videoRef.current.currentTime;
        }
        return null;
    };

    return (
        <div>
            {uploadedVideos.length > 0 ? (
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>Project Videos</h2>
                    {uploadedVideos.length > 1 && (
                        <div style={{...styles.flexWrapGap2, marginBottom: '16px'}}>
                            {uploadedVideos.map((video, index) => (
                                <button 
                                    key={video.path || index} 
                                    onClick={() => handleVideoSelection(index)}
                                    style={{
                                        ...styles.button, 
                                        ...(activeVideoIndex === index ? styles.buttonPrimary : styles.buttonSecondarySm), 
                                        fontSize: '0.8rem', 
                                        padding: '6px 10px'
                                    }}
                                >
                                    Video {index + 1}{video.name ? `: ${video.name.substring(0,20)}...` : ''}
                                </button>
                            ))}
                        </div>
                    )}
                    {activeVideoUrl && (
                        <div style={{marginTop: '10px'}}>
                            <h3 style={{fontSize: '1.1rem', fontWeight: '500', marginBottom: '8px', color: '#34495e'}}>
                                Active: {uploadedVideos[activeVideoIndex]?.name || `Video ${activeVideoIndex + 1}`}
                            </h3>
                            <video 
                                ref={videoRef} 
                                key={activeVideoUrl} 
                                controls 
                                src={activeVideoUrl} 
                                crossOrigin="anonymous"
                                style={styles.videoPlayer}
                                onLoadedMetadata={() => { 
                                    if (videoRef.current) {
                                        videoDimensions.width = videoRef.current.videoWidth;
                                        videoDimensions.height = videoRef.current.videoHeight;
                                    }
                                }}
                                onError={(e) => { 
                                    console.error("Video Error:", e);
                                    console.error("Failed video URL:", activeVideoUrl);
                                    console.error("Video element:", e.target);
                                    setErrorMessage(`Error loading video: ${uploadedVideos[activeVideoIndex]?.name || 'Unknown video'}. Please check if the video file exists in Firebase Storage.`); 
                                }}
                            />
                            
                            {/* Video Time Controls */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '16px',
                                marginTop: '16px',
                                padding: '16px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div>
                                    <label style={{...styles.inputLabel, marginBottom: '8px'}}>Step Start Time</label>
                                    <button 
                                        onClick={() => {
                                            const currentTime = getCurrentVideoTime();
                                            if (currentTime !== null) {
                                                markTime('start');
                                            } else {
                                                setErrorMessage("Please ensure video is loaded before marking time.");
                                            }
                                        }}
                                        style={{
                                            ...styles.button,
                                            width: '100%',
                                            backgroundColor: currentStepStartTime !== null ? '#28a745' : '#6c757d'
                                        }}
                                    >
                                        Mark Start Time
                                    </button>
                                    {currentStepStartTime !== null && (
                                        <p style={{...styles.timeDisplay, marginTop: '8px'}}>
                                            Start: {formatTime(currentStepStartTime)}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label style={{...styles.inputLabel, marginBottom: '8px'}}>Step End Time</label>
                                    <button 
                                        onClick={() => {
                                            const currentTime = getCurrentVideoTime();
                                            if (currentTime !== null) {
                                                if (currentStepStartTime !== null && currentTime <= currentStepStartTime) {
                                                    setErrorMessage("End time must be after start time");
                                                    return;
                                                }
                                                markTime('end');
                                            } else {
                                                setErrorMessage("Please ensure video is loaded before marking time.");
                                            }
                                        }}
                                        style={{
                                            ...styles.button,
                                            width: '100%',
                                            backgroundColor: currentStepEndTime !== null ? '#dc3545' : '#6c757d'
                                        }}
                                    >
                                        Mark End Time
                                    </button>
                                    {currentStepEndTime !== null && (
                                        <p style={{...styles.timeDisplay, marginTop: '8px'}}>
                                            End: {formatTime(currentStepEndTime)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div style={{...styles.flexWrapGap2, ...styles.itemsCenter, marginTop: '12px'}}>
                                <button 
                                    onClick={() => navigateFrame('backward')} 
                                    style={{...styles.button, ...styles.buttonSecondarySm}}
                                >
                                    ◀ Frame (b)
                                </button>
                                <button 
                                    onClick={() => navigateFrame('forward')} 
                                    style={{...styles.button, ...styles.buttonSecondarySm}}
                                >
                                    (c) Frame ▶
                                </button>
                                <button 
                                    onClick={captureFrameForAnnotation} 
                                    style={{...styles.button, backgroundColor: '#3498db', color: 'white'}}
                                >
                                    Annotate This Frame
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{...styles.card, textAlign: 'center'}}>
                    <p>No videos available for annotation.</p>
                </div>
            )}
            
            {frameForAnnotation && (
                <div style={{...styles.card, marginTop: '24px'}}>
                    <h2 style={styles.sectionTitle}>Annotate Frame (Time: {formatTime(frameTimestampMs / 1000)})</h2>
                    {videoDimensions.width > 0 && (
                        <p style={{fontSize: '0.8rem', color: '#555', marginBottom: '8px'}}>
                            Video Res: {videoDimensions.width}x{videoDimensions.height}
                        </p>
                    )}
                    <div style={{...styles.annotationAreaContainer, maxWidth: `${videoDimensions.width || 500}px`}}>
                        <Annotation 
                            src={frameForAnnotation} 
                            alt="Annotation Frame"
                            annotations={currentStepAnnotations.filter(ann => ann.data.frame_timestamp_ms === frameTimestampMs)}
                            value={currentAnnotationTool} 
                            onChange={setCurrentAnnotationTool} 
                            onSubmit={handleAnnotationSubmit} 
                        />
                    </div>
                    <div style={{marginTop: '12px', fontSize: '0.8rem', color: '#555', maxHeight: '100px', overflowY: 'auto'}}>
                        <h4 style={{fontWeight: '600', marginBottom: '4px'}}>Annotations on this frame:</h4>
                        {currentStepAnnotations
                            .filter(ann => ann.data.frame_timestamp_ms === frameTimestampMs)
                            .map((ann, annIndex) => (
                                <div key={ann.data.id || `frame-ann-${annIndex}`} style={{padding: '2px 0', borderBottom: '1px solid #f0f0f0'}}>
                                    <p><strong>{ann.data.text}</strong> (Type: {ann.geometry.type})</p>
                                    <p>
                                        Coords ({ann.data.normalized_geometry.isPixelValue ? "Raw" : "Norm"}): 
                                        X:{ann.data.normalized_geometry.x.toFixed(ann.data.normalized_geometry.isPixelValue ? 0 : 3)}, 
                                        Y:{ann.data.normalized_geometry.y.toFixed(ann.data.normalized_geometry.isPixelValue ? 0 : 3)},
                                        W:{ann.data.normalized_geometry.width.toFixed(ann.data.normalized_geometry.isPixelValue ? 0 : 3)}, 
                                        H:{ann.data.normalized_geometry.height.toFixed(ann.data.normalized_geometry.isPixelValue ? 0 : 3)}
                                    </p>
                                </div>
                            ))}
                        {currentStepAnnotations.filter(ann => ann.data.frame_timestamp_ms === frameTimestampMs).length === 0 && (
                            <p>No annotations yet for this frame.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoAnnotationTab; 