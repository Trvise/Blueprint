// CreateStepsUtils.js - Utility functions for CreateSteps component
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../firebase/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

export const formatTime = (timeInSeconds) => {
    if (timeInSeconds === null || isNaN(timeInSeconds) || typeof timeInSeconds === 'undefined') return "00:00.000";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds * 1000) % 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
};

export const uploadFileToFirebase = async (file, pathPrefix, currentUser) => {
    if (!file) return null;
    if (!currentUser || !currentUser.uid) {
        throw new Error("User not authenticated for file upload.");
    }
    // Create a more unique file name for storage to avoid collisions
    const uniqueFileName = `${uuidv4()}-${file.name}`;
    const filePath = `${pathPrefix}/${uniqueFileName}`;
    const fileStorageRef = storageRef(storage, filePath);
    
    console.log(`Uploading ${file.name} to ${filePath}...`);
    const snapshot = await uploadBytes(fileStorageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`${file.name} uploaded. URL: ${downloadURL}`);
    return { url: downloadURL, path: filePath, name: file.name, type: file.type, size: file.size };
};

export const navigateFrame = (videoRef, direction) => {
    if (videoRef.current && videoRef.current.duration) {
        videoRef.current.pause();
        const frameDuration = 1 / 30; 
        let newTime = videoRef.current.currentTime + (direction === 'forward' ? frameDuration : -frameDuration);
        newTime = Math.max(0, Math.min(newTime, videoRef.current.duration));
        videoRef.current.currentTime = newTime;
    }
};

export const captureFrameForAnnotation = (videoRef, setFrameForAnnotation, setFrameTimestampMs, setCurrentStepAnnotations, setCurrentAnnotationTool, setErrorMessage) => {
    if (videoRef.current) {
        const video = videoRef.current;
        if (video.readyState < video.HAVE_METADATA) { 
            alert("Video metadata is not loaded yet."); return;
        }
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            alert("Video dimensions are not available. Cannot capture frame."); return;
        }
        if (!video.paused) { video.pause(); }
        const timestamp = Math.round(video.currentTime * 1000); 
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setFrameForAnnotation(canvas.toDataURL("image/jpeg")); 
            setFrameTimestampMs(timestamp);
            setCurrentStepAnnotations([]); 
            setCurrentAnnotationTool({});
        } catch (e) {
            console.error("Error capturing frame:", e);
            alert("Could not capture frame. Check CORS settings on video source if it's remote.");
            setErrorMessage("Error capturing frame (CORS).");
        }
    }
}; 