import React, { useState } from 'react';
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
  const [description, setDescription] = useState('');
  const [annotations, setAnnotations] = useState([]);
  const [annotation, setAnnotation] = useState({});
  const [loading, setLoading] = useState(false);
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [manualAnnotation, setManualAnnotation] = useState(false);
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const itemsCollectionRef = collection(db, "itemsData");
  const maxImageSize = 640;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    resizeImage(file, (resizedImage) => {
      setImage(resizedImage);
    });
  };

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const resizeImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const { newWidth, newHeight } = getResizedDimensions(img.width, img.height, maxImageSize);
        setImgWidth(newWidth);
        setImgHeight(newHeight);
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
      // Create storage references
      let imageUrl = "";
      let videoUrl = "";
      if (image !== null) {
        const imageRef = ref(storage, `${currentUser.email}/images/${image.name + v4()}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      if (video !== null) {
        const videoRef = ref(storage, `${currentUser.email}/videos/${video.name + v4()}`);
        await uploadBytes(videoRef, video);
        videoUrl = await getDownloadURL(videoRef);
      }

      const widthScaleFactor = imgWidth / 100;
      const heightScaleFactor = imgHeight / 100;
      
      let newAnnotations = null;
      if (manualAnnotation) {
        newAnnotations = annotations.map((annotation) => {
          return {
            x1: Math.floor(annotation.geometry.x * widthScaleFactor),
            y1: Math.floor(annotation.geometry.y * heightScaleFactor),
            x2: Math.ceil((annotation.geometry.x + annotation.geometry.width) * widthScaleFactor),
            y2: Math.ceil((annotation.geometry.y + annotation.geometry.height) * heightScaleFactor),
          };
        });
      }

      console.log('Annotations:', manualAnnotation ? newAnnotations : annotations);
      // Save metadata to Firestore
      await addDoc(itemsCollectionRef, {
        userId: currentUser.uid,
        email: currentUser.email,
        image: imageUrl,
        video: videoUrl,
        screw_locations: manualAnnotation ? newAnnotations : annotations,
        description: description,
        timestamp: new Date()
      });

      alert('Data uploaded successfully!');
    } catch (error) {
      console.error('Error submitting data:', error);
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

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg space-y-8 relative">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Upload & Annotate Media</h1>
        <p className="text-base text-gray-600 mt-2">
          Upload images or videos, annotate screw locations, and add descriptions.
        </p>
      </div>
  
      <div className={`space-y-4 ${loading ? 'opacity-50' : ''}`}>
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
  
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Product Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description..."
            className="w-full h-20 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-100 p-2.5 focus:outline-none"
          ></textarea>
        </div>
  
        <div className="flex gap-4">
          <button
            onClick={handleUpload}
            className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none transition duration-150 ease-in-out shadow-md"
          >
            {loading ? 'Uploading...' : 'Detect Screws Automatically (Beta)'}
          </button>
          <button
            onClick={handleManualAnnotation}
            className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none transition duration-150 ease-in-out shadow-md"
          >
            Annotate Screws
          </button>
        </div>
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