import React, { useState } from "react";
import Sidebar from "./components/Layout/Sidebar";
import UploadVideos from "./components/pages/UploadVideos";
import VideosList from "./components/pages/VideosList";
import DevicesList from "./components/pages/DevicesList";
import { useRoutes } from "react-router-dom";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const routesArray = [
    { path: "/home", element: <UploadVideos /> },
    { path: "/videos", element: <VideosList /> },
    { path: "/devices", element: <DevicesList /> },
    // Redirect any unknown path to /home
    { path: "*", element: <UploadVideos /> },
  ];

  const routesElement = useRoutes(routesArray);

  return (
    <div className="flex">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'} flex-1 p-8`}>
        <div className="w-full h-full flex flex-col">{routesElement}</div>
      </div>
    </div>
  );
}

export default App;
