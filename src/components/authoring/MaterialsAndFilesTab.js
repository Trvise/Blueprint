import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/authContext';

import { COMPONENTS, TYPOGRAPHY, LAYOUT, getListItemBorder } from './shared/styles';
import { AiOutlineSearch, AiOutlinePlus } from 'react-icons/ai';

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
    toolImageInputRef,
    handleAddToolToCurrentStep,
    removeToolFromCurrentStep,
    // Direct state setters for repository items
    setCurrentStepTools,
    setCurrentStepMaterials,
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
}) => {
    const { currentUser } = useAuth();
    const [repoTools, setRepoTools] = useState([]);
    const [repoMaterials, setRepoMaterials] = useState([]);
    const [toolSearchTerm, setToolSearchTerm] = useState('');
    const [materialSearchTerm, setMaterialSearchTerm] = useState('');
    const [showToolRepo, setShowToolRepo] = useState(false);
    const [showMaterialRepo, setShowMaterialRepo] = useState(false);

    const fetchRepoItems = useCallback(async () => {
        try {
            const [toolsResponse, materialsResponse] = await Promise.all([
                fetch(`${getApiUrl()}/users/${currentUser.uid}/tools`),
                fetch(`${getApiUrl()}/users/${currentUser.uid}/materials`)
            ]);

            if (toolsResponse.ok) {
                const toolsData = await toolsResponse.json();
                setRepoTools(toolsData);
            }

            if (materialsResponse.ok) {
                const materialsData = await materialsResponse.json();
                setRepoMaterials(materialsData);
            }
        } catch (error) {
            console.error('Error fetching repository items:', error);
        }
    }, [currentUser?.uid]);

    // Fetch repository tools and materials
    useEffect(() => {
        if (currentUser?.uid) {
            fetchRepoItems();
        }
    }, [currentUser, fetchRepoItems]);

    // Filter repository items based on search
    const filteredRepoTools = repoTools.filter(tool =>
        tool.name.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        (tool.specification && tool.specification.toLowerCase().includes(toolSearchTerm.toLowerCase()))
    );

    const filteredRepoMaterials = repoMaterials.filter(material =>
        material.name.toLowerCase().includes(materialSearchTerm.toLowerCase()) ||
        (material.specification && material.specification.toLowerCase().includes(materialSearchTerm.toLowerCase()))
    );

    // Add tool from repository to current step
    const addToolFromRepo = (repoTool) => {
        // Check if already added to current step
        const alreadyExists = currentStepTools.some(tool => 
            tool.name === repoTool.name && tool.specification === repoTool.specification
        );

        if (alreadyExists) {
            alert('This tool is already added to the current step.');
            return;
        }

        // Create a step tool object that includes repository reference
        const stepTool = {
            id: `tool_${Date.now()}_${Math.random()}`, // Temporary ID for UI purposes
            tool_id: repoTool.tool_id, // Reference to repository tool - IMPORTANT for backend
            name: repoTool.name,
            specification: repoTool.specification || '',
            hasExistingImage: repoTool.image_file ? true : false,
            image_url: repoTool.image_file?.file_url,
            purchase_link: repoTool.purchase_link,
            // Mark this as from repository so we can handle it differently
            fromRepository: true
        };

        // Directly add to current step tools without using form validation
        // This preserves the tool_id which is crucial for backend linking
        if (setCurrentStepTools && typeof setCurrentStepTools === 'function') {
            setCurrentStepTools(prev => [...prev, stepTool]);
        } else {
            // Fallback: try the form-based approach but it won't preserve tool_id
            setCurrentStepToolName(repoTool.name);
            setCurrentStepToolSpec(repoTool.specification || '');
            
            requestAnimationFrame(() => {
                if (typeof handleAddToolToCurrentStep === 'function') {
                    handleAddToolToCurrentStep();
                }
            });
        }
        
        // Clear the search interface
        setShowToolRepo(false);
        setToolSearchTerm('');
    };

    // Add material from repository to current step
    const addMaterialFromRepo = (repoMaterial) => {
        // Check if already added to current step
        const alreadyExists = currentStepMaterials.some(material => 
            material.name === repoMaterial.name && material.specification === repoMaterial.specification
        );

        if (alreadyExists) {
            alert('This material is already added to the current step.');
            return;
        }

        // Create a step material object that includes repository reference
        const stepMaterial = {
            id: `material_${Date.now()}_${Math.random()}`, // Temporary ID for UI purposes
            material_id: repoMaterial.material_id, // Reference to repository material - IMPORTANT for backend
            name: repoMaterial.name,
            specification: repoMaterial.specification || '',
            hasExistingImage: repoMaterial.image_file ? true : false,
            image_url: repoMaterial.image_file?.file_url,
            purchase_link: repoMaterial.purchase_link,
            // Mark this as from repository so we can handle it differently
            fromRepository: true
        };

        // Directly add to current step materials without using form validation
        // This preserves the material_id which is crucial for backend linking
        if (setCurrentStepMaterials && typeof setCurrentStepMaterials === 'function') {
            setCurrentStepMaterials(prev => [...prev, stepMaterial]);
        } else {
            // Fallback: try the form-based approach but it won't preserve material_id
            setCurrentStepMaterialName(repoMaterial.name);
            setCurrentStepMaterialSpec(repoMaterial.specification || '');
            
            requestAnimationFrame(() => {
                if (typeof handleAddMaterialToCurrentStep === 'function') {
                    handleAddMaterialToCurrentStep();
                }
            });
        }
        
        // Clear the search interface
        setShowMaterialRepo(false);
        setMaterialSearchTerm('');
    };

    const repositorySearchStyle = {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#000000',
        border: '1px solid #D9D9D9',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        maxHeight: '300px',
        overflowY: 'auto',
        zIndex: 1000
    };

    const repoItemStyle = {
        padding: '12px',
        borderBottom: '1px solid #D9D9D9',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'background-color 0.2s',
        backgroundColor: '#000000',
        color: '#D9D9D9'
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: LAYOUT.cardPadding}}>
            {/* Enhanced Tools Section */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Tools Required</h2>
                
                {/* Repository Search */}
                <div style={{marginBottom: LAYOUT.inputSpacing, position: 'relative'}}>
                    <label style={{...styles.inputLabel, fontSize: '0.8rem'}}>Search from Repository</label>
                    <div style={{position: 'relative'}}>
                        <input 
                            type="text" 
                            value={toolSearchTerm}
                            onChange={(e) => {
                                setToolSearchTerm(e.target.value);
                                setShowToolRepo(e.target.value.length > 0);
                            }}
                            onFocus={() => setShowToolRepo(toolSearchTerm.length > 0)}
                            placeholder="Search your tool repository..." 
                            style={{...styles.inputField, paddingLeft: '40px'}}
                        />
                        <AiOutlineSearch style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#D9D9D9'
                        }} />
                        
                        {/* Repository Search Results */}
                        {showToolRepo && filteredRepoTools.length > 0 && (
                            <div style={repositorySearchStyle}>
                                {filteredRepoTools.map((tool) => (
                                    <div 
                                        key={tool.tool_id}
                                        style={{
                                            ...repoItemStyle,
                                            ':hover': { backgroundColor: '#D9D9D9' }
                                        }}
                                        onClick={() => addToolFromRepo(tool)}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#D9D9D9'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#000000'}
                                    >
                                        {tool.image_file?.file_url && (
                                            <img 
                                                src={tool.image_file.file_url}
                                                alt={tool.name}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        )}
                                        <div style={{flex: 1}}>
                                            <p style={{margin: 0, fontWeight: '500'}}>{tool.name}</p>
                                            {tool.specification && (
                                                <p style={{margin: 0, fontSize: '0.8rem', color: '#D9D9D9'}}>
                                                    {tool.specification}
                                                </p>
                                            )}
                                        </div>
                                        <AiOutlinePlus style={{color: '#007bff'}} />
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {showToolRepo && toolSearchTerm && filteredRepoTools.length === 0 && (
                            <div style={repositorySearchStyle}>
                                <div style={{...repoItemStyle, cursor: 'default'}}>
                                    <p style={{margin: 0, color: '#D9D9D9'}}>No tools found. Add to repository first.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{marginBottom: LAYOUT.inputSpacing, fontSize: '0.9rem', color: '#D9D9D9', textAlign: 'center'}}>
                    OR
                </div>

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
                    Add New Tool to Step
                </button>
                
                {/* Current Step Tools Display */}
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
                                                backgroundColor: '#D9D9D9'
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
                                                    color: '#D9D9D9'
                                                }}>📷</div>
                                            </div>
                                        )}
                                        
                                        <div style={{flex: 1}}>
                                            <p style={COMPONENTS.fileListItemTitle}>
                                                {tool.name}
                                                {tool.tool_id && <span style={{color: '#007bff', marginLeft: '8px'}}>📚</span>}
                                            </p>
                                            <p style={COMPONENTS.fileListItemSubtext}>
                                                {tool.specification ? `Specification: ${tool.specification}` : 'No specification'}
                                                {tool.tool_id && ' • From Repository'}
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
                            No tools added yet. Search from repository or add new tools.
                        </p>
                    </div>
                )}
            </div>

            {/* Enhanced Materials Section */}
        <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Materials</h2>
                
                {/* Repository Search */}
                <div style={{marginBottom: LAYOUT.inputSpacing, position: 'relative'}}>
                    <label style={{...styles.inputLabel, fontSize: '0.8rem'}}>Search from Repository</label>
                    <div style={{position: 'relative'}}>
                        <input 
                            type="text" 
                            value={materialSearchTerm}
                            onChange={(e) => {
                                setMaterialSearchTerm(e.target.value);
                                setShowMaterialRepo(e.target.value.length > 0);
                            }}
                            onFocus={() => setShowMaterialRepo(materialSearchTerm.length > 0)}
                            placeholder="Search your material repository..." 
                            style={{...styles.inputField, paddingLeft: '40px'}}
                        />
                        <AiOutlineSearch style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#D9D9D9'
                        }} />
                        
                        {/* Repository Search Results */}
                        {showMaterialRepo && filteredRepoMaterials.length > 0 && (
                            <div style={repositorySearchStyle}>
                                {filteredRepoMaterials.map((material) => (
                                    <div 
                                        key={material.material_id}
                                        style={{
                                            ...repoItemStyle,
                                            ':hover': { backgroundColor: '#D9D9D9' }
                                        }}
                                        onClick={() => addMaterialFromRepo(material)}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#D9D9D9'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#000000'}
                                    >
                                        {material.image_file?.file_url && (
                                            <img 
                                                src={material.image_file.file_url}
                                                alt={material.name}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        )}
                                        <div style={{flex: 1}}>
                                            <p style={{margin: 0, fontWeight: '500'}}>{material.name}</p>
                                            {material.specification && (
                                                <p style={{margin: 0, fontSize: '0.8rem', color: '#D9D9D9'}}>
                                                    {material.specification}
                                                </p>
                                            )}
                                        </div>
                                        <AiOutlinePlus style={{color: '#007bff'}} />
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {showMaterialRepo && materialSearchTerm && filteredRepoMaterials.length === 0 && (
                            <div style={repositorySearchStyle}>
                                <div style={{...repoItemStyle, cursor: 'default'}}>
                                    <p style={{margin: 0, color: '#D9D9D9'}}>No materials found. Add to repository first.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{marginBottom: LAYOUT.inputSpacing, fontSize: '0.9rem', color: '#D9D9D9', textAlign: 'center'}}>
                    OR
                </div>

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
                    Add New Material to Step
            </button>
                
                {/* Current Step Materials Display */}
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
                                                backgroundColor: '#D9D9D9'
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
                                                    color: '#D9D9D9'
                                                }}>📷</div>
                </div>
            )}
                                        
                                        <div style={{flex: 1}}>
                                            <p style={COMPONENTS.fileListItemTitle}>
                                                {material.name}
                                                {material.material_id && <span style={{color: '#007bff', marginLeft: '8px'}}>📚</span>}
                                            </p>
                                            <p style={COMPONENTS.fileListItemSubtext}>
                                                {material.specification ? `Specification: ${material.specification}` : 'No specification'}
                                                {material.material_id && ' • From Repository'}
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
                            No materials added yet. Search from repository or add new materials.
                        </p>
                    </div>
            )}
        </div>
    </div>
);
};

export default MaterialsAndToolsTab; 