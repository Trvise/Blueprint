import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import ReactPlayer from 'react-player';

const ItemsList = () => {
  const [items, setItems] = useState([]);
  const itemsCollectionRef = collection(db, "itemsData");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await getDocs(itemsCollectionRef);
        setItems(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  const handleSendButtonClick = async (item) => {
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
        const response = await fetch('http://127.0.0.1:8000/connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to send data');
        }

        const result = await response.json();
        console.log('Server response:', result);
      } catch (error) {
        console.error('Error sending data:', error);
      }
    };
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Items List</h1>
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
              className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none"
              onClick={() => handleSendButtonClick(item)}
            >
              Send
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemsList;