// CommonComponents.js - Reusable UI components for pages
import React, { useState, useEffect, useRef } from 'react';
import trviseLogo from '../../../assets/trvise_logo.png';


// Lazy loading component for images
export const LazyImage = ({ src, alt, style, onError }) => {
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={imgRef} style={style}>
            {isInView ? (
                <img
                    src={src}
                    alt={alt}
                    style={style}
                    onError={onError}
                    loading="lazy"
                />
            ) : (
                <div style={{
                    ...style,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f3f4f6',
                    color: '#9ca3af'
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6"/>
                        <path d="m21 12-6-6-6 6-6-6"/>
                    </svg>
                </div>
            )}
        </div>
    );
};

// Video thumbnail component that only loads metadata
export const VideoThumbnail = ({ videoUrl, projectName }) => {
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);
    const videoRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={videoRef} style={{ width: '100%', height: '100%' }}>
            {isInView && !hasError ? (
                <video
                    src={videoUrl}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                    preload="metadata"
                    muted
                    onError={() => setHasError(true)}
                    onLoadedMetadata={(e) => {
                        // Set video to first frame
                        e.target.currentTime = 0.1;
                    }}
                />
            ) : hasError ? (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    color: '#9ca3af'
                }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                    <span style={{fontSize: '0.75rem'}}>Video unavailable</span>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    backgroundColor: '#f3f4f6',
                    color: '#9ca3af'
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <polygon points="23 7 16 12 23 17 23 7"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                </div>
            )}
        </div>
    );
};

// AnimatedLogo - Branded loading spinner with logo and rotating arc
export function AnimatedLogo({ size = 120, style = {} }) {
  const logoRef = useRef();
  const arc1Ref = useRef();
  const arc2Ref = useRef();
  const arc3Ref = useRef();

  useEffect(() => {
    let frame = 0;
    let running = true;
    function animate() {
      if (!running) return;
      frame++;
      const t = frame / 60;
      if (arc1Ref.current) arc1Ref.current.style.transform = `translate(-50%, -50%) rotate(${t * 360}deg)`;
      if (arc2Ref.current) arc2Ref.current.style.transform = `translate(-50%, -50%) rotate(${120 + t * 360}deg)`;
      if (arc3Ref.current) arc3Ref.current.style.transform = `translate(-50%, -50%) rotate(${240 + t * 360}deg)`;
      if (logoRef.current) {
        const scale = 1 + 0.06 * Math.sin(t * 2 * Math.PI);
        logoRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
      }
      requestAnimationFrame(animate);
    }
    animate();
    return () => { running = false; };
  }, []);

  const arcStyle = (color) => ({
    position: 'absolute',
    width: size * 1.25,
    height: size * 1.25,
    borderRadius: '50%',
    borderWidth: 6,
    borderStyle: 'solid',
    borderColor: `${color} transparent transparent transparent`,
    background: 'transparent',
    opacity: 0.85,
    top: '50%',
    left: '50%',
    pointerEvents: 'none',
    boxSizing: 'border-box',
    // transform is set dynamically in the animation loop
  });

  return (
    <div style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      <div ref={arc1Ref} style={arcStyle('#F1C232')} />
      <div ref={arc2Ref} style={arcStyle('#0050FF')} />
      <div ref={arc3Ref} style={arcStyle('#D9D9D9')} />
      <div ref={logoRef} style={{
        position: 'absolute',
        width: size * 0.82,
        height: size * 0.82,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: 'drop-shadow(0 0 16px #F1C23288)'
      }}>
        <img src={trviseLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', userSelect: 'none' }} />
      </div>
    </div>
  );
} 