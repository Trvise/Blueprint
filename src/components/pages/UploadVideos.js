import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/authContext';
import { auth, db, storage } from '../../firebase/firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { v4 } from "uuid";
import Annotation from 'react-image-annotation';
import {
  collection,
  addDoc,
} from "firebase/firestore";
import Resizer from 'react-image-file-resizer';

const UploadVideos = () => {
  const { currentUser } = useAuth();
  const [image, setImage] = useState(null);
  const [videos, setVideos] = useState([]); // Array for multiple videos
  const [activeVideoIndex, setActiveVideoIndex] = useState(0); // Track which video is active
  const [videoUrls, setVideoUrls] = useState([]); // Array for multiple video URLs
  const [description, setDescription] = useState('');
  const [annotations, setAnnotations] = useState([]);
  const [annotation, setAnnotation] = useState({});
  const [loading, setLoading] = useState(false);
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [manualAnnotation, setManualAnnotation] = useState(false);
  const imageWidth = useRef(0);
  const imageHeight = useRef(0);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [frames, setFrames] = useState([]); // Kept for backward compatibility
  const videoRef = useRef(null);
  const [stageName, setStageName] = useState("");
  
  // MODIFIED DATA STRUCTURE:
  // Object to store frames grouped by stage name
  // Format: { "stageName1": [frame1, frame2, ...], "stageName2": [...] }
  // Each frame contains: frameImage, annotations, videoIndex
  const [stageFrames, setStageFrames] = useState({});
  
  // Track current active stage for UI interactions
  const [activeStage, setActiveStage] = useState("");
  
  // Maximum number of frames allowed per stage (configurable)
  // Increase this value if you need more frames per stage
  const MAX_FRAMES_PER_STAGE = 10;

  const itemsCollectionRef = collection(db, "itemsData");
  const allowedEmails = [
    "pranav.varma1801@gmail.com",
    "aadityav@trvise.com",
    "ethanwm@terravortex.com"
  ];
  const maxImageSize = 640;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    resizeImage(file, (resizedImage) => {
      setImage(resizedImage);
    });
  };

  const handleVideoChange = (e) => {
    if (!allowedEmails.includes(currentUser?.email)) {
      alert("Access Denied: You are not authorized to upload videos.");
      return;
    }
    
    const files = Array.from(e.target.files); // Convert FileList to Array
    if (files.length > 0) {
      // Create new arrays for videos and their URLs
      const newVideos = [...videos, ...files];
      const newVideoUrls = [...videoUrls];
      
      // Generate URLs for each new video
      files.forEach(file => {
        newVideoUrls.push(URL.createObjectURL(file));
      });
      
      setVideos(newVideos);
      setVideoUrls(newVideoUrls);
      
      // If this is the first video being added, make it active
      if (videos.length === 0) {
        setActiveVideoIndex(0);
      }
    }
  };

  // Function to switch active video
  const switchActiveVideo = (index) => {
    setActiveVideoIndex(index);
  };

  // Function to remove a video
  const removeVideo = (index) => {
    const newVideos = [...videos];
    const newVideoUrls = [...videoUrls];
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newVideoUrls[index]);
    
    // Remove the video and URL from the arrays
    newVideos.splice(index, 1);
    newVideoUrls.splice(index, 1);
    
    setVideos(newVideos);
    setVideoUrls(newVideoUrls);
    
    // If we're removing the active video, adjust the active index
    if (index === activeVideoIndex) {
      setActiveVideoIndex(Math.max(0, activeVideoIndex - 1));
    } else if (index < activeVideoIndex) {
      setActiveVideoIndex(activeVideoIndex - 1);
    }
  };

  const resizeImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const { newWidth, newHeight } = getResizedDimensions(img.width, img.height, maxImageSize);
        imageWidth.current = newWidth;
        imageHeight.current = newHeight;
        Resizer.imageFileResizer(
          file,
          newWidth,
          newHeight,
          'JPEG',
          100,
          0,
          (uri) => {
            callback(uri);
          },
          'blob'
        );
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const getResizedDimensions = (width, height, maxSize) => {
    if (height > width) {
      const scalingFactor = maxSize / height;
      return { newWidth: Math.floor(width * scalingFactor), newHeight: Math.floor(height * scalingFactor) };
    } else {
      const scalingFactor = maxSize / width;
      return { newWidth: Math.floor(width * scalingFactor), newHeight: Math.floor(height * scalingFactor) };
    }
  };

  const dataURLToBlob = (dataURL) => {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new Uint8Array(byteString.length);
  
    for (let i = 0; i < byteString.length; i++) {
      arrayBuffer[i] = byteString.charCodeAt(i);
    }
  
    return new Blob([arrayBuffer], { type: mimeString });
  };
  
  const handleUpload = async () => {
    if (!image) {
      alert("Please upload an image first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', image);

    try {
      const token = await auth.currentUser.getIdToken(true);
      const response = await axios.post('http://127.0.0.1:5000/detect_screws', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        const result = response.data;
        convertScrewLocationsToAnnotations(result.screw_locations);
        drawScrewLocations(result.screw_locations);
        setManualAnnotation(false);
      } else {
        alert(`Error: ${response.status} - ${response.data}`);
      }
    } catch (error) {
      alert(`Error uploading file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const drawScrewLocations = (locations) => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(image);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      locations.forEach(([x1, y1, x2, y2]) => {
        ctx.strokeStyle = '#1ABC9C';
        ctx.lineWidth = 2;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      });

      setAnnotatedImage(canvas.toDataURL());
    };
  };

  const convertScrewLocationsToAnnotations = (locations) => {
    const annotations = locations.map(([x1, y1, x2, y2]) => ({
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
    }));
    setAnnotations(annotations);
  };

  const handleSubmit = async () => {
    if (!description) {
      alert("Please enter a description.");
      return;
    }
  
    setLoading(true);
    try {
      let imgUrl = "";
      let videoUrls = []; // Changed to store multiple video URLs
      let stageData = []; // NEW: Array to store consolidated stage data
  
      // Upload and resize the image (if available)
      if (image !== null) {
        const resizedImage = await new Promise((resolve) => {
          resizeImage(image, resolve);
        });
  
        const imageRef = ref(storage, `${currentUser.email}/images/${image.name + v4()}`);
        await uploadBytes(imageRef, resizedImage);
        const imageUrl = await getDownloadURL(imageRef);
        imgUrl = imageUrl;
      }
  
      // Upload all videos
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const videoRef = ref(storage, `${currentUser.email}/videos/${video.name + v4()}`);
        await uploadBytes(videoRef, video);
        const url = await getDownloadURL(videoRef);
        videoUrls.push({
          videoIndex: i,
          videoUrl: url
        });
      }
  
      // NEW: Process frames by stage, consolidating them into one entry per stage
      for (const stageName of Object.keys(stageFrames)) {
        const stageFrameList = stageFrames[stageName];
        
        // Arrays to store all frame URLs and all annotations for this stage
        const stageFrameUrls = [];
        const stageAnnotations = [];
        const usedVideoIndices = new Set(); // Track which videos were used for this stage
        
        // Process all frames for this stage
        for (const frame of stageFrameList) {
          const frameBlob = dataURLToBlob(frame.frameImage);
          const resizedFrame = await new Promise((resolve) => {
            resizeImage(frameBlob, resolve);
          });
          
          const widthScaleFactor = imageWidth.current / 100;
          const heightScaleFactor = imageHeight.current / 100;
          
          // Upload the frame image
          const frameRef = ref(storage, `${currentUser.email}/frames/stage_${stageName}_frame_${stageFrameUrls.length}_${v4()}.jpg`);
          await uploadBytes(frameRef, resizedFrame);
          const frameUrl = await getDownloadURL(frameRef);
  
          // Add frame URL to this stage's frame URLs
          stageFrameUrls.push({
            frameIndex: stageFrameUrls.length,
            frameUrl: frameUrl,
            videoIndex: frame.videoIndex
          });
          
          // Track which video this frame came from
          usedVideoIndices.add(frame.videoIndex);
  
          // Scale and add annotations for this frame
          const scaledAnnotations = frame.annotations.map((annotation) => {
            return {
              frameIndex: stageFrameUrls.length - 1, // Index of the frame within this stage
              x1: Math.floor(annotation.geometry.x * widthScaleFactor),
              y1: Math.floor(annotation.geometry.y * heightScaleFactor),
              x2: Math.ceil((annotation.geometry.x + annotation.geometry.width) * widthScaleFactor),
              y2: Math.ceil((annotation.geometry.y + annotation.geometry.height) * heightScaleFactor),
              name: annotation.data.text || "",
            };
          });
          
          // Add all annotations for this frame to the stage annotations
          stageAnnotations.push(...scaledAnnotations);
        }

        // Add the consolidated stage data to our array
        stageData.push({
          stageName: stageName,
          frameUrls: stageFrameUrls,
          annotations: stageAnnotations,
          videoIndices: Array.from(usedVideoIndices),
          frameCount: stageFrameUrls.length
        });
      }

      console.log("Stage data:", stageData);
  
      // Save metadata to Firestore with the consolidated stage format
      await addDoc(itemsCollectionRef, {
        userId: currentUser.uid,
        email: currentUser.email,
        images: imgUrl,
        originalWidth: imageWidth.current,
        originalHeight: imageHeight.current,
        videos: videoUrls,
        stages: stageData, // Store consolidated stage data
        description: description,
        timestamp: new Date(),
      });
  
      alert("Data uploaded successfully!");
      
      // Reset state after successful upload
      setFrames([]);
      setStageFrames({});
      setActiveStage("");
      
    } catch (error) {
      console.error("Error submitting data:", error);
      alert(`Error submitting data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };  

  const handleManualAnnotation = () => {
    if (!image) {
      alert("Please upload an image first.");
      return;
    }

    setAnnotations([]);
    setManualAnnotation(true);
    setAnnotatedImage(null);
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameImage = canvas.toDataURL("image/png");
      setCurrentFrame(frameImage);
    }
  };
  
  // Functions to move forward and backward frame by frame
  const moveFrameForward = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime += 1/30; // Move forward approximately 1 frame (assuming 30fps)
    }
  };
  
  const moveFrameBackward = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime -= 1/30; // Move backward approximately 1 frame (assuming 30fps)
    }
  };
  
  // Add keyboard event listeners
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (videoRef.current) {
        if (e.key === 'c') {
          moveFrameForward();
        } else if (e.key === 'b') {
          moveFrameBackward();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Save the current frame to a stage
  const handleSaveFrame = () => {
    if (!stageName.trim()) {
      alert("Please enter a stage name before saving the frame.");
      return;
    }
    
    // Prepare the new frame data
    // Each frame contains the image, annotations, and source video index
    const newFrame = {
      frameImage: currentFrame,      // The captured image data
      annotations,                   // Array of annotation objects for this frame
      videoIndex: activeVideoIndex   // Which video this frame was captured from
    };
    
    // Update stageFrames state - our main consolidated data structure
    setStageFrames(prevStageFrames => {
      const newStageFrames = { ...prevStageFrames };
      
      // Initialize the array for this stage if it doesn't exist yet
      if (!newStageFrames[stageName]) {
        newStageFrames[stageName] = [];
      }
      
      // Check if we've reached the maximum frames for this stage
      if (newStageFrames[stageName].length >= MAX_FRAMES_PER_STAGE) {
        alert(`Maximum limit of ${MAX_FRAMES_PER_STAGE} frames reached for stage "${stageName}". Please use a different stage name.`);
        return prevStageFrames; // Return unchanged
      }
      
      // Add the new frame to this stage
      // All frames for a single stage will be processed together during submission
      newStageFrames[stageName] = [...newStageFrames[stageName], newFrame];
      
      // Set the active stage for UI purposes
      setActiveStage(stageName);
      
      return newStageFrames;
    });
    
    // Also add to frames array for backward compatibility
    // This array is no longer the primary data structure, but we maintain it
    // to avoid breaking existing code that might depend on it
    setFrames(prevFrames => [
      ...prevFrames,
      {
        frameImage: currentFrame,
        annotations,
        stageName,
        videoIndex: activeVideoIndex
      }
    ]);
    
    // Reset current annotation state
    setCurrentFrame(null);
    setAnnotations([]);
    
    // NOTE: We don't reset stageName to make it easier to add multiple frames to the same stage
    // This allows the user to quickly capture and save multiple frames for the current stage
  };
  
  // Function to remove a frame from a stage
  const removeFrameFromStage = (stageName, frameIndex) => {
    setStageFrames(prevStageFrames => {
      const newStageFrames = { ...prevStageFrames };
      
      if (newStageFrames[stageName]) {
        // Remove the frame at the specified index
        newStageFrames[stageName] = newStageFrames[stageName].filter((_, index) => index !== frameIndex);
        
        // If no frames left in this stage, remove the stage
        if (newStageFrames[stageName].length === 0) {
          delete newStageFrames[stageName];
          
          // If this was the active stage, reset active stage
          if (activeStage === stageName) {
            setActiveStage("");
          }
        }
      }
      
      return newStageFrames;
    });
    
    // We don't need to maintain the flat frames array anymore
    // since we're now using the consolidated stage-based approach
    // But we'll update it for compatibility with any existing code
    setFrames(prevFrames => {
      const allFrames = [];
      
      // Rebuild the flat array of frames from the stage structure
      for (const stageName of Object.keys(stageFrames)) {
        for (const frame of stageFrames[stageName]) {
          allFrames.push({
            ...frame,
            stageName
          });
        }
      }
      
      return allFrames;
    });
  };
  
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-8 relative">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Upload & Annotate Media</h1>
        <p className="text-base text-gray-600 mt-2">
          Upload images or videos and add descriptions.
        </p>
      </div>
  
      <div className={`space-y-4 ${loading ? 'opacity-50' : ''}`}>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Upload Videos</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            multiple
            className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-100 focus:outline-none"
          />
          <p className="text-xs text-gray-500">Supported formats: MP4, AVI. Max size: 50MB. You can select multiple videos.</p>
        </div>

        {/* Video Selection Section */}
        {videos.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Select Video to Annotate</label>
            <div className="flex flex-wrap gap-2">
              {videoUrls.map((url, index) => (
                <div 
                  key={index} 
                  className={`relative p-1 border rounded-lg ${activeVideoIndex === index ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}
                >
                  <button
                    onClick={() => switchActiveVideo(index)}
                    className="text-xs text-gray-900 focus:outline-none"
                  >
                    Video {index + 1}
                  </button>
                  <button 
                    onClick={() => removeVideo(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Playback Section - Now shows active video */}
        {videoUrls.length > 0 && (
          <div>
            <h3 className="text-lg font-medium">Video {activeVideoIndex + 1}</h3>
            <video ref={videoRef} controls src={videoUrls[activeVideoIndex]} className="w-full rounded-lg shadow-md"></video>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={captureFrame}
                className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
              >
                Annotate Frame
              </button>
              <button
                onClick={moveFrameBackward}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                title="Press 'b' key"
              >
                ◀ Frame
              </button>
              <button
                onClick={moveFrameForward}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                title="Press 'c' key"
              >
                Frame ▶
              </button>
              <p className="text-xs text-gray-500 flex items-center ml-2">
                Tip: Use 'b' key to go back 1 frame, 'c' key to advance 1 frame
              </p>
            </div>
          </div>
        )}

        {/* Frame Annotation Section */}
        {currentFrame && (
          <div>
            <h3 className="text-xl font-semibold mt-4">Annotate Current Frame</h3>
            <Annotation
              src={currentFrame}
              alt="Current Frame"
              annotations={annotations}
              value={annotation}
              onChange={setAnnotation}
              onSubmit={(newAnnotation) => {
                const { geometry, data } = newAnnotation;
                setAnnotations((prevAnnotations) => [
                  ...prevAnnotations,
                  {
                    geometry,
                    data: { ...data, id: Math.random() },
                  },
                ]);
                setAnnotation({});
              }}
              className="rounded-lg border border-gray-300 shadow-md"
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Stage Name</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  placeholder="Enter stage name for this frame..."
                  className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-100 p-2.5 focus:outline-none"
                />
                
                {/* NEW: Dropdown for quick selection of existing stages */}
                {Object.keys(stageFrames).length > 0 && (
                  <select 
                    className="text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-100 p-2.5 focus:outline-none"
                    onChange={(e) => {
                      if (e.target.value) setStageName(e.target.value);
                    }}
                    value=""
                  >
                    <option value="">Select existing stage</option>
                    {Object.keys(stageFrames).map((name) => (
                      <option key={name} value={name}>
                        {name} ({stageFrames[name].length}/{MAX_FRAMES_PER_STAGE})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {/* NEW: Stage frame count indicator */}
              {stageName && stageFrames[stageName] && (
                <p className="text-xs text-gray-500 mt-1">
                  This stage already has {stageFrames[stageName].length} frame(s). 
                  Maximum allowed: {MAX_FRAMES_PER_STAGE}.
                </p>
              )}
            </div>
            <button
              onClick={handleSaveFrame}
              className="mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Save This Frame To Stage
            </button>
          </div>
        )}

        {/* Stage-Based Frame Summary with Total Count */}
        {Object.keys(stageFrames).length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mt-4">Stages and Frames</h3>
            
            {Object.keys(stageFrames).map((stageName) => (
              <div key={stageName} className="mt-3 border border-gray-200 rounded-lg p-3">
                <h4 className="text-lg font-medium text-gray-800 flex justify-between">
                  <span>Stage: {stageName}</span>
                  <span className="text-blue-600 font-semibold">
                    {stageFrames[stageName].length}/{MAX_FRAMES_PER_STAGE} frames
                  </span>
                </h4>
                
                {/* Video sources used in this stage */}
                <div className="mt-1 text-sm text-gray-600">
                  Videos used: {Array.from(new Set(stageFrames[stageName].map(frame => frame.videoIndex))).map(idx => idx + 1).join(', ')}
                </div>
                
                {/* Frame list */}
                <ul className="list-disc pl-5 mt-2">
                  {stageFrames[stageName].map((frame, frameIndex) => (
                    <li key={frameIndex} className="flex justify-between items-center">
                      <span>
                        Frame {frameIndex + 1} (Video {frame.videoIndex + 1}): 
                        {frame.annotations.length} annotations
                      </span>
                      <button
                        onClick={() => removeFrameFromStage(stageName, frameIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                
                {/* Total annotations count for this stage */}
                <div className="mt-2 text-sm text-gray-700">
                  Total annotations: {stageFrames[stageName].reduce((sum, frame) => sum + frame.annotations.length, 0)}
                </div>
              </div>
            ))}
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">Summary:</div>
              <ul className="mt-1 text-sm">
                <li>Total stages: {Object.keys(stageFrames).length}</li>
                <li>Total frames: {Object.values(stageFrames).flat().length}</li>
                <li>Total annotations: {Object.values(stageFrames).flat().reduce((sum, frame) => sum + frame.annotations.length, 0)}</li>
              </ul>
            </div>
            
            <button
              onClick={handleSubmit}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none transition duration-150 ease-in-out shadow-md"
            >
              Submit All Stages ({Object.keys(stageFrames).length})
            </button>
          </div>
        )}
      </div>
  
      {/* Description Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Product Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter product description..."
          className="w-full h-20 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-100 p-2.5 focus:outline-none"
        ></textarea>
      </div>
  
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-gray-700" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            </svg>
            Loading...
          </div>
        </div>
      )}
      
      {annotatedImage && !manualAnnotation && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Detected Screw Locations</h2>
          <img src={annotatedImage} alt="Annotated" className="w-full rounded-lg border border-gray-300 shadow-md" />
          <button
            onClick={handleSubmit}
            className="mt-4 w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none transition duration-150 ease-in-out shadow-md"
          >
            Submit
          </button>
        </div>
      )}
  
      {manualAnnotation && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Annotate Screws Manually</h2>
          <Annotation
            src={URL.createObjectURL(image)}
            alt="Manual Annotation"
            annotations={annotations}
            value={annotation}
            onChange={setAnnotation}
            onSubmit={(newAnnotation) => {
              const { geometry, data } = newAnnotation;
              setAnnotations(
                annotations.concat({
                  geometry,
                  data: {
                    ...data,
                    id: Math.random()
                  }
                })
              );
              setAnnotation({});
            }}
            className="rounded-lg border border-gray-300 shadow-md"
          />
          <button
            onClick={handleSubmit}
            className="mt-4 w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none transition duration-150 ease-in-out shadow-md"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );  
};

export default UploadVideos;