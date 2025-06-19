import React from 'react';

const StepTimeline = ({
    projectSteps,
    currentStepIndex,
    setCurrentStepIndex,
    onEditStep,
    onDeleteStep,
    formatTime,
    styles
}) => {
    const handleStepClick = (index) => {
        setCurrentStepIndex(index);
    };

    const handleEditStep = (e, step, index) => {
        e.stopPropagation();
        onEditStep(step, index);
    };

    const handleDeleteStep = (e, index) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete step "${projectSteps[index].name}"?`)) {
            onDeleteStep(index);
        }
    };

    return (
        <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Project Timeline</h2>
            <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#f8fafc'
            }}>
                {projectSteps.length === 0 ? (
                    <div style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: '0.9rem'
                    }}>
                        No steps created yet. Start by adding your first step!
                    </div>
                ) : (
                    <div style={{padding: '16px'}}>
                        {projectSteps.map((step, index) => (
                            <div
                                key={step.id}
                                onClick={() => handleStepClick(index)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px',
                                    marginBottom: '8px',
                                    backgroundColor: currentStepIndex === index ? '#e3f2fd' : '#ffffff',
                                    border: currentStepIndex === index ? '2px solid #2196f3' : '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                            >
                                {/* Step Number */}
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: currentStepIndex === index ? '#2196f3' : '#6b7280',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    marginRight: '12px',
                                    flexShrink: 0
                                }}>
                                    {index + 1}
                                </div>

                                {/* Step Content */}
                                <div style={{flex: 1, minWidth: 0}}>
                                    <h3 style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: '#2d3748',
                                        marginBottom: '4px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {step.name}
                                    </h3>
                                    <p style={{
                                        fontSize: '0.8rem',
                                        color: '#6b7280',
                                        marginBottom: '4px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {step.description}
                                    </p>
                                    <div style={{
                                        display: 'flex',
                                        gap: '12px',
                                        fontSize: '0.75rem',
                                        color: '#9ca3af'
                                    }}>
                                        <span>Video {step.associated_video_index + 1}</span>
                                        <span>
                                            {formatTime(step.video_start_time_ms / 1000)} - {formatTime(step.video_end_time_ms / 1000)}
                                        </span>
                                        {step.annotations?.length > 0 && (
                                            <span>📝 {step.annotations.length} annotations</span>
                                        )}
                                        {step.tools?.length > 0 && (
                                            <span>🔧 {step.tools.length} tools</span>
                                        )}
                                        {step.materials?.length > 0 && (
                                            <span>📦 {step.materials.length} materials</span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{
                                    display: 'flex',
                                    gap: '4px',
                                    marginLeft: '8px'
                                }}>
                                    <button
                                        onClick={(e) => handleEditStep(e, step, index)}
                                        style={{
                                            padding: '6px 8px',
                                            fontSize: '0.75rem',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                        title="Edit Step"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteStep(e, index)}
                                        style={{
                                            padding: '6px 8px',
                                            fontSize: '0.75rem',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                        title="Delete Step"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StepTimeline; 