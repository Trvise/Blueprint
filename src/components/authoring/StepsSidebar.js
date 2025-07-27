import React, { useState } from 'react';
import { AiOutlineMenu, AiOutlinePlus, AiOutlineDelete, AiOutlineEye, AiOutlineRobot } from 'react-icons/ai';

const StepsSidebar = ({ 
    isCollapsed, 
    toggleStepsSidebar, 
    projectSteps, 
    currentStepIndex, 
    onStepClick, 
    onAddStep, 
    onDeleteStep, 
    formatTime 
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    // Chrome-specific adjustments
    const isChrome = navigator.userAgent.includes('Chrome');
    const sidebarWidth = isChrome ? (isCollapsed ? 'w-12' : 'w-64') : (isCollapsed ? 'w-16' : 'w-64');

    // Animate add button on hover
    const handleAddButtonHover = () => {
        setIsAnimating(true);
    };

    const handleAddButtonLeave = () => {
        setIsAnimating(false);
    };

    return (
        <div className={`h-screen bg-black text-[#D9D9D9] fixed top-0 right-0 transition-all duration-300 z-40 ${sidebarWidth}`}>
            <div className="flex flex-col h-full relative">
                {/* Header */}
                <div className={`flex items-center justify-between ${isChrome ? 'h-16' : 'h-20'} border-b border-gray-800 ${isChrome ? 'px-3' : 'px-5'}`}>
                    {!isCollapsed && (
                        <div className="flex items-center space-x-2">
                            <AiOutlineEye size={isChrome ? 20 : 24} className="text-[#F1C232]" />
                            <h2 className={`${isChrome ? 'text-lg' : 'text-xl'} font-semibold text-white`}>
                                Steps
                            </h2>
                        </div>
                    )}
                    <button 
                        onClick={toggleStepsSidebar} 
                        className="text-white flex items-center justify-center"
                    >
                        <AiOutlineMenu size={24} />
                    </button>
                </div>

                {/* Add Step Button */}
                {!isCollapsed && (
                    <div className="px-4 py-4 border-b border-gray-700">
                        <button
                            onClick={onAddStep}
                            onMouseEnter={handleAddButtonHover}
                            onMouseLeave={handleAddButtonLeave}
                            className={`w-full flex items-center justify-center py-4 px-4 text-base font-bold transition-all duration-200 rounded-lg ${
                                isAnimating 
                                    ? 'bg-[#E6B800] scale-105' 
                                    : 'bg-[#F1C232] hover:bg-[#E6B800] hover:scale-105'
                            } text-black shadow-lg`}
                        >
                            <AiOutlinePlus size={20} />
                            <span className="ml-2">Add New Step</span>
                        </button>
                    </div>
                )}

                {/* Collapsed Add Step Button */}
                {isCollapsed && (
                    <div className="px-2 py-3 border-b border-gray-700">
                        <button
                            onClick={onAddStep}
                            onMouseEnter={handleAddButtonHover}
                            onMouseLeave={handleAddButtonLeave}
                            className={`w-full flex items-center justify-center py-3 px-2 text-base font-bold transition-all duration-200 rounded-lg ${
                                isAnimating 
                                    ? 'bg-[#E6B800] scale-105' 
                                    : 'bg-[#F1C232] hover:bg-[#E6B800] hover:scale-105'
                            } text-black shadow-lg`}
                            title="Add New Step"
                        >
                            <AiOutlinePlus size={isChrome ? 16 : 18} />
                        </button>
                    </div>
                )}

                {/* Steps List */}
                <div className="flex-1 overflow-y-auto py-2">
                    {projectSteps.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <p className="text-gray-400 text-sm">No steps created yet</p>
                            <p className="text-gray-500 text-xs mt-1">Click "Add New Step" to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-2 px-2">
                            {projectSteps.map((step, index) => (
                                <div
                                    key={step.id || `step-${index}`}
                                    className={`relative group cursor-pointer transition-all duration-200 rounded-lg border ${
                                        currentStepIndex === index 
                                            ? 'bg-[#F1C232] text-black border-[#F1C232] shadow-lg' 
                                            : 'bg-black text-[#D9D9D9] border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                                    }`}
                                    onClick={() => onStepClick(step, index)}
                                >
                                    <div className={`p-3 ${isCollapsed ? 'p-2' : 'p-3'}`}>
                                        {!isCollapsed ? (
                                            <>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`font-semibold text-sm ${
                                                            currentStepIndex === index ? 'text-black' : 'text-[#F1C232]'
                                                        }`}>
                                                            Step {index + 1}
                                                        </span>
                                                        {step.is_ai_generated && (
                                                            <AiOutlineRobot 
                                                                size={14} 
                                                                className={`${
                                                                    currentStepIndex === index ? 'text-black/70' : 'text-blue-400'
                                                                }`}
                                                                title="AI Generated Step"
                                                            />
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm(`Are you sure you want to delete "Step ${index + 1}: ${step.name}"? This action cannot be undone.`)) {
                                                                onDeleteStep(index);
                                                            }
                                                        }}
                                                        className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded ${
                                                            currentStepIndex === index 
                                                                ? 'text-black hover:bg-black/20' 
                                                                : 'text-red-400 hover:bg-red-400/20'
                                                        }`}
                                                        title="Delete step"
                                                    >
                                                        <AiOutlineDelete size={16} />
                                                    </button>
                                                </div>
                                                <div className={`text-sm font-medium mb-1 ${
                                                    currentStepIndex === index ? 'text-black' : 'text-white'
                                                }`}>
                                                    {step.name}
                                                </div>
                                                <div className={`text-xs ${
                                                    currentStepIndex === index ? 'text-black/70' : 'text-gray-400'
                                                }`}>
                                                    {formatTime(step.video_start_time_ms / 1000)} - {formatTime(step.video_end_time_ms / 1000)}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <span className={`font-bold text-xs ${
                                                    currentStepIndex === index ? 'text-black' : 'text-[#F1C232]'
                                                }`}>
                                                    {index + 1}
                                                </span>
                                                <div className={`w-1 h-1 rounded-full mt-1 ${
                                                    currentStepIndex === index ? 'bg-black' : 'bg-gray-400'
                                                }`}></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isCollapsed && (
                    <div className="p-4 text-center text-xs text-gray-500 border-t border-gray-700">
                        {projectSteps.length} step{projectSteps.length !== 1 ? 's' : ''} total
                    </div>
                )}
            </div>
        </div>
    );
};

export default StepsSidebar; 