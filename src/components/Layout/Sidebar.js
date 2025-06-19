import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';
import { AiOutlineMenu, AiOutlineHome, AiOutlineVideoCamera, AiOutlineLogout, AiFillAndroid, AiFillTool, AiOutlineVideoCamera as AiOutlineVideo, AiOutlineFileText, AiOutlineTool, AiOutlineEye } from 'react-icons/ai';
import logo from '../../assets/trvise_logo.png';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userLoggedIn, currentUser } = useAuth();

    // Check if we're on the CreateSteps page
    const isCreateStepsPage = location.pathname.includes('/create-steps') || location.pathname.includes('/steps');

    return (
        <div className={`h-screen bg-gray-800 text-white fixed top-0 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
            <div className="flex flex-col justify-between h-full relative">
                {/* Toggle Button */}
                <div className="flex items-center justify-between h-20 border-b border-gray-700 px-5">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-2">
                            <img 
                                src={logo}
                                alt="VortexHub Logo" 
                                className="w-14 h-14"
                            />
                            <h1 className="text-2xl font-semibold whitespace-nowrap">VortexHub</h1>
                        </div>
                    )}
                    <button 
                        onClick={toggleSidebar} 
                        className="text-white flex items-center justify-center"
                    >
                        <AiOutlineMenu size={24} />
                    </button>
                </div>

                {/* User Info */}
                <div className="px-4 py-6">
                    {userLoggedIn && (
                        <div className="transition-opacity duration-300">
                            <p className={`text-lg transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>Welcome,</p>
                            <p 
                                className={`text-xl font-bold transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}
                                style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                                {currentUser.displayName || currentUser.email}
                            </p>
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 mt-2">
                    {userLoggedIn ? (
                        <>
                            <Link
                                to="/home"
                                className="flex items-center py-3 px-4 text-base font-normal hover:bg-gray-700"
                            >
                                <AiOutlineHome size={24} />
                                {!isCollapsed && <span className="ml-4">Upload Videos</span>}
                            </Link>
                            <Link
                                to="/videos"
                                className="flex items-center py-3 px-4 text-base font-normal hover:bg-gray-700"
                            >
                                <AiOutlineVideoCamera size={24} />
                                {!isCollapsed && <span className="ml-4">Videos List</span>}
                            </Link>

                            <Link
                                to="/create"
                                className="flex items-center py-3 px-4 text-base font-normal hover:bg-gray-700"
                            >
                                <AiFillTool size={24} />
                                {!isCollapsed && <span className="ml-4">Create Project</span>}
                            </Link>

                            {/* CreateSteps Tab Navigation - Only show when on CreateSteps page */}
                            {isCreateStepsPage && (
                                <div className="border-t border-gray-700 mt-4 pt-4">
                                    <div className={`px-4 py-2 text-xs font-semibold text-gray-400 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                                        STEP AUTHORING
                                    </div>
                                    
                                    <button
                                        onClick={() => {
                                            // Set active tab to video
                                            if (window.setActiveTab) {
                                                window.setActiveTab('video');
                                            }
                                        }}
                                        className="flex items-center py-2 px-4 text-sm font-normal hover:bg-gray-700 w-full text-left"
                                    >
                                        <AiOutlineVideo size={20} />
                                        {!isCollapsed && <span className="ml-3">Video & Annotations</span>}
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            // Set active tab to details
                                            if (window.setActiveTab) {
                                                window.setActiveTab('details');
                                            }
                                        }}
                                        className="flex items-center py-2 px-4 text-sm font-normal hover:bg-gray-700 w-full text-left"
                                    >
                                        <AiOutlineFileText size={20} />
                                        {!isCollapsed && <span className="ml-3">Step Details</span>}
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            // Set active tab to materials
                                            if (window.setActiveTab) {
                                                window.setActiveTab('materials');
                                            }
                                        }}
                                        className="flex items-center py-2 px-4 text-sm font-normal hover:bg-gray-700 w-full text-left"
                                    >
                                        <AiOutlineTool size={20} />
                                        {!isCollapsed && <span className="ml-3">Materials & Files</span>}
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            // Set active tab to overview
                                            if (window.setActiveTab) {
                                                window.setActiveTab('overview');
                                            }
                                        }}
                                        className="flex items-center py-2 px-4 text-sm font-normal hover:bg-gray-700 w-full text-left"
                                    >
                                        <AiOutlineEye size={20} />
                                        {!isCollapsed && <span className="ml-3">Project Overview</span>}
                                    </button>
                                </div>
                            )}
                            
                            <button
                                onClick={() => {
                                    doSignOut().then(() => {
                                        navigate('/login');
                                    });
                                }}
                                className="flex items-center py-3 px-4 mt-4 text-red-500 hover:bg-gray-700 w-full text-left"
                            >
                                <AiOutlineLogout size={24} />
                                {!isCollapsed && <span className="ml-4">Logout</span>}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="flex items-center py-3 px-4 text-base font-normal hover:bg-gray-700"
                            >
                                <AiOutlineHome size={24} />
                                {!isCollapsed && <span className="ml-4">Login</span>}
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center py-3 px-4 text-base font-normal hover:bg-gray-700"
                            >
                                <AiOutlineHome size={24} />
                                {!isCollapsed && <span className="ml-4">Register</span>}
                            </Link>
                        </>
                    )}
                </nav>

                {/* Footer */}
                {!isCollapsed && (
                    <div className="p-4 text-center text-xs text-gray-500">
                        &copy; {new Date().getFullYear()} Trvise. All rights reserved.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
