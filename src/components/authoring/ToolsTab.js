import React from 'react';
import { COMPONENTS, TYPOGRAPHY, LAYOUT, getListItemBorder } from './shared/styles';

const ToolsTab = ({
    currentStepTools,
    currentStepToolName,
    setCurrentStepToolName,
    currentStepToolSpec,
    setCurrentStepToolSpec,
    currentStepToolImageFile,
    setCurrentStepToolImageFile,
    toolImageInputRef,
    handleAddToolToCurrentStep,
    removeToolFromCurrentStep,
    styles
}) => (
    <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Tools Required</h2>
        <div style={COMPONENTS.gridTwoColumns}>
            <input 
                type="text" 
                value={currentStepToolName} 
                onChange={(e) => setCurrentStepToolName(e.target.value)} 
                placeholder="Tool Name (e.g., Screwdriver)" 
                style={styles.inputField}
            />
            <input 
                type="text" 
                value={currentStepToolSpec} 
                onChange={(e) => setCurrentStepToolSpec(e.target.value)} 
                placeholder="Tool Specification (e.g., Phillips #2)" 
                style={styles.inputField}
            />
        </div>
        <div style={{marginTop: LAYOUT.inputSpacing}}>
            <label style={{...styles.inputLabel, fontSize: '0.8rem'}}>Tool Image (Optional)</label>
            <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setCurrentStepToolImageFile(e.target.files[0])} 
                ref={toolImageInputRef} 
                style={styles.fileInput}
            />
        </div>
        <button 
            onClick={handleAddToolToCurrentStep} 
            style={{...styles.button, ...styles.buttonSecondarySm, marginTop: LAYOUT.inputSpacing}}
        >
            Add Tool to Step
        </button>
        
        {currentStepTools.length > 0 && (
            <div style={{marginTop: LAYOUT.sectionSpacing}}>
                <h4 style={TYPOGRAPHY.listTitle}>Added Tools ({currentStepTools.length}):</h4>
                <div style={COMPONENTS.fileList}>
                    {currentStepTools.map((tool, index) => (
                        <div 
                            key={tool.id}
                            style={{
                                ...COMPONENTS.fileListItem,
                                ...getListItemBorder(index, currentStepTools.length)
                            }}
                        >
                            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                {/* Show image thumbnail if available */}
                                {(tool.imageFile || tool.hasExistingImage) && (
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '4px',
                                        border: '1px solid #D9D9D9',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#f8f9fa'
                                    }}>
                                        {tool.imageFile ? (
                                            <img 
                                                src={URL.createObjectURL(tool.imageFile)} 
                                                alt={tool.name}
                                                style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                            />
                                        ) : tool.hasExistingImage ? (
                                            <img 
                                                src={tool.image_url} 
                                                alt={tool.name}
                                                style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div style={{
                                            display: 'none',
                                            fontSize: '12px',
                                            color: '#666'
                                        }}>📷</div>
                                    </div>
                                )}
                                
                                <div>
                                    <p style={COMPONENTS.fileListItemTitle}>
                                        {tool.name}
                                    </p>
                                    <p style={COMPONENTS.fileListItemSubtext}>
                                        {tool.specification ? `Specification: ${tool.specification}` : 'No specification'}
                                        {tool.imageFile && ` • New image: ${tool.imageFile.name.substring(0, 20)}...`}
                                        {tool.hasExistingImage && !tool.imageFile && ` • Has image`}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => removeToolFromCurrentStep(tool.id)} 
                                style={COMPONENTS.removeButton}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {currentStepTools.length === 0 && (
            <div style={COMPONENTS.emptyState}>
                <p style={COMPONENTS.emptyStateText}>
                    No tools added yet. Add tools required to complete this step.
                </p>
            </div>
        )}
    </div>
);

export default ToolsTab; 