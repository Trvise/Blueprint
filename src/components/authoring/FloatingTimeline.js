import React, { useState, useEffect, useRef } from 'react';

const FloatingTimeline = ({
    videoRef,
    projectSteps,
    currentStepStartTime,
    currentStepEndTime,
    setCurrentStepStartTime,
    setCurrentStepEndTime,
    formatTime,
    styles,
    isVisible = true
}) => {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragType, setDragType] = useState(null); // 'start', 'end', 'playhead'
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    
    const timelineRef = useRef(null);
    const scrollContainerRef = useRef(null);
    
    const videoDuration = videoRef?.current?.duration || 0;
    
    // Calculate timeline dimensions based on zoom
    const timelineWidth = Math.max(1000 * zoomLevel, window.innerWidth - 256); // 256px for sidebar
    const pixelsPerSecond = timelineWidth / videoDuration;
    
    // Generate ruler marks
    const generateRulerMarks = () => {
        const marks = [];
        const interval = zoomLevel >= 2 ? 1 : zoomLevel >= 1 ? 5 : 10; // Show marks every 1s, 5s, or 10s based on zoom
        
        for (let i = 0; i <= videoDuration; i += interval) {
            marks.push({
                time: i,
                position: (i / videoDuration) * 100
            });
        }
        return marks;
    };
    
    // Handle timeline click to seek
    const handleTimelineClick = (e) => {
        if (!videoRef.current || isDragging) return;
        
        const rect = timelineRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left + scrollPosition;
        const clickPercent = clickX / timelineWidth;
        const newTime = clickPercent * videoDuration;
        
        videoRef.current.currentTime = Math.max(0, Math.min(newTime, videoDuration));
    };
    
    // Handle marker dragging
    const handleMarkerMouseDown = (e, type) => {
        e.stopPropagation();
        setIsDragging(true);
        setDragType(type);
    };
    
    // Handle mouse move for dragging
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging || !videoRef.current) return;
            
            const rect = timelineRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left + scrollPosition;
            const mousePercent = mouseX / timelineWidth;
            const newTime = mousePercent * videoDuration;
            const clampedTime = Math.max(0, Math.min(newTime, videoDuration));
            
            if (dragType === 'start') {
                if (currentStepEndTime === null || clampedTime < currentStepEndTime) {
                    setCurrentStepStartTime(clampedTime);
                }
            } else if (dragType === 'end') {
                if (currentStepStartTime === null || clampedTime > currentStepStartTime) {
                    setCurrentStepEndTime(clampedTime);
                }
            } else if (dragType === 'playhead') {
                videoRef.current.currentTime = clampedTime;
            }
        };
        
        const handleMouseUp = () => {
            setIsDragging(false);
            setDragType(null);
        };
        
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragType, videoRef, timelineWidth, scrollPosition, videoDuration, currentStepStartTime, currentStepEndTime, setCurrentStepStartTime, setCurrentStepEndTime]);
    
    // Handle scroll
    const handleScroll = (e) => {
        setScrollPosition(e.target.scrollLeft);
    };
    
    // Zoom functions
    const zoomIn = () => {
        setZoomLevel(prev => Math.min(prev * 1.5, 10));
    };
    
    const zoomOut = () => {
        setZoomLevel(prev => Math.max(prev / 1.5, 0.1));
    };
    
    // Track video current time in real-time
    useEffect(() => {
        if (!videoRef.current) return;
        
        const video = videoRef.current;
        
        const updateCurrentTime = () => {
            setCurrentTime(video.currentTime);
        };
        
        // Update on timeupdate event (fires multiple times per second during playback)
        video.addEventListener('timeupdate', updateCurrentTime);
        
        // Also update on seeked event (when user manually seeks)
        video.addEventListener('seeked', updateCurrentTime);
        
        // Initial update
        updateCurrentTime();
        
        return () => {
            video.removeEventListener('timeupdate', updateCurrentTime);
            video.removeEventListener('seeked', updateCurrentTime);
        };
    }, [videoRef]);
    
    // Auto-scroll to current time
    useEffect(() => {
        if (!scrollContainerRef.current || !videoRef.current) return;
        
        const currentTimePercent = currentTime / videoDuration;
        const scrollTo = (currentTimePercent * timelineWidth) - (scrollContainerRef.current.clientWidth / 2);
        
        scrollContainerRef.current.scrollTo({
            left: Math.max(0, scrollTo),
            behavior: 'smooth'
        });
    }, [currentTime, videoDuration, timelineWidth]);
    
    if (!isVisible) return null;
    
    return (
        <>
            {/* Floating Timeline */}
            <div style={{
                ...styles.floatingTimeline,
                ...(isCollapsed && styles.floatingTimelineCollapsed)
            }}>
                {/* Timeline Header */}
                <div style={styles.timelineHeader}>
                    <div style={styles.timelineTitle}>
                        Video Timeline {videoDuration > 0 && `(${formatTime(videoDuration)})`}
                    </div>
                    <div style={styles.timelineControls}>
                        <div style={styles.zoomControl}>
                            <button
                                onClick={zoomOut}
                                style={styles.zoomButton}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#F1C232'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#333'}
                            >
                                -
                            </button>
                            <span style={styles.zoomLevel}>{Math.round(zoomLevel * 100)}%</span>
                            <button
                                onClick={zoomIn}
                                style={styles.zoomButton}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#F1C232'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#333'}
                            >
                                +
                            </button>
                        </div>
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            style={styles.zoomButton}
                        >
                            {isCollapsed ? '▼' : '▲'}
                        </button>
                    </div>
                </div>
                
                {!isCollapsed && (
                    <div style={styles.timelineBody}>
                        <div 
                            ref={scrollContainerRef}
                            style={styles.timelineScrollContainer}
                            onScroll={handleScroll}
                        >
                            <div 
                                ref={timelineRef}
                                style={{
                                    ...styles.timelineTrack,
                                    width: `${timelineWidth}px`,
                                    cursor: isDragging ? 'grabbing' : 'pointer'
                                }}
                                onClick={handleTimelineClick}
                            >
                                {/* Ruler */}
                                <div style={styles.timelineRuler}>
                                    {generateRulerMarks().map((mark, index) => (
                                        <React.Fragment key={index}>
                                            <div 
                                                style={{
                                                    ...styles.rulerMark,
                                                    left: `${mark.position}%`
                                                }}
                                            />
                                            <div 
                                                style={{
                                                    ...styles.rulerLabel,
                                                    left: `${mark.position}%`
                                                }}
                                            >
                                                {formatTime(mark.time)}
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </div>
                                
                                {/* Background */}
                                <div style={styles.timelineBackground} />
                                
                                {/* Current time indicator */}
                                <div 
                                    style={{
                                        ...styles.currentTimeIndicator,
                                        left: `${(currentTime / videoDuration) * 100}%`,
                                        transition: isDragging ? 'none' : 'left 0.1s linear'
                                    }}
                                    onMouseDown={(e) => handleMarkerMouseDown(e, 'playhead')}
                                />
                                
                                {/* Project steps */}
                                {projectSteps.map((step, index) => (
                                    <div
                                        key={step.id || index}
                                        style={{
                                            ...styles.timelineStep,
                                            left: `${(step.video_start_time_ms / 1000 / videoDuration) * 100}%`,
                                            width: `${(((step.video_end_time_ms - step.video_start_time_ms) / 1000) / videoDuration) * 100}%`
                                        }}
                                        title={`Step ${index + 1}: ${step.name}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Move playhead to the start of the clicked step
                                            const stepStartTime = step.video_start_time_ms / 1000;
                                            if (videoRef.current) {
                                                videoRef.current.currentTime = stepStartTime;
                                            }
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#1a1aff';
                                            e.target.style.transform = 'scaleY(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = '#0000FF';
                                            e.target.style.transform = 'scaleY(1)';
                                        }}
                                    >
                                        <div style={styles.timelineStepLabel}>
                                            {index + 1}
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Annotation markers */}
                                {projectSteps.map((step, stepIndex) => 
                                    step.annotations?.map((annotation, annIndex) => {
                                        const annotationTimestamp = annotation.frame_timestamp_ms || annotation.data?.frame_timestamp_ms;
                                        if (!annotationTimestamp) return null;
                                        
                                        return (
                                            <div
                                                key={`annotation-${stepIndex}-${annIndex}`}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    bottom: 0,
                                                    width: '2px',
                                                    backgroundColor: '#f5f5dc', // Off-white color
                                                    left: `${(annotationTimestamp / 1000 / videoDuration) * 100}%`,
                                                    zIndex: 8,
                                                    cursor: 'pointer'
                                                }}
                                                title={`Annotation: ${annotation.component_name || annotation.data?.text || 'Untitled'} at ${formatTime(annotationTimestamp / 1000)}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Move playhead to the annotation timestamp
                                                    const annotationTime = annotationTimestamp / 1000;
                                                    if (videoRef.current) {
                                                        videoRef.current.currentTime = annotationTime;
                                                    }
                                                }}
                                            />
                                        );
                                    })
                                )}
                                
                                {/* Start marker */}
                                {currentStepStartTime !== null && (
                                    <div
                                        style={{
                                            ...styles.timelineMarker,
                                            ...styles.startMarker,
                                            left: `${(currentStepStartTime / videoDuration) * 100}%`
                                        }}
                                        onMouseDown={(e) => handleMarkerMouseDown(e, 'start')}
                                    >
                                        <div style={styles.markerHandle}>S</div>
                                        <div style={styles.markerTime}>
                                            {formatTime(currentStepStartTime)}
                                        </div>
                                    </div>
                                )}
                                
                                {/* End marker */}
                                {currentStepEndTime !== null && (
                                    <div
                                        style={{
                                            ...styles.timelineMarker,
                                            ...styles.endMarker,
                                            left: `${(currentStepEndTime / videoDuration) * 100}%`
                                        }}
                                        onMouseDown={(e) => handleMarkerMouseDown(e, 'end')}
                                    >
                                        <div style={styles.markerHandle}>E</div>
                                        <div style={styles.markerTime}>
                                            {formatTime(currentStepEndTime)}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Selection area */}
                                {currentStepStartTime !== null && currentStepEndTime !== null && (
                                    <div
                                        style={{
                                            ...styles.selectionArea,
                                            left: `${(currentStepStartTime / videoDuration) * 100}%`,
                                            width: `${((currentStepEndTime - currentStepStartTime) / videoDuration) * 100}%`
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div style={styles.timelineActionButtons}>
                            <button
                                onClick={() => {
                                    if (videoRef.current) {
                                        const currentTime = videoRef.current.currentTime;
                                        setCurrentStepStartTime(currentTime);
                                    }
                                }}
                                style={{
                                    ...styles.timelineButton,
                                    ...styles.timelineButtonPrimary
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                Mark Start
                            </button>
                            <button
                                onClick={() => {
                                    if (videoRef.current) {
                                        const currentTime = videoRef.current.currentTime;
                                        if (currentStepStartTime !== null && currentTime <= currentStepStartTime) {
                                            return; // End time must be after start time
                                        }
                                        setCurrentStepEndTime(currentTime);
                                    }
                                }}
                                style={{
                                    ...styles.timelineButton,
                                    ...styles.timelineButtonSecondary
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                Mark End
                            </button>
                            <button
                                onClick={() => {
                                    setCurrentStepStartTime(null);
                                    setCurrentStepEndTime(null);
                                }}
                                style={{
                                    ...styles.timelineButton,
                                    ...styles.timelineButtonDanger
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default FloatingTimeline; 