import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';

const ItemsList = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [annotatedImages, setAnnotatedImages] = useState([]); // Store all annotation stages
  const [selectedStageIndex, setSelectedStageIndex] = useState(0); // Track the current stage
  const [stageNames, setStageNames] = useState([]); // Store stage names
  const canvasRef = useRef(null); // Reference to the canvas element
  const itemsCollectionRef = collection(db, 'itemsData');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getDocs(itemsCollectionRef);
        setItems(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        alert(`Error fetching items: ${error.message}`);
      }
    };

    fetchItems();
  }, []);

  const handleViewAnnotationsClick = (item) => {
    setSelectedItem(item);
    setSelectedStageIndex(0); // Reset to first stage
    generateAnnotatedImages(item.frames, item.screw_locations, item.originalWidth, item.originalHeight);
    setShowModal(true);
  };  

  const generateAnnotatedImages = async (frames, screwLocations, originalWidth, originalHeight) => {
    try {
      if (!frames || frames.length === 0) {
        console.error("No frames found for this video.");
        return;
      }
  
      let annotatedFrames = [];
      let stageNamesList = [];
  
      for (let i = 0; i < frames.length; i++) {
        const imageUrl = frames[i].frameUrl;
        const locations = screwLocations.find(stage => stage.frameIndex === i)?.annotations || [];
        const stageName = screwLocations.find(stage => stage.frameIndex === i)?.stageName || `Stage ${i + 1}`;
        stageNamesList.push(stageName);
  
        if (!imageUrl) {
          console.warn(`Skipping frame ${i + 1} as it has no valid image URL.`);
          continue;
        }
  
        const img = new Image();
        img.crossOrigin = "anonymous";  // ✅ FIX: Prevent CORS issue
        img.src = imageUrl;
  
        await new Promise((resolve) => (img.onload = resolve));
  
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        // ✅ FIX: Keep Canvas at 640x480 but scale images properly
        canvas.width = 640;
        canvas.height = 480;
        ctx.drawImage(img, 0, 0, 640, 480); 
  
        // ✅ FIX: Compute scale factors
        const widthScaleFactor = 640 / originalWidth;
        const heightScaleFactor = 480 / originalHeight;
  
        // ✅ Draw bounding boxes with annotation names
        locations.forEach(({ x1, y1, x2, y2, name }) => {
          ctx.strokeStyle = '#1ABC9C';
          ctx.lineWidth = 2;
          ctx.strokeRect(
            x1 * widthScaleFactor, 
            y1 * heightScaleFactor, 
            (x2 - x1) * widthScaleFactor, 
            (y2 - y1) * heightScaleFactor
          );

          // **Display annotation name**
          ctx.fillStyle = "rgba(26, 188, 156, 0.8)"; // Semi-transparent green
          ctx.fillRect(
            x1 * widthScaleFactor, 
            y1 * heightScaleFactor - 20, 
            (x2 - x1) * widthScaleFactor, 
            20
          );

          ctx.fillStyle = "white"; // Text color
          ctx.font = "14px Arial";
          ctx.fillText(name, x1 * widthScaleFactor + 5, y1 * heightScaleFactor - 5);
        });
  
        annotatedFrames.push(canvas.toDataURL()); 
      }
  
      setAnnotatedImages(annotatedFrames);
      setStageNames(stageNamesList);
    } catch (error) {
      console.error("Error generating annotated images:", error);
    }
  };  

  const handleNextStage = () => {
    if (selectedStageIndex < annotatedImages.length - 1) {
      setSelectedStageIndex(selectedStageIndex + 1);
    }
  };

  const handlePrevStage = () => {
    if (selectedStageIndex > 0) {
      setSelectedStageIndex(selectedStageIndex - 1);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setAnnotatedImages([]);
    setStageNames([]);
    setSelectedStageIndex(0);
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">Your Media Collection</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out">
            <div className="relative pb-56">
              {item.video ? (
                <ReactPlayer url={item.video} controls width="100%" height="100%" className="absolute top-0 left-0 w-full h-full rounded-lg overflow-hidden" />
              ) : (
                <img src={item.images} alt="Item" className="absolute top-0 left-0 w-full h-full object-cover rounded-lg" />
              )}
            </div>
            <p className="mt-2 text-gray-700 text-sm">{item.description}</p>
            <p className="text-gray-500 text-xs">{new Date(item.timestamp.toDate()).toLocaleString()}</p>
            <div className="mt-4 flex space-x-2">
              <button
                className="flex-1 py-2 px-3 rounded-lg focus:outline-none transition duration-150 ease-in-out text-sm font-semibold bg-green-500 text-white hover:bg-green-600"
                onClick={() => handleViewAnnotationsClick(item)}
              >
                View Annotations
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Annotated Images */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full mx-4 md:mx-6 lg:mx-8 max-h-full overflow-auto">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Screw Annotations</h2>

            {/* Display Stage Name */}
            <h3 className="text-lg font-semibold text-center text-gray-700">{stageNames[selectedStageIndex]}</h3>

            <div className="relative">
              {annotatedImages.length > 0 && (
                <img
                  src={annotatedImages[selectedStageIndex]}
                  alt="Annotated Frame"
                  className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg border border-gray-300"
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-4 flex justify-between">
              <button
                onClick={handlePrevStage}
                disabled={selectedStageIndex === 0}
                className="py-2 px-4 rounded-lg bg-gray-400 text-white font-semibold cursor-not-allowed"
              >
                Previous Stage
              </button>

              <button
                onClick={handleNextStage}
                disabled={selectedStageIndex === annotatedImages.length - 1}
                className="py-2 px-4 rounded-lg bg-green-500 text-white font-semibold"
              >
                Next Stage
              </button>
            </div>

            <p className="mt-4 text-center text-gray-700">
              Stage {selectedStageIndex + 1} of {annotatedImages.length}
            </p>

            <button onClick={handleCloseModal} className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-lg">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsList;