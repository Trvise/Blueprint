import React, { useState } from "react";

const DevicesList = () => {
  // Array of random device names
  const devices = ["Device A", "Device B", "Device C", "Device D", "Device E"];
  
  // State to track connected devices and their battery level
  const [connectedDevices, setConnectedDevices] = useState([]);

  const connectDevice = (deviceName) => {
    // Check if the device is already connected
    if (!connectedDevices.some((device) => device.name === deviceName)) {
      // Add the device to the connected devices with a random battery level
      setConnectedDevices([...connectedDevices, { name: deviceName, battery: Math.floor(Math.random() * 101) }]);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Available Devices</h1>
      <ul>
        {devices.map((device) => (
          <li key={device} className="flex items-center justify-between mb-2">
            <span>{device}</span>
            <button
              onClick={() => connectDevice(device)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Connect
            </button>
          </li>
        ))}
      </ul>
      <h1 className="text-2xl font-bold mt-8 mb-4">Connected Devices</h1>
      <ul>
        {connectedDevices.map((device, index) => (
          <li key={index} className="flex items-center justify-between mb-2">
            <span>{device.name}</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-300 rounded-full h-6 overflow-hidden mr-4">
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${device.battery}%` }}
                ></div>
              </div>
              <span>{device.battery}%</span> {/* Battery indicator on the side */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DevicesList;
