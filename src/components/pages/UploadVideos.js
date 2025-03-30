import React, { useState, useRef } from 'react';
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
  const [videos, setVideos] = useState([]); // Changed to array for multiple videos
  const [activeVideoIndex, setActiveVideoIndex] = useState(0); // NEW: Track which video is active
  const [videoUrls, setVideoUrls] = useState([]); // Changed to array for multiple video URLs
  const [description, setDescription] = useState('');
  const [annotations, setAnnotations] = useState([]);
  const [annotation, setAnnotation] = useState({});
  const [loading, setLoading] = useState(false);
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [manualAnnotation, setManualAnnotation] = useState(false);
  const imageWidth = useRef(0);
  const imageHeight = useRef(0);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [frames, setFrames] = useState([]);
  const videoRef = useRef(null);
  const [stageName, setStageName] = useState("");

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

  // NEW: Function to switch active video
  const switchActiveVideo = (index) => {
    setActiveVideoIndex(index);
  };

  // NEW: Function to remove a video
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
      let frameUrls = [];
      let allScrewLocations = [];
  
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
  
      const uploadedFrames = await Promise.all(
        frames.map(async (frame, index) => {
          const frameBlob = dataURLToBlob(frame.frameImage);
          const resizedFrame = await new Promise((resolve) => {
            resizeImage(frameBlob, resolve);
          });
          
          const widthScaleFactor = imageWidth.current / 100;
          const heightScaleFactor = imageHeight.current / 100;
          console.log("Width scale factor:", widthScaleFactor);
          console.log("Height scale factor:", heightScaleFactor);
          
          const frameRef = ref(storage, `${currentUser.email}/frames/frame_${index}_${v4()}.jpg`);
          await uploadBytes(frameRef, resizedFrame);
          const frameUrl = await getDownloadURL(frameRef);
  
          frameUrls.push({
            frameIndex: index,
            frameUrl: frameUrl,
            videoIndex: frame.videoIndex // NEW: Store which video this frame came from
          });
  
          const scaledAnnotations = frame.annotations.map((annotation) => {
            return {
              x1: Math.floor(annotation.geometry.x * widthScaleFactor),
              y1: Math.floor(annotation.geometry.y * heightScaleFactor),
              x2: Math.ceil((annotation.geometry.x + annotation.geometry.width) * widthScaleFactor),
              y2: Math.ceil((annotation.geometry.y + annotation.geometry.height) * heightScaleFactor),
              name: annotation.data.text || "",
            };
          });
  
          allScrewLocations.push({
            frameIndex: index,
            videoIndex: frame.videoIndex, // NEW: Store which video this frame came from
            annotations: scaledAnnotations,
            stageName: frame.stageName,
          });
  
          return frameUrl;
        })
      );

      console.log("All screw locations:", allScrewLocations);
  
      // Save metadata to Firestore
      await addDoc(itemsCollectionRef, {
        userId: currentUser.uid,
        email: currentUser.email,
        images: imgUrl,
        originalWidth: imageWidth.current,
        originalHeight: imageHeight.current,
        videos: videoUrls, // Changed to store multiple video URLs
        frames: frameUrls,
        screw_locations: allScrewLocations,
        description: description,
        timestamp: new Date(),
      });
  
      alert("Data uploaded successfully!");
    } catch (error) {
      console.error("Error submitting data:", error);
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

  const handleSaveFrame = () => {
    if (!stageName.trim()) {
      alert("Please enter a stage name before saving the frame.");
      return;
    }
    
    console.log("Saving frame with annotations:", annotations);
    setFrames((prevFrames) => [
      ...prevFrames,
      {
        frameImage: currentFrame,
        annotations,
        stageName,
        videoIndex: activeVideoIndex, // NEW: Store which video this frame came from
      },
    ]);
    setCurrentFrame(null);
    setAnnotations([]);
    setStageName("");
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
            multiple // NEW: Allow multiple file selection
            className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-100 focus:outline-none"
          />
          <p className="text-xs text-gray-500">Supported formats: MP4, AVI. Max size: 50MB. You can select multiple videos.</p>
        </div>

        {/* NEW: Video Selection Section */}
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
            <button
              onClick={captureFrame}
              className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
            >
              Annotate Frame
            </button>
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
              <input
                type="text"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="Enter stage name for this frame..."
                className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-100 p-2.5 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSaveFrame}
              className="mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Finish Annotating Frame
            </button>
          </div>
        )}

        {/* Annotated Frames Summary */}
        {frames.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mt-4">Annotated Frames</h3>
            <ul className="list-disc pl-5">
              {frames.map((frame, index) => (
                <li key={index}>
                  Frame {index + 1} (Video {frame.videoIndex + 1}): {frame.annotations.length} annotations - {frame.stageName}
                </li>
              ))}
            </ul>
            <button
              onClick={handleSubmit}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none transition duration-150 ease-in-out shadow-md"
            >
              Submit All Video Annotations
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