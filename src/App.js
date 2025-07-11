import React, { useState } from "react";
import Register from "./components/AuthComponents/Register";
import Sidebar from "./components/Layout/Sidebar";
import MyProjects from "./components/pages/MyProjects";
import CreateProjectPage from "./components/pages/CreateProject";
import ProjectStepsPage from "./components/pages/CreateSteps";
import Repository from "./components/pages/Repository";
import { AuthProvider} from "./contexts/authContext";
import { useRoutes } from "react-router-dom";
import {ProtectedRoute, ProtectedLogin} from "./components/Layout/ProtectedRoute";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const routesArray = [
    { path: "*", element:  <ProtectedRoute><MyProjects /></ProtectedRoute> },
    { path: "/login", element: <ProtectedLogin /> },
    { path: "/register", element: <Register /> },
    { path: "/my-projects", element: (<ProtectedRoute><MyProjects /></ProtectedRoute>)},
    { path: "/repository", element: (<ProtectedRoute><Repository /></ProtectedRoute>)},
    { path: "/create", element: (<ProtectedRoute><CreateProjectPage /></ProtectedRoute>)},
    {path: "/annotate", element: (<ProtectedRoute><ProjectStepsPage /></ProtectedRoute>)},
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