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
        console.error('Error:', response.status, response.data);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
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
        ctx.strokeStyle = 'green';
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
    <div className="max-w-3xl mx-auto p-4">
      <div className="text-2xl font-bold pt-14">Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.</div>
      <div className={`mt-8 ${loading ? 'opacity-50' : ''}`}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Upload Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Upload Video:</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product Description"
          className="mb-4 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 p-2.5 focus:outline-none"
        ></textarea>
        <div className="flex gap-4">
          <button
            onClick={handleUpload}
            className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none"
          >
            {loading ? 'Uploading...' : 'Detect Screws Automatically (Beta)'}
          </button>
          <button
            onClick={handleManualAnnotation}
            className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-700 focus:outline-none"
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
          <h2 className="text-xl font-bold">Detected Screw Locations:</h2>
          <img src={annotatedImage} alt="Annotated" className="w-full" />
          <button
            onClick={handleSubmit}
            className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-700 focus:outline-none"
          >
            Submit
          </button>
        </div>
      )}
      {manualAnnotation && (
        <div className="mt-8">
          <h2 className="text-xl font-bold">Annotate Screws Manually:</h2>
          <Annotation
            src={URL.createObjectURL(image)}
            alt="Manual Annotation"
            annotations={annotations}
            value={annotation}
            onChange={setAnnotation}
            onSubmit={(newAnnotation) => {
              const { geometry, data } = newAnnotation;
              console.log(geometry);
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
          />
          <button
            onClick={handleSubmit}
            className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-700 focus:outline-none"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadVideos;