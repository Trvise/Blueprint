import React from 'react';
import ToolsTab from './ToolsTab';
import { COMPONENTS, TYPOGRAPHY, LAYOUT, getListItemBorder } from './shared/styles';

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
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                    {/* Show image thumbnail if available */}
                                    {(material.imageFile || material.hasExistingImage) && (
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
                                            {material.imageFile ? (
                                                <img 
                                                    src={URL.createObjectURL(material.imageFile)} 
                                                    alt={material.name}
                                                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                                />
                                            ) : material.hasExistingImage ? (
                                                <img 
                                                    src={material.image_url} 
                                                    alt={material.name}
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
                                            {material.name}
                                        </p>
                                        <p style={COMPONENTS.fileListItemSubtext}>
                                            {material.specification ? `Specification: ${material.specification}` : 'No specification'}
                                            {material.imageFile && ` • New image: ${material.imageFile.name.substring(0, 20)}...`}
                                            {material.hasExistingImage && !material.imageFile && ` • Has image`}
                                        </p>
                                    </div>
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