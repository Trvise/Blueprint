import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';
import { AiOutlineMenu, AiOutlineHome, AiOutlineVideoCamera, AiOutlineLogout, AiFillAndroid } from 'react-icons/ai';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const navigate = useNavigate();
    const { userLoggedIn, currentUser } = useAuth();

    return (
        <div className={`h-screen bg-gray-800 text-white fixed top-0 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
            <div className="flex flex-col justify-between h-full relative">
                {/* Toggle Button */}
                <div className="flex items-center justify-between h-20 border-b border-gray-700 px-5">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-2">
                            <img 
                                src="https://raw.githubusercontent.com/SegBin-ai/SegBin-ai/main/logo.png" 
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
                            {/* <Link
                                to="/register"
                                className="flex items-center py-3 px-4 text-base font-normal hover:bg-gray-700"
                            >
                                <AiOutlineHome size={24} />
                                {!isCollapsed && <span className="ml-4">Register</span>}
                            </Link> */}
                        </>
                    )}
                </nav>

                {/* Footer */}
                {!isCollapsed && (
                    <div className="p-4 text-center text-xs text-gray-500">
                        &copy; 2024 VortexHub. All rights reserved.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
