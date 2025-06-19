import React from 'react';

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
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px'}}>
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
        <div>
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
            style={{...styles.button, ...styles.buttonSecondarySm, marginTop: '8px'}}
        >
            Add Tool to Step
        </button>
        {currentStepTools.length > 0 && (
            <div style={{marginTop: '12px'}}>
                <h4 style={{fontSize: '0.9rem', fontWeight: '500'}}>Added Tools:</h4>
                <ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px', fontSize: '0.9rem'}}>
                    {currentStepTools.map(tool => (
                        <li key={tool.id} style={styles.listItem}>
                            <span>
                                {tool.name} ({tool.specification || 'No spec'}) 
                                {tool.imageFile && `(${tool.imageFile.name.substring(0,15)}...)`}
                            </span>
                            <button onClick={() => removeToolFromCurrentStep(tool.id)} style={styles.removeButton}>
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);

export default ToolsTab; 