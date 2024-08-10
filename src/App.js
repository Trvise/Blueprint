import React, { useState } from "react";
import Login from "./components/AuthComponents/Login";
import Register from "./components/AuthComponents/Register";
import Sidebar from "./components/Layout/Sidebar";
import UploadVideos from "./components/pages/UploadVideos";
import VideosList from "./components/pages/VideosList";
import { AuthProvider} from "./contexts/authContext";
import { useRoutes } from "react-router-dom";
import {ProtectedRoute} from "./components/Layout/ProtectedRoute";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const routesArray = [
    { path: "*", element: <Login /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/home", element: (<ProtectedRoute><UploadVideos /></ProtectedRoute>)},
    { path: "/videos", element: (<ProtectedRoute><VideosList /></ProtectedRoute>) },
  ];

  const routesElement = useRoutes(routesArray);

  return (
    <AuthProvider>
      <div className="flex">
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'} flex-1 p-8`}>
          <div className="w-full h-full flex flex-col">{routesElement}</div>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;