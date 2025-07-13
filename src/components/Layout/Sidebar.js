import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { doSignOut } from '../../firebase/auth';
import { AiOutlineMenu, AiOutlineLogout, AiFillTool, AiOutlineVideoCamera as AiOutlineVideo, AiOutlineEye, AiOutlineArrowLeft, AiOutlineCheck, AiOutlineUser, AiOutlineDatabase, AiOutlineFolder, AiOutlineBarChart } from 'react-icons/ai';
import logo from '../../assets/trvise_logo.png';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userLoggedIn, currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('details');

    // Check if we're on the CreateSteps page
    const isCreateStepsPage = location.pathname.includes('/create-steps') || location.pathname.includes('/steps') || location.pathname.includes('/annotate');

    // Expose setActiveTab globally for CreateSteps component
    useEffect(() => {
        if (isCreateStepsPage) {
            window.setActiveTab = setActiveTab;
            return () => {
                delete window.setActiveTab;
            };
        }
    }, [isCreateStepsPage]);

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        if (window.setActiveTab) {
            window.setActiveTab(tabName);
        }
    };

    return (
        <div className={`h-screen bg-black text-[#D9D9D9] fixed top-0 transition-all duration-300 z-50 ${isCollapsed ? 'w-16' : 'w-64'}`}>
            <div className="flex flex-col h-full relative">
                {/* Toggle Button */}
                <div className="flex items-center justify-between h-20 border-b border-gray-800 px-5">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-2">
                            <img 
                                src={logo}
                                alt="Blueprint Logo" 
                                className="w-14 h-14"
                            />
                            <h1 className="text-2xl font-semibold whitespace-nowrap" style={{
                                background: 'linear-gradient(45deg, #0000FF 0%, #F1C232 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                Blueprint
                            </h1>
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
                {!isCreateStepsPage && (
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
                )}

                {/* CreateSteps Header */}
                {isCreateStepsPage && !isCollapsed && (
                    <div className="px-5 py-4 border-b border-gray-700">
                        <h2 className="text-lg font-semibold text-white">Step Authoring</h2>
                        <p className="text-sm text-gray-400 mt-1">Create and manage project steps</p>
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 mt-2 overflow-y-auto">
                    {userLoggedIn ? (
                        <>
                            {!isCreateStepsPage ? (
                                // Regular navigation
                                <>
                                    <Link
                                        to="/my-projects"
                                        className="flex items-center py-3 px-4 text-base font-normal hover:bg-[#0000FF]/20 transition-colors"
                                    >
                                        <AiOutlineEye size={24} />
                                        {!isCollapsed && <span className="ml-4">My Projects</span>}
                                    </Link>
                                    <Link
                                        to="/repository"
                                        className="flex items-center py-3 px-4 text-base font-normal hover:bg-[#0000FF]/20 transition-colors"
                                    >
                                        <AiOutlineDatabase size={24} />
                                        {!isCollapsed && <span className="ml-4">Repository</span>}
                                    </Link>
                                    <Link
                                        to="/create"
                                        className="flex items-center py-3 px-4 text-base font-normal hover:bg-[#0000FF]/20 transition-colors"
                                    >
                                        <AiFillTool size={24} />
                                        {!isCollapsed && <span className="ml-4">Create Project</span>}
                                    </Link>
                                </>
                            ) : (
                                // CreateSteps navigation
                                <div className="px-0 py-2">
                                    <button
                                        onClick={() => handleTabClick('details')}
                                        className={`w-full flex items-center py-4 px-5 text-base font-medium transition-all duration-200 border-l-3 ${
                                            activeTab === 'details' 
                                                ? 'text-[#F1C232] bg-black border-[#F1C232]' 
                                                : 'text-[#D9D9D9] border-transparent hover:bg-[#0000FF]/20 hover:text-[#D9D9D9]'
                                        }`}
                                    >
                                        <AiOutlineVideo size={20} />
                                        {!isCollapsed && <span className="ml-3">Video Steps</span>}
                                    </button>
                                    
                                    <button
                                        onClick={() => handleTabClick('repository')}
                                        className={`w-full flex items-center py-4 px-5 text-base font-medium transition-all duration-200 border-l-3 ${
                                            activeTab === 'repository' 
                                                ? 'text-[#F1C232] bg-black border-[#F1C232]' 
                                                : 'text-[#D9D9D9] border-transparent hover:bg-[#0000FF]/20 hover:text-[#D9D9D9]'
                                        }`}
                                    >
                                        <AiOutlineFolder size={20} />
                                        {!isCollapsed && <span className="ml-3">Repository</span>}
                                    </button>
                                    
                                    <button
                                        onClick={() => handleTabClick('overview')}
                                        className={`w-full flex items-center py-4 px-5 text-base font-medium transition-all duration-200 border-l-3 ${
                                            activeTab === 'overview' 
                                                ? 'text-[#F1C232] bg-black border-[#F1C232]' 
                                                : 'text-[#D9D9D9] border-transparent hover:bg-[#0000FF]/20 hover:text-[#D9D9D9]'
                                        }`}
                                    >
                                        <AiOutlineBarChart size={20} />
                                        {!isCollapsed && <span className="ml-3">Overview</span>}
                                    </button>
                                    
                                    <button
                                        onClick={() => handleTabClick('finalize')}
                                        className={`w-full flex items-center py-4 px-5 text-base font-medium transition-all duration-200 border-l-3 ${
                                            activeTab === 'finalize' 
                                                ? 'text-[#F1C232] bg-black border-[#F1C232]' 
                                                : 'text-[#D9D9D9] border-transparent hover:bg-green-700 hover:text-[#D9D9D9]'
                                        }`}
                                    >
                                        <AiOutlineCheck size={20} />
                                        {!isCollapsed && <span className="ml-3">Finalize Project</span>}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="flex items-center py-3 px-4 text-base font-normal hover:bg-[#0000FF]/20 transition-colors"
                            >
                                <AiOutlineUser size={24} />
                                {!isCollapsed && <span className="ml-4">Login</span>}
                            </Link>
                            <Link
                                to="/register"
                                className="flex items-center py-3 px-4 text-base font-normal hover:bg-[#0000FF]/20 transition-colors"
                            >
                                <AiOutlineUser size={24} />
                                {!isCollapsed && <span className="ml-4">Register</span>}
                            </Link>
                        </>
                    )}
                </nav>

                {/* Bottom section */}
                <div className="border-t border-gray-700">
                    {isCreateStepsPage && (
                        <button 
                            onClick={() => navigate('/')} 
                            className="w-full flex items-center py-4 px-5 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                            <AiOutlineArrowLeft size={20} />
                            {!isCollapsed && <span className="ml-3">Back to Home</span>}
                        </button>
                    )}
                    
                    {userLoggedIn && (
                        <button
                            onClick={() => {
                                doSignOut().then(() => {
                                    navigate('/login');
                                });
                            }}
                            className="w-full flex items-center py-4 px-5 text-base font-medium text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                        >
                            <AiOutlineLogout size={20} />
                            {!isCollapsed && <span className="ml-3">Logout</span>}
                        </button>
                    )}
                </div>

                {/* Footer */}
                {!isCollapsed && !isCreateStepsPage && (
                    <div className="p-4 text-center text-xs text-gray-500 border-t border-gray-700">
                        &copy; {new Date().getFullYear()} Trvise. All rights reserved.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
