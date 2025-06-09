import React, { forwardRef } from 'react';

const VideoManager = forwardRef(({ 
    styles, uploadedVideos, activeVideoIndex, activeVideoUrl, 
    onVideoSelect, onFrameNav, onAnnotateClick, onLoadedMetadata, onError 
}, ref) => {
    
    if (uploadedVideos.length === 0) {
        return (
            <div style={{...styles.card, textAlign: 'center'}}>
                <p style={{color: '#555'}}>No videos available for this project.</p>
            </div>
        );
    }

    return (
        <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Project Videos</h2>
            {uploadedVideos.length > 1 && (
                <div style={{...styles.flexWrapGap2, marginBottom: '16px'}}>
                    {uploadedVideos.map((video, index) => (
                        <button key={video.path || index} onClick={() => onVideoSelect(index)}
                            style={{...styles.button, ...(activeVideoIndex === index ? styles.buttonPrimary : styles.buttonSecondarySm), fontSize: '0.8rem', padding: '6px 10px'}}>
                            Video {index + 1}{video.name ? `: ${video.name.substring(0,20)}...` : ''}
                        </button>
                    ))}
                </div>
            )}
            {activeVideoUrl && (
                <div style={{marginTop: '10px'}}>
                    <h3 style={{fontSize: '1.1rem', fontWeight: '500', marginBottom: '8px', color: '#34495e'}}>Active: {uploadedVideos[activeVideoIndex]?.name || `Video ${activeVideoIndex + 1}`}</h3>
                    <video ref={ref} key={activeVideoUrl} controls src={activeVideoUrl} crossOrigin="anonymous"
                        style={styles.videoPlayer}
                        onLoadedMetadata={onLoadedMetadata}
                        onError={onError}
                    />
                    <div style={{...styles.flexWrapGap2, ...styles.itemsCenter, marginTop: '12px'}}>
                        <button onClick={() => onFrameNav('backward')} style={{...styles.button, ...styles.buttonSecondarySm}}>◀ Frame (b)</button>
                        <button onClick={() => onFrameNav('forward')} style={{...styles.button, ...styles.buttonSecondarySm}}>(c) Frame ▶</button>
                        <button onClick={onAnnotateClick} style={{...styles.button, backgroundColor: '#3498db', color: 'white'}}>Annotate This Frame</button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default VideoManager;