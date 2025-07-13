import React, { useState } from 'react';
import { useAuth } from '../../contexts/authContext';
import { storage } from '../../firebase/firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { COMPONENTS, LAYOUT } from './shared/styles';
import RepositoryPanel from './RepositoryPanel';

// Import the getApiUrl function to match the existing codebase pattern
const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:8000';
};

const MaterialsAndToolsTab = ({
    // Tools props
    currentStepTools,
    currentStepToolName,
    setCurrentStepToolName,
    currentStepToolSpec,
    setCurrentStepToolSpec,
    currentStepToolImageFile,
    setCurrentStepToolImageFile,
    currentStepToolPurchaseLink,
    setCurrentStepToolPurchaseLink,
    currentStepToolQuantity,
    setCurrentStepToolQuantity,
    toolImageInputRef,
    removeToolFromCurrentStep,
    setCurrentStepTools,
    // Materials props
    currentStepMaterials,
    currentStepMaterialName,
    setCurrentStepMaterialName,
    currentStepMaterialSpec,
    setCurrentStepMaterialSpec,
    currentStepMaterialImageFile,
    setCurrentStepMaterialImageFile,
    currentStepMaterialPurchaseLink,
    setCurrentStepMaterialPurchaseLink,
    currentStepMaterialQuantity,
    setCurrentStepMaterialQuantity,
    materialImageInputRef,
    removeMaterialFromCurrentStep,
    setCurrentStepMaterials,
    styles
}) => {
    const { currentUser } = useAuth();
    const [isSavingTool, setIsSavingTool] = useState(false);
    const [isSavingMaterial, setIsSavingMaterial] = useState(false);

    // Save tool to repository
    const saveToolToRepository = async (toolName, toolSpec, toolImageFile, toolPurchaseLink) => {
        try {
            let imagePath = null;
            if (toolImageFile) {
                const storageRef = ref(storage, `users/${currentUser.uid}/tools/${Date.now()}_${toolImageFile.name}`);
                await uploadBytes(storageRef, toolImageFile);
                imagePath = storageRef.fullPath;
            }

            const validatedPurchaseLink = toolPurchaseLink && toolPurchaseLink.trim() !== '' ? toolPurchaseLink : null;

            const toolData = {
                name: toolName,
                specification: toolSpec || '',
                purchase_link: validatedPurchaseLink,
                image_path: imagePath
            };

            const response = await fetch(`${getApiUrl()}/users/${currentUser.uid}/tools`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(toolData),
            });

            if (response.ok) {
                const newTool = await response.json();
                return newTool;
            } else {
                const errorData = await response.json();
                console.error('Failed to save tool to repository:', response.status, errorData);
                return null;
            }
        } catch (error) {
            console.error('Error saving tool to repository:', error);
            return null;
        }
    };

    // Save material to repository
    const saveMaterialToRepository = async (materialName, materialSpec, materialImageFile, materialPurchaseLink) => {
        try {
            let imagePath = null;
            if (materialImageFile) {
                const storageRef = ref(storage, `users/${currentUser.uid}/materials/${Date.now()}_${materialImageFile.name}`);
                await uploadBytes(storageRef, materialImageFile);
                imagePath = storageRef.fullPath;
            }

            const validatedPurchaseLink = materialPurchaseLink && materialPurchaseLink.trim() !== '' ? materialPurchaseLink : null;

            const materialData = {
                name: materialName,
                specification: materialSpec || '',
                purchase_link: validatedPurchaseLink,
                image_path: imagePath
            };

            const response = await fetch(`${getApiUrl()}/users/${currentUser.uid}/materials`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(materialData),
            });

            if (response.ok) {
                const newMaterial = await response.json();
                return newMaterial;
            } else {
                const errorData = await response.json();
                console.error('Failed to save material to repository:', response.status, errorData);
                return null;
            }
        } catch (error) {
            console.error('Error saving material to repository:', error);
            return null;
        }
    };

    // Enhanced tool handler that saves to repository first
    const handleAddToolWithRepository = async () => {
        if (!currentStepToolName.trim()) {
            alert('Please enter a tool name');
            return;
        }

        setIsSavingTool(true);
        try {
            const savedTool = await saveToolToRepository(
                currentStepToolName, 
                currentStepToolSpec, 
                currentStepToolImageFile,
                currentStepToolPurchaseLink
            );

            if (savedTool) {
                const stepTool = {
                    id: `tool_${Date.now()}_${Math.random()}`,
                    tool_id: savedTool.tool_id,
                    name: currentStepToolName,
                    specification: currentStepToolSpec || '',
                    quantity: parseInt(currentStepToolQuantity) || 1,
                    purchase_link: currentStepToolPurchaseLink || null,
                    imageFile: currentStepToolImageFile,
                    hasExistingImage: false,
                    fromRepository: true
                };

                if (setCurrentStepTools && typeof setCurrentStepTools === 'function') {
                    setCurrentStepTools(prev => [...prev, stepTool]);
                }

                // Clear form
                setCurrentStepToolName('');
                setCurrentStepToolSpec('');
                setCurrentStepToolImageFile(null);
                setCurrentStepToolPurchaseLink(null);
                if (toolImageInputRef.current) {
                    toolImageInputRef.current.value = '';
                }
            } else {
                alert('Failed to save tool to repository. Please try again.');
            }
        } finally {
            setIsSavingTool(false);
        }
    };

    // Enhanced material handler that saves to repository first
    const handleAddMaterialWithRepository = async () => {
        if (!currentStepMaterialName.trim()) {
            alert('Please enter a material name');
            return;
        }

        setIsSavingMaterial(true);
        try {
            const savedMaterial = await saveMaterialToRepository(
                currentStepMaterialName, 
                currentStepMaterialSpec, 
                currentStepMaterialImageFile,
                currentStepMaterialPurchaseLink
            );

            if (savedMaterial) {
                const stepMaterial = {
                    id: `material_${Date.now()}_${Math.random()}`,
                    material_id: savedMaterial.material_id,
                    name: currentStepMaterialName,
                    specification: currentStepMaterialSpec || '',
                    quantity: parseInt(currentStepMaterialQuantity) || 1,
                    purchase_link: currentStepMaterialPurchaseLink || null,
                    imageFile: currentStepMaterialImageFile,
                    hasExistingImage: false,
                    fromRepository: true
                };

                if (setCurrentStepMaterials && typeof setCurrentStepMaterials === 'function') {
                    setCurrentStepMaterials(prev => [...prev, stepMaterial]);
                }

                // Clear form
                setCurrentStepMaterialName('');
                setCurrentStepMaterialSpec('');
                setCurrentStepMaterialImageFile(null);
                setCurrentStepMaterialPurchaseLink(null);
                if (materialImageInputRef.current) {
                    materialImageInputRef.current.value = '';
                }
            } else {
                alert('Failed to save material to repository. Please try again.');
            }
        } finally {
            setIsSavingMaterial(false);
        }
    };

    // Unified sub-card style for tools/materials list
    const subCardStyle = {
        background: '#202124',
        border: '1px solid #F1C232',
        borderRadius: '8px',
        padding: '1rem',
        marginTop: '1.25rem',
        marginBottom: '1.25rem',
        boxShadow: 'none',
    };
    const subCardTitleStyle = {
        fontWeight: 600,
        color: '#F5F5F5',
        fontSize: '1.05rem',
        marginBottom: '0.5rem',
        letterSpacing: '0.01em',
    };
    const subCardTextStyle = {
        color: '#E5E5E5',
        fontSize: '0.97rem',
    };
    const goldAccent = { color: '#F1C232', fontWeight: 500 };

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: LAYOUT.cardPadding}}>
            {/* Unified Repository Panel for step context */}
            <RepositoryPanel contextType="step" />
            
            {/* Enhanced Tools Section */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Tools Required</h2>
                
                {/* Manual Tool Entry */}
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
                        placeholder="Tool Specification (e.g., Phillips Head)" 
                        style={styles.inputField}
                    />
                </div>
                <div style={COMPONENTS.gridTwoColumns}>
                    <input 
                        type="number" 
                        value={currentStepToolQuantity} 
                        onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1;
                            setCurrentStepToolQuantity(newQuantity);
                        }} 
                        placeholder="Quantity" 
                        min="1"
                        style={styles.inputField}
                    />
                    <input 
                        type="url" 
                        value={currentStepToolPurchaseLink} 
                        onChange={(e) => setCurrentStepToolPurchaseLink(e.target.value)} 
                        placeholder="Purchase Link (Optional)" 
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
                    onClick={handleAddToolWithRepository} 
                    disabled={isSavingTool}
                    style={{
                        ...styles.button, 
                        ...styles.buttonSecondarySm, 
                        marginTop: LAYOUT.inputSpacing,
                        opacity: isSavingTool ? 0.7 : 1,
                        cursor: isSavingTool ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isSavingTool ? 'Saving to Repository...' : 'Add New Tool to Step & Repository'}
                </button>
                
                {/* Current Step Tools Display */}
                {currentStepTools.length > 0 && (
                    <div style={subCardStyle}>
                        <div style={subCardTitleStyle}>Added Tools <span style={goldAccent}>({currentStepTools.length})</span>:</div>
                        <div style={{maxHeight: '160px', overflowY: 'auto', marginBottom: '0.7rem', paddingRight: '2px'}}>
                            {currentStepTools.map((tool, index) => (
                                <div 
                                    key={tool.id}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        background: '#232323',
                                        border: '1px solid #292929',
                                        borderRadius: '6px',
                                        marginBottom: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: '#F5F5F5',
                                        fontSize: '0.97rem',
                                    }}
                                >
                                    {(tool.imageFile || tool.hasExistingImage) && (
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '4px', border: '1px solid #D9D9D9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D9D9D9', marginRight: '10px'
                                        }}>
                                            {tool.imageFile ? (
                                                <img src={URL.createObjectURL(tool.imageFile)} alt={tool.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                            ) : tool.hasExistingImage ? (
                                                <img src={tool.image_url} alt={tool.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                            ) : null}
                                        </div>
                                    )}
                                    <div style={{flex: 1, minWidth: 0}}>
                                        <div style={{fontWeight: 600, color: '#F5F5F5', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{tool.name}</div>
                                        <div style={{...subCardTextStyle, fontSize: '0.92em'}}>
                                            {tool.specification ? `Specification: ${tool.specification}` : 'No specification'}
                                            {tool.quantity && tool.quantity > 1 ? ` • Quantity: ${tool.quantity}` : ''}
                                            {tool.tool_id && ' • From Repository'}
                                            {tool.imageFile && ` • New image: ${tool.imageFile.name.substring(0, 20)}...`}
                                            {tool.hasExistingImage && !tool.imageFile && ` • Has image`}
                                            {tool.purchase_link && (
                                                <span>
                                                    {' • '}
                                                    <a 
                                                        href={tool.purchase_link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{color: '#F1C232', textDecoration: 'underline', fontWeight: 500}}
                                                    >
                                                        Purchase Link
                                                    </a>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeToolFromCurrentStep(tool.id)} 
                                        style={{
                                            background: '#F1C232', color: '#18181b', border: 'none', borderRadius: '5px', padding: '4px 12px', fontSize: '0.93rem', cursor: 'pointer', fontWeight: 600, marginLeft: '0.7rem', transition: 'background 0.15s, color 0.15s'
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#F1C232'; }}
                                        onMouseOut={e => { e.currentTarget.style.background = '#F1C232'; e.currentTarget.style.color = '#18181b'; }}
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
                            No tools added yet. Search from repository or add new tools.
                        </p>
                    </div>
                )}
            </div>

            {/* Enhanced Materials Section */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Materials</h2>
                
                {/* Manual Material Entry */}
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
                <div style={COMPONENTS.gridTwoColumns}>
                    <input 
                        type="number" 
                        value={currentStepMaterialQuantity} 
                        onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1;
                            setCurrentStepMaterialQuantity(newQuantity);
                        }} 
                        placeholder="Quantity" 
                        min="1"
                        style={styles.inputField}
                    />
                    <input 
                        type="url" 
                        value={currentStepMaterialPurchaseLink} 
                        onChange={(e) => setCurrentStepMaterialPurchaseLink(e.target.value)} 
                        placeholder="Purchase Link (Optional)" 
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
                    onClick={handleAddMaterialWithRepository} 
                    disabled={isSavingMaterial}
                    style={{
                        ...styles.button, 
                        ...styles.buttonSecondarySm, 
                        marginTop: LAYOUT.inputSpacing,
                        opacity: isSavingMaterial ? 0.7 : 1,
                        cursor: isSavingMaterial ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isSavingMaterial ? 'Saving to Repository...' : 'Add New Material to Step & Repository'}
                </button>
                
                {/* Current Step Materials Display */}
                {currentStepMaterials.length > 0 && (
                    <div style={subCardStyle}>
                        <div style={subCardTitleStyle}>Added Materials <span style={goldAccent}>({currentStepMaterials.length})</span>:</div>
                        <div style={{maxHeight: '160px', overflowY: 'auto', marginBottom: '0.7rem', paddingRight: '2px'}}>
                            {currentStepMaterials.map((material, index) => (
                                <div 
                                    key={material.id}
                                    style={{
                                        padding: '0.5rem 0.75rem',
                                        background: '#232323',
                                        border: '1px solid #292929',
                                        borderRadius: '6px',
                                        marginBottom: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: '#F5F5F5',
                                        fontSize: '0.97rem',
                                    }}
                                >
                                    {(material.imageFile || material.hasExistingImage) && (
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '4px', border: '1px solid #D9D9D9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#D9D9D9', marginRight: '10px'
                                        }}>
                                            {material.imageFile ? (
                                                <img src={URL.createObjectURL(material.imageFile)} alt={material.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                            ) : material.hasExistingImage ? (
                                                <img src={material.image_url} alt={material.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                            ) : null}
                                        </div>
                                    )}
                                    <div style={{flex: 1, minWidth: 0}}>
                                        <div style={{fontWeight: 600, color: '#F5F5F5', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{material.name}</div>
                                        <div style={{...subCardTextStyle, fontSize: '0.92em'}}>
                                            {material.specification ? `Specification: ${material.specification}` : 'No specification'}
                                            {material.quantity && material.quantity > 1 ? ` • Quantity: ${material.quantity}` : ''}
                                            {material.material_id && ' • From Repository'}
                                            {material.imageFile && ` • New image: ${material.imageFile.name.substring(0, 20)}...`}
                                            {material.hasExistingImage && !material.imageFile && ` • Has image`}
                                            {material.purchase_link && (
                                                <span>
                                                    {' • '}
                                                    <a 
                                                        href={material.purchase_link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{color: '#F1C232', textDecoration: 'underline', fontWeight: 500}}
                                                    >
                                                        Purchase Link
                                                    </a>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeMaterialFromCurrentStep(material.id)} 
                                        style={{
                                            background: '#F1C232', color: '#18181b', border: 'none', borderRadius: '5px', padding: '4px 12px', fontSize: '0.93rem', cursor: 'pointer', fontWeight: 600, marginLeft: '0.7rem', transition: 'background 0.15s, color 0.15s'
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#F1C232'; }}
                                        onMouseOut={e => { e.currentTarget.style.background = '#F1C232'; e.currentTarget.style.color = '#18181b'; }}
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
                            No materials added yet. Search from repository or add new materials.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MaterialsAndToolsTab; 