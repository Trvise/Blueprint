import React from 'react';
import { COMPONENTS, TYPOGRAPHY, COLORS, LAYOUT, getListItemBorder } from './shared/styles';

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
                            <div>
                                <p style={COMPONENTS.fileListItemTitle}>
                                    {tool.name}
                                </p>
                                <p style={COMPONENTS.fileListItemSubtext}>
                                    {tool.specification ? `Specification: ${tool.specification}` : 'No specification'}
                                    {tool.imageFile && ` • Image: ${tool.imageFile.name.substring(0, 20)}...`}
                                </p>
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