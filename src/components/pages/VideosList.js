import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import ReactPlayer from 'react-player';

const ItemsList = () => {
  const [items, setItems] = useState([]);
  const [activeItemId, setActiveItemId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const itemsCollectionRef = collection(db, "itemsData");

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

    // Load the saved state from localStorage on mount
    const savedActiveItemId = localStorage.getItem('activeItemId');
    const savedIsRunning = localStorage.getItem('isRunning') === 'true';

    if (savedActiveItemId) {
      setActiveItemId(savedActiveItemId);
      setIsRunning(savedIsRunning);
    }
  }, []);

  useEffect(() => {
    // Save the current state to localStorage whenever it changes
    if (activeItemId) {
      localStorage.setItem('activeItemId', activeItemId);
    } else {
      localStorage.removeItem('activeItemId');
    }

    localStorage.setItem('isRunning', isRunning);
  }, [activeItemId, isRunning]);

  const handleSendButtonClick = async (item) => {
    if (isRunning && item.id !== activeItemId) {
      alert('Another process is running, please stop it before proceeding.');
      return;
    }

    if (item.id === activeItemId) {
      try {
        const response = await fetch('http://127.0.0.1:8000/stop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to stop the process');
        }

        setIsRunning(false);
        setActiveItemId(null);
      } catch (error) {
        alert(`Error stopping the process: ${error.message}`);
      }
      return;
    }

    const imageResponse = await fetch(item.image);
    const imageBlob = await imageResponse.blob();
    const reader = new FileReader();
    reader.readAsDataURL(imageBlob);
    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1];

      const payload = {
        image: base64Image,
        screw_locations: item.screw_locations,
      };

      try {
        const response = await fetch('http://127.0.0.1:8000/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to send data');
        }

        const result = await response.json();
        console.log('Server response:', result);
        setIsRunning(true);
        setActiveItemId(item.id);
      } catch (error) {
        alert(`Error sending data: ${error.message}`);
      }
    };
  };

  const handleStopAllProcesses = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to stop all processes');
      }

      setIsRunning(false);
      setActiveItemId(null);
      localStorage.removeItem('activeItemId');
      localStorage.removeItem('isRunning');
      alert('All processes have been stopped successfully.');
    } catch (error) {
      alert(`Error stopping all processes: ${error.message}`);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Videos List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-300 rounded-lg p-4 shadow-md">
            <div className="mt-4">
              {item.video ? (
                <ReactPlayer url={item.video} controls width="100%" height="200px" />
              ) : (
                <img src={item.image} alt="Item" className="w-full h-48 object-cover rounded" />
              )}
            </div>
            <p className="mt-2 text-gray-700">{item.description}</p>
            <p className="text-gray-500 text-sm">{new Date(item.timestamp.toDate()).toLocaleString()}</p>
            <button
              className={`mt-4 font-bold py-2 px-4 rounded focus:outline-none ${item.id === activeItemId ? 'bg-red-500 text-white hover:bg-red-700' : 'bg-blue-500 text-white hover:bg-blue-700'} ${isRunning && item.id !== activeItemId ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleSendButtonClick(item)}
              disabled={isRunning && item.id !== activeItemId}
            >
              {item.id === activeItemId ? 'Stop' : 'Send'}
            </button>
          </div>
        ))}
      </div>
        <div className="mt-8 flex justify-center">
          <button
            className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 focus:outline-none"
            onClick={handleStopAllProcesses}
          >
            Stop All Processes
          </button>
        </div>
    </div>
  );
};

export default ItemsList;