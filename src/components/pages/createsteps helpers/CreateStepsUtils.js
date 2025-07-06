// CreateStepsUtils.js - Utility functions for CreateSteps component and common page utilities
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../../firebase/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// ====== COMMON UTILITY FUNCTIONS ======

// URL utility functions
export const isImageUrl = (url) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
};

export const isVideoUrl = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext));
};

// Date formatting function
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// API utility functions
export const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:8000';
};

export const createApiCall = async (endpoint, options = {}) => {
    const baseUrl = getApiUrl();
    const url = `${baseUrl}${endpoint}`;
    
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
};

// ====== CREATESTEPS SPECIFIC FUNCTIONS ======

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

export const captureFrameForAnnotation = (videoRef, setFrameForAnnotation, setFrameTimestampMs, setCurrentStepAnnotations, setCurrentAnnotationTool, setErrorMessage, setCapturedAnnotationFrames, setSuccessMessage, formatTime, setIsAnnotationPopupOpen) => {
    if (videoRef.current) {
        const video = videoRef.current;
        if (video.readyState < video.HAVE_METADATA || video.videoWidth === 0) { 
            alert("Video is not ready. Please wait a moment and try again."); return;
        }
        if (!video.paused) { video.pause(); }
        const timestamp = Math.round(video.currentTime * 1000); 
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        
        try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL("image/jpeg");
            const filename = `frame_${timestamp}.jpg`;
            const frameFile = dataURLtoFile(dataURL, filename);

            if(frameFile){
                // Store the file object in our state, keyed by its unique timestamp
                setCapturedAnnotationFrames(prev => ({ ...prev, [timestamp]: frameFile }));
                setSuccessMessage(`Frame captured at ${formatTime(timestamp / 1000)}.`);
            }

                            // This part remains to update the UI for annotation
                setFrameForAnnotation(dataURL);
                setFrameTimestampMs(timestamp);
                // Don't clear existing annotations - keep them for this frame
                setCurrentAnnotationTool({});
                
                // Open the annotation popup
                if (setIsAnnotationPopupOpen) {
                    setIsAnnotationPopupOpen(true);
                }
        } catch (e) {
            console.error("Error capturing frame:", e);
            setErrorMessage("Could not capture frame. Check browser permissions or video source.");
        }
    }
};

export const dataURLtoFile = (dataurl, filename) => {
    // This function is necessary because Firebase Storage works with File/Blob objects,
    // not base64 data URLs.
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        console.error("Invalid dataURL: mime type not found");
        return null;
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

// Helper function to download a Firebase Storage file as a File object
export const downloadFirebaseFileAsFileObject = async (path, filename) => {
    try {
        const fileRef = storageRef(storage, path);
        const downloadURL = await getDownloadURL(fileRef);
        
        const response = await fetch(downloadURL);
        const blob = await response.blob();
        
        // Create a File object from the blob
        const file = new File([blob], filename, { type: blob.type });
        return file;
    } catch (error) {
        console.error(`Error downloading file from path ${path}:`, error);
        return null;
    }
};

// Function to reconstruct capturedAnnotationFrames from existing project data
export const reconstructCapturedAnnotationFrames = async (projectSteps, setCapturedAnnotationFrames, setSuccessMessage) => {
    try {
        setSuccessMessage("Loading existing annotation frames...");
        const frameFiles = {};
        
        // Collect all unique frame timestamps and their paths from all steps
        const frameMap = new Map(); // timestamp -> { path, text }
        
        for (const step of projectSteps) {
            if (step.annotations && Array.isArray(step.annotations)) {
                for (const annotation of step.annotations) {
                    // Handle both database structure and local structure
                    const timestamp = annotation.frame_timestamp_ms || annotation.data?.frame_timestamp_ms;
                    const text = annotation.component_name || annotation.data?.text || 'annotation';
                    
                    // Check multiple possible paths for the frame image
                    const framePath = annotation.frame_image_file?.file_key || 
                                    annotation.frame_image_path ||
                                    annotation.data?.frame_image_path;
                    
                    if (timestamp && framePath && !frameMap.has(timestamp)) {
                        frameMap.set(timestamp, { path: framePath, text });
                    }
                }
            }
        }
        
        console.log(`Found ${frameMap.size} unique annotation frames to download`);
        
        // Download each unique frame file
        let downloadedCount = 0;
        for (const [timestamp, { path, text }] of frameMap) {
            setSuccessMessage(`Loading annotation frame ${downloadedCount + 1}/${frameMap.size}: ${text}...`);
            
            const filename = `frame_${timestamp}.jpg`;
            const fileObject = await downloadFirebaseFileAsFileObject(path, filename);
            
            if (fileObject) {
                frameFiles[timestamp] = fileObject;
                downloadedCount++;
                console.log(`Downloaded frame for timestamp ${timestamp}`);
            } else {
                console.warn(`Failed to download frame for timestamp ${timestamp} from path ${path}`);
            }
        }
        
        // Update the state with all downloaded frames
        setCapturedAnnotationFrames(frameFiles);
        
        const message = downloadedCount > 0 
            ? `Successfully loaded ${downloadedCount} annotation frames for editing.`
            : "No annotation frames found to load.";
        setSuccessMessage(message);
        
        console.log(`Reconstructed capturedAnnotationFrames with ${downloadedCount} frames:`, Object.keys(frameFiles));
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
        
        return frameFiles;
        
    } catch (error) {
        console.error("Error reconstructing annotation frames:", error);
        setSuccessMessage("Warning: Could not load some annotation frames. New frames can still be captured.");
        setTimeout(() => setSuccessMessage(''), 5000);
        return {};
    }
}; 