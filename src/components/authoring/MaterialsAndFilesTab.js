import React from 'react';
import ToolsTab from './ToolsTab';

const MaterialsAndFilesTab = ({
    // Tools props
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
    // Materials props
    currentStepMaterials,
    currentStepMaterialName,
    setCurrentStepMaterialName,
    currentStepMaterialSpec,
    setCurrentStepMaterialSpec,
    currentStepMaterialImageFile,
    setCurrentStepMaterialImageFile,
    materialImageInputRef,
    handleAddMaterialToCurrentStep,
    removeMaterialFromCurrentStep,
    // Files props
    currentStepSupFiles,
    currentStepSupFileName,
    setCurrentStepSupFileName,
    supFileInputRef,
    currentStepResultImageFile,
    setCurrentStepResultImageFile,
    resultImageInputRef,
    handleSupFileChange,
    removeSupFileFromCurrentStep,
    styles
}) => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
        {/* Tools Section */}
        <ToolsTab 
            currentStepTools={currentStepTools}
            currentStepToolName={currentStepToolName}
            setCurrentStepToolName={setCurrentStepToolName}
            currentStepToolSpec={currentStepToolSpec}
            setCurrentStepToolSpec={setCurrentStepToolSpec}
            currentStepToolImageFile={currentStepToolImageFile}
            setCurrentStepToolImageFile={setCurrentStepToolImageFile}
            toolImageInputRef={toolImageInputRef}
            handleAddToolToCurrentStep={handleAddToolToCurrentStep}
            removeToolFromCurrentStep={removeToolFromCurrentStep}
            styles={styles}
        />

        {/* Materials Section */}
        <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Materials</h2>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px'}}>
                <input 
                    type="text" 
                    value={currentStepMaterialName} 
                    onChange={(e) => setCurrentStepMaterialName(e.target.value)} 
                    placeholder="Material Name (e.g., M3 Screw)" 
                    style={styles.inputField}
                />
                <input 
                    type="text" 
                    value={currentStepMaterialSpec} 
                    onChange={(e) => setCurrentStepMaterialSpec(e.target.value)} 
                    placeholder="Material Specification (e.g., 10mm)" 
                    style={styles.inputField}
                />
            </div>
            <div>
                <label style={{...styles.inputLabel, fontSize: '0.8rem'}}>Material Image (Optional)</label>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setCurrentStepMaterialImageFile(e.target.files[0])} 
                    ref={materialImageInputRef} 
                    style={styles.fileInput}
                />
            </div>
            <button 
                onClick={handleAddMaterialToCurrentStep} 
                style={{...styles.button, ...styles.buttonSecondarySm, marginTop: '8px'}}
            >
                Add Material to Step
            </button>
            {currentStepMaterials.length > 0 && (
                <div style={{marginTop: '12px'}}>
                    <h4 style={{fontSize: '0.9rem', fontWeight: '500'}}>Added Materials:</h4>
                    <ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px', fontSize: '0.9rem'}}>
                        {currentStepMaterials.map(mat => (
                            <li key={mat.id} style={styles.listItem}>
                                <span>
                                    {mat.name} ({mat.specification || 'No spec'}) 
                                    {mat.imageFile && `(${mat.imageFile.name.substring(0,15)}...)`}
                                </span>
                                <button onClick={() => removeMaterialFromCurrentStep(mat.id)} style={styles.removeButton}>
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        {/* Supplementary Files Section */}
        <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Supplementary Files</h2>
            <input 
                type="text" 
                value={currentStepSupFileName} 
                onChange={(e) => setCurrentStepSupFileName(e.target.value)} 
                placeholder="Display Name for File (optional)" 
                style={{...styles.inputField, marginBottom: '8px'}}
            />
            <input 
                type="file" 
                onChange={handleSupFileChange} 
                ref={supFileInputRef} 
                style={styles.fileInput}
            />
            {currentStepSupFiles.length > 0 && (
                <div style={{marginTop: '12px'}}>
                    <h4 style={{fontSize: '0.9rem', fontWeight: '500'}}>Added Files:</h4>
                    <ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px', fontSize: '0.9rem'}}>
                        {currentStepSupFiles.map(f => (
                            <li key={f.id} style={styles.listItem}>
                                <span>{f.displayName} ({f.fileObject.name.substring(0,20)}...)</span>
                                <button onClick={() => removeSupFileFromCurrentStep(f.id)} style={styles.removeButton}>
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        {/* Step Result Image Section */}
        <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Step Result Image</h2>
            <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setCurrentStepResultImageFile(e.target.files[0])} 
                ref={resultImageInputRef} 
                style={styles.fileInput}
            />
            {currentStepResultImageFile && (
                <p style={{fontSize: '0.9rem', marginTop: '4px'}}>
                    Selected: {currentStepResultImageFile.name}
                </p>
            )}
        </div>
    </div>
);

export default MaterialsAndFilesTab; 