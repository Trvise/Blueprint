import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://127.0.0.1:8000'); // Connect to the WebSocket server

const ItemsList = () => {
  const [items, setItems] = useState([]);
  const [activeItemId, setActiveItemId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [annotatedImage, setAnnotatedImage] = useState(null);
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

    const savedActiveItemId = localStorage.getItem('activeItemId');
    const savedIsRunning = localStorage.getItem('isRunning') === 'true';

    if (savedActiveItemId) {
      setActiveItemId(savedActiveItemId);
      setIsRunning(savedIsRunning);
    }
  }, []);

  useEffect(() => {
    if (activeItemId) {
      localStorage.setItem('activeItemId', activeItemId);
    } else {
      localStorage.removeItem('activeItemId');
    }

    localStorage.setItem('isRunning', isRunning);
  }, [activeItemId, isRunning]);

  // WebSocket event listeners
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('video_frame', (frameData) => {
      // Convert received frame data to a Blob and create a URL
      const blob = new Blob([frameData], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
        }
      };
      img.src = url;
    });

    socket.on('process_started', () => {
      setIsRunning(true);
    });

    socket.on('process_stopped', () => {
      setIsRunning(false);
      setActiveItemId(null);
    });

    socket.on('process_error', (error) => {
      alert(`Error: ${error.error}`);
      setIsRunning(false);
    });

    return () => {
      socket.off('connect');
      socket.off('video_frame');
      socket.off('process_started');
      socket.off('process_stopped');
      socket.off('process_error');
    };
  }, []);

  const handleSendButtonClick = (item) => {
    if (isRunning && item.id !== activeItemId) {
      alert('Another process is running, please stop it before proceeding.');
      return;
    }

    if (item.id === activeItemId) {
      socket.emit('stop_process');
      return;
    }

    let base64Image = localStorage.getItem(`imageCache_${item.id}`);
    if (!base64Image) {
      fetch(item.image)
        .then((imageResponse) => imageResponse.blob())
        .then((imageBlob) => {
          const reader = new FileReader();
          reader.readAsDataURL(imageBlob);
          reader.onloadend = () => {
            base64Image = reader.result.split(',')[1];
            localStorage.setItem(`imageCache_${item.id}`, base64Image);
            startProcess(item, base64Image);
          };
        });
    } else {
      startProcess(item, base64Image);
    }
  };

  const startProcess = (item, base64Image) => {
    const payload = {
      image: base64Image,
      screw_locations: item.screw_locations,
    };

    socket.emit('start_process', payload);
    setActiveItemId(item.id);
    setShowModal(true);
  };

  const handleStopAllProcesses = () => {
    socket.emit('stop_process');
  };

  const handleViewAnnotationsClick = (item) => {
    setSelectedItem(item);
    drawScrewLocations(item.image, item.screw_locations, item.id);
    setShowModal(true);
  };

  const drawScrewLocations = async (imageUrl, locations, itemId) => {
    try {
      let base64Image = localStorage.getItem(`imageCache_${itemId}`);
      if (!base64Image) {
        const response = await fetch(imageUrl);
        const imageBlob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(imageBlob);
        base64Image = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
        });

        // Cache the image data in local storage
        localStorage.setItem(`imageCache_${itemId}`, base64Image);
      }

      const img = new Image();
      img.src = `data:image/jpeg;base64,${base64Image}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        locations.forEach(({ x1, y1, x2, y2 }) => {
          ctx.strokeStyle = '#1ABC9C';
          ctx.lineWidth = 2;
          ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        });

        setAnnotatedImage(canvas.toDataURL());
      };
    } catch (error) {
      console.error('Error loading image:', error);
    }
  };

  const handleCloseModal = () => {
    if (!annotatedImage) {
      socket.emit('stop_process');
    }
    setShowModal(false);
    setSelectedItem(null);
    setAnnotatedImage(null);
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
                <img src={item.image} alt="Item" className="absolute top-0 left-0 w-full h-full object-cover rounded-lg" />
              )}
            </div>
            <p className="mt-2 text-gray-700 text-sm">{item.description}</p>
            <p className="text-gray-500 text-xs">{new Date(item.timestamp.toDate()).toLocaleString()}</p>
            <div className="mt-4 flex space-x-2">
              <button
                className={`flex-1 py-2 px-3 rounded-lg focus:outline-none transition duration-150 ease-in-out text-sm font-semibold ${
                  item.id === activeItemId ? 'bg-red-500 text-white hover:bg-red-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                } ${isRunning && item.id !== activeItemId ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleSendButtonClick(item)}
                disabled={isRunning && item.id !== activeItemId}
              >
                {item.id === activeItemId ? 'Stop Process' : 'Start Process'}
              </button>
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
      <div className="mt-8 flex justify-center">
        <button
          className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 focus:outline-none transition duration-150 ease-in-out"
          onClick={handleStopAllProcesses}
        >
          Stop All Processes
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full mx-4 md:mx-6 lg:mx-8 max-h-full overflow-auto">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">{annotatedImage ? "Screw Annotations" : "Live View"}</h2>
            <div className="relative">
              {annotatedImage ? (
                <img
                  src={annotatedImage}
                  alt="Annotated Item"
                  className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg border border-gray-300"
                />
              ) : (
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg border border-gray-300"
                  width={640}
                  height={480}
                />
              )}
            </div>
            <div className="mt-6 flex justify-center">
              <button
                className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none transition duration-150 ease-in-out"
                onClick={handleCloseModal}
              >
                {annotatedImage ? 'Close' : 'Stop Process'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsList;