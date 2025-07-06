import React from 'react';
import ToolsTab from './ToolsTab';
import { COMPONENTS, TYPOGRAPHY, COLORS, LAYOUT, getListItemBorder } from './shared/styles';

const MaterialsAndToolsTab = ({
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
    styles
}) => (
    <div style={{display: 'flex', flexDirection: 'column', gap: LAYOUT.cardPadding}}>
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
            <div style={COMPONENTS.gridTwoColumns}>
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
            <div style={{marginTop: LAYOUT.inputSpacing}}>
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
                style={{...styles.button, ...styles.buttonSecondarySm, marginTop: LAYOUT.inputSpacing}}
            >
                Add Material to Step
            </button>
            
            {currentStepMaterials.length > 0 && (
                <div style={{marginTop: LAYOUT.sectionSpacing}}>
                    <h4 style={TYPOGRAPHY.listTitle}>Added Materials ({currentStepMaterials.length}):</h4>
                    <div style={COMPONENTS.fileList}>
                        {currentStepMaterials.map((material, index) => (
                            <div 
                                key={material.id}
                                style={{
                                    ...COMPONENTS.fileListItem,
                                    ...getListItemBorder(index, currentStepMaterials.length)
                                }}
                            >
                                <div>
                                    <p style={COMPONENTS.fileListItemTitle}>
                                        {material.name}
                                    </p>
                                    <p style={COMPONENTS.fileListItemSubtext}>
                                        {material.specification ? `Specification: ${material.specification}` : 'No specification'}
                                        {material.imageFile && ` • Image: ${material.imageFile.name.substring(0, 20)}...`}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => removeMaterialFromCurrentStep(material.id)} 
                                    style={COMPONENTS.removeButton}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {currentStepMaterials.length === 0 && (
                <div style={COMPONENTS.emptyState}>
                    <p style={COMPONENTS.emptyStateText}>
                        No materials added yet. Add materials needed to complete this step.
                    </p>
                </div>
            )}
        </div>
    </div>
);

export default MaterialsAndToolsTab; 