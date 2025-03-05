import React, { useState, useRef } from 'react'; // Added useRef for video playback
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
  const [video, setVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null); // NEW: Store video URL for playback
  const [description, setDescription] = useState('');
  const [annotations, setAnnotations] = useState([]);
  const [annotation, setAnnotation] = useState({});
  const [loading, setLoading] = useState(false);
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [manualAnnotation, setManualAnnotation] = useState(false);
  const imageWidth = useRef(0);
  const imageHeight = useRef(0);
  const [currentFrame, setCurrentFrame] = useState(null); // NEW: Store the captured frame for annotation
  const [frames, setFrames] = useState([]); // NEW: Store annotated frames
  const videoRef = useRef(null); // NEW: Reference for the video player
  const [stageName, setStageName] = useState(""); // NEW: Store the stage name for the frame

  const itemsCollectionRef = collection(db, "itemsData");
  const maxImageSize = 640;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    resizeImage(file, (resizedImage) => {
      setImage(resizedImage);
    });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file); // Store the video file
      setVideoUrl(URL.createObjectURL(file)); // NEW: Generate local URL for playback
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
    const byteString = atob(dataURL.split(',')[1]); // Decode base64 string
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]; // Extract MIME type
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
      const token = await auth.currentUser.getIdToken(true); // Get the ID token
      const response = await axios.post('http://127.0.0.1:5000/detect_screws', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        const result = response.data;
        convertScrewLocationsToAnnotations(result.screw_locations);
        drawScrewLocations(result.screw_locations);
        setManualAnnotation(false); // Disable manual annotation if automatic detection is done
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
        ctx.strokeStyle = '#1ABC9C';  // Changed to a more vibrant green
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
      let videoUrl = "";
      let frameUrls = []; // NEW: Array to store all frame URLs
      let allScrewLocations = []; // Array to store screw locations for all frames
  
      // Upload and resize the image (if available)
      if (image !== null) {
        const resizedImage = await new Promise((resolve) => {
          resizeImage(image, resolve); // Use the existing resizeImage function
        });
  
        const imageRef = ref(storage, `${currentUser.email}/images/${image.name + v4()}`);
        await uploadBytes(imageRef, resizedImage);
        const imageUrl = await getDownloadURL(imageRef);
        imgUrl = imageUrl;
      }
  
      // Upload the video (if available)
      if (video !== null) {
        const videoRef = ref(storage, `${currentUser.email}/videos/${video.name + v4()}`);
        await uploadBytes(videoRef, video);
        videoUrl = await getDownloadURL(videoRef);
      }
  
  
      const uploadedFrames = await Promise.all(
        frames.map(async (frame, index) => {
          // Resize the frame image
          const frameBlob = dataURLToBlob(frame.frameImage);
          const resizedFrame = await new Promise((resolve) => {
            resizeImage(frameBlob, resolve); // Use the existing resizeImage function
          });
          
          
          const widthScaleFactor = imageWidth.current / 100;
          const heightScaleFactor = imageHeight.current / 100;
          console.log("Width scale factor:", widthScaleFactor);
          console.log("Height scale factor:", heightScaleFactor);
          // Upload the resized frame to Firebase Storage
          const frameRef = ref(storage, `${currentUser.email}/frames/frame_${index}_${v4()}.jpg`);
          await uploadBytes(frameRef, resizedFrame);
          const frameUrl = await getDownloadURL(frameRef);
  
          // Add the frame URL to the array
          frameUrls.push({
            frameIndex: index,
            frameUrl: frameUrl,
          }); // NEW: Store each frame URL
  
          // Scale annotations for this frame
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
            annotations: scaledAnnotations,
            stageName: frame.stageName,
          });
  
          return frameUrl; // Return frame URL for further processing if needed
        })
      );

      console.log("All screw locations:", allScrewLocations);
  
      // Save metadata to Firestore
      await addDoc(itemsCollectionRef, {
        userId: currentUser.uid,
        email: currentUser.email,
        images: imgUrl, // Array of uploaded image URLs
        originalWidth: imageWidth.current,
        originalHeight: imageHeight.current,
        video: videoUrl, // Video URL
        frames: frameUrls, // NEW: Array of uploaded frame URLs
        screw_locations: allScrewLocations, // Array of screw locations for each frame
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

    setAnnotations([]); // Clear previous annotations
    setManualAnnotation(true);
    setAnnotatedImage(null);
  };

  // NEW: Capture the current frame from the video
  const captureFrame = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameImage = canvas.toDataURL("image/png");
      setCurrentFrame(frameImage); // Store the captured frame
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
        stageName, // Store the stage name for this frame
      },
    ]);
    setCurrentFrame(null); // Clear current frame
    setAnnotations([]); // Clear annotations for the frame
    setStageName(""); // Clear stage name for the next frame
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
        {/* Existing Image Upload Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-100 focus:outline-none"
          />
          <p className="text-xs text-gray-500">Supported formats: JPEG, PNG. Max size: 5MB.</p>
        </div>
  
        {/* Existing Video Upload Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Upload Video</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-100 focus:outline-none"
          />
          <p className="text-xs text-gray-500">Supported formats: MP4, AVI. Max size: 50MB.</p>
        </div>

        {/* NEW: Video Playback Section */}
        {videoUrl && (
          <div>
            <video ref={videoRef} controls src={videoUrl} className="w-full rounded-lg shadow-md"></video>
            <button
              onClick={captureFrame}
              className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
            >
              Annotate Frame
            </button>
          </div>
        )}

        {/* NEW: Frame Annotation Section */}
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

        {/* NEW: Annotated Frames Summary */}
        {frames.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mt-4">Annotated Frames</h3>
            <ul className="list-disc pl-5">
              {frames.map((frame, index) => (
                <li key={index}>
                  Frame {index + 1}: {frame.annotations.length} annotations
                </li>
              ))}
            </ul>
            <button
              onClick={handleSubmit} // Call the updated handleSubmit function
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none transition duration-150 ease-in-out shadow-md"
            >
              Submit All Video Annotations
            </button>
          </div>
        )}
      </div>
  
      {/* Existing Description Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Product Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter product description..."
          className="w-full h-20 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-100 p-2.5 focus:outline-none"
        ></textarea>
      </div>
  
      {/* Existing Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleUpload}
          className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none transition duration-150 ease-in-out shadow-md"
        >
          {loading ? 'Uploading...' : 'Detect Steps Automatically (Beta)'}
        </button>
        <button
          onClick={handleManualAnnotation}
          className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none transition duration-150 ease-in-out shadow-md"
        >
          Annotate
        </button>
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