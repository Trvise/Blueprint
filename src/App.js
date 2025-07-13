import React, { useState, useEffect } from "react";
import Register from "./components/AuthComponents/Register";
import Sidebar from "./components/Layout/Sidebar";
import MyProjects from "./components/pages/MyProjects";
import CreateProjectPage from "./components/pages/CreateProject";
import ProjectStepsPage from "./components/pages/CreateSteps";
import Repository from "./components/pages/Repository";
import { AuthProvider} from "./contexts/authContext";
import { useRoutes } from "react-router-dom";
import {ProtectedRoute, ProtectedLogin} from "./components/Layout/ProtectedRoute";
import trviseLogo from "./assets/trvise_logo.png";

function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState('show'); // 'show', 'move', 'hide'
  // Sidebar logo target: left 20px, top 20px (matches px-5 and h-20 in sidebar)
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('move'), 2000); // show for 2s
    const timer2 = setTimeout(() => setPhase('hide'), 2700); // move for 0.7s
    const timer3 = setTimeout(() => onFinish(), 3200); // hide for 0.5s
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  }, [onFinish]);

  // Calculate transform: move from center to (20px, 20px)
  // Use vw/vh for responsiveness, fallback to fixed px for sidebar
  const moveTransform = 'translate(-40vw, -40vh) scale(0.25)';

  return (
    <div style={{
      position: 'fixed',
      zIndex: 9999,
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'black',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'opacity 0.5s',
      opacity: phase === 'hide' ? 0 : 1,
      pointerEvents: phase === 'hide' ? 'none' : 'auto',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        transition: 'transform 0.7s cubic-bezier(.77,0,.18,1), scale 0.7s cubic-bezier(.77,0,.18,1)',
        transform: phase === 'move' ? moveTransform : 'none',
        willChange: 'transform',
      }}>
        <img src={trviseLogo} alt="Blueprint Logo" style={{ width: '160px', height: '160px', marginBottom: '1.5rem', transition: 'width 0.7s, height 0.7s' }} />
        <h1 style={{
          fontSize: '5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #0000FF 0%, #F1C232 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'gradientShift 2s linear',
          letterSpacing: '0.1em',
          textAlign: 'center',
          margin: 0,
        }}>
          BluePrint
        </h1>
      </div>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
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
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <div className="flex" style={{ filter: showSplash ? 'blur(2px)' : 'none', pointerEvents: showSplash ? 'none' : 'auto' }}>
        <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} animateLogo={showSplash === false} />
        <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'} flex-1 p-8`}>
          <div className="w-full">{routesElement}</div>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;