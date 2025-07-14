import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/authContext';
import { storage } from '../../firebase/firebase'; // Fixed import path
import { ref, uploadBytes } from 'firebase/storage'; // Added import for Firebase storage functions

import { COMPONENTS, TYPOGRAPHY, LAYOUT, getListItemBorder } from './shared/styles';
import { AiOutlineSearch, AiOutlinePlus } from 'react-icons/ai';
import { getApiUrl } from '../pages/createsteps helpers/CreateStepsUtils';

// No local getApiUrl function

const MaterialsAndFilesTab = ({
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
    currentStepMaterialPurchaseLink,
    setCurrentStepMaterialPurchaseLink,
    currentStepMaterialQuantity,
    setCurrentStepMaterialQuantity,
    materialImageInputRef,
    handleAddMaterialToCurrentStep,
    removeMaterialFromCurrentStep,
    // Repository refresh trigger
    repositoryRefreshTrigger,
    styles
}) => {
    const { currentUser } = useAuth();
    const [repoTools, setRepoTools] = useState([]);
    const [repoMaterials, setRepoMaterials] = useState([]);
    const [toolSearchTerm, setToolSearchTerm] = useState('');
    const [materialSearchTerm, setMaterialSearchTerm] = useState('');
    const [showToolRepo, setShowToolRepo] = useState(false);
    const [showMaterialRepo, setShowMaterialRepo] = useState(false);
    const [isSavingTool, setIsSavingTool] = useState(false);
    const [isSavingMaterial, setIsSavingMaterial] = useState(false);
    const [selectedToolForQuantity, setSelectedToolForQuantity] = useState(null);
    const [selectedMaterialForQuantity, setSelectedMaterialForQuantity] = useState(null);
    const [tempToolQuantity, setTempToolQuantity] = useState(1);
    const [tempMaterialQuantity, setTempMaterialQuantity] = useState(1);

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
    }, [currentUser, fetchRepoItems, repositoryRefreshTrigger]);

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

        // Set the selected tool for quantity input
        setSelectedToolForQuantity(repoTool);
        setTempToolQuantity(1);
        setShowToolRepo(false);
        setToolSearchTerm('');
    };

    // Confirm tool addition with quantity
    const confirmAddToolWithQuantity = () => {
        if (!selectedToolForQuantity) return;

        // Create a step tool object that includes repository reference
        const stepTool = {
            id: `tool_${Date.now()}_${Math.random()}`, // Temporary ID for UI purposes
            tool_id: selectedToolForQuantity.tool_id, // Reference to repository tool - IMPORTANT for backend
            name: selectedToolForQuantity.name,
            specification: selectedToolForQuantity.specification || '',
            quantity: parseInt(tempToolQuantity) || 1,
            purchase_link: selectedToolForQuantity.purchase_link || null,
            hasExistingImage: selectedToolForQuantity.image_file ? true : false,
            image_url: selectedToolForQuantity.image_file?.file_url,
            // Mark this as from repository so we can handle it differently
            fromRepository: true
        };

        // Add to current step tools
        if (setCurrentStepTools && typeof setCurrentStepTools === 'function') {
            setCurrentStepTools(prev => [...prev, stepTool]);
        }

        // Clear the quantity input
        setSelectedToolForQuantity(null);
        setTempToolQuantity(1);
    };

    // Cancel tool quantity input
    const cancelAddTool = () => {
        setSelectedToolForQuantity(null);
        setTempToolQuantity(1);
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

        // Set the selected material for quantity input
        setSelectedMaterialForQuantity(repoMaterial);
        setTempMaterialQuantity(1);
        setShowMaterialRepo(false);
        setMaterialSearchTerm('');
    };

    // Confirm material addition with quantity
    const confirmAddMaterialWithQuantity = () => {
        if (!selectedMaterialForQuantity) return;

        // Create a step material object that includes repository reference
        const stepMaterial = {
            id: `material_${Date.now()}_${Math.random()}`, // Temporary ID for UI purposes
            material_id: selectedMaterialForQuantity.material_id, // Reference to repository material - IMPORTANT for backend
            name: selectedMaterialForQuantity.name,
            specification: selectedMaterialForQuantity.specification || '',
            quantity: parseInt(tempMaterialQuantity) || 1,
            purchase_link: selectedMaterialForQuantity.purchase_link || null,
            hasExistingImage: selectedMaterialForQuantity.image_file ? true : false,
            image_url: selectedMaterialForQuantity.image_file?.file_url,
            // Mark this as from repository so we can handle it differently
            fromRepository: true
        };

        // Add to current step materials
        if (setCurrentStepMaterials && typeof setCurrentStepMaterials === 'function') {
            setCurrentStepMaterials(prev => [...prev, stepMaterial]);
        }

        // Clear the quantity input
        setSelectedMaterialForQuantity(null);
        setTempMaterialQuantity(1);
    };

    // Cancel material quantity input
    const cancelAddMaterial = () => {
        setSelectedMaterialForQuantity(null);
        setTempMaterialQuantity(1);
    };

    // Save new tool to repository
    const saveToolToRepository = async (toolName, toolSpec, toolImageFile, toolPurchaseLink) => {
        try {
            let imagePath = null;
            
            // Upload image to Firebase if provided
            if (toolImageFile) {
                try {
                    const storageRef = ref(storage, `tools/${currentUser.uid}/${Date.now()}_${toolImageFile.name}`);
                    const uploadResult = await uploadBytes(storageRef, toolImageFile);
                    imagePath = uploadResult.metadata.fullPath;
                    console.log('Tool image uploaded to Firebase:', imagePath);
                } catch (uploadError) {
                    console.error('Error uploading tool image:', uploadError);
                    alert('Failed to upload image. Tool will be saved without image.');
                }
            }

            // Validate purchase link URL
            let validatedPurchaseLink = null;
            if (toolPurchaseLink && toolPurchaseLink.trim() !== '') {
                try {
                    // Basic URL validation - ensure it starts with http:// or https://
                    const url = toolPurchaseLink.trim();
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        alert('Purchase link must be a valid URL starting with http:// or https://');
                        return null;
                    }
                    validatedPurchaseLink = url;
                } catch (error) {
                    console.error('Invalid purchase link URL:', error);
                    alert('Invalid purchase link URL. Please enter a valid URL.');
                    return null;
                }
            }

            const toolData = {
                name: toolName,
                specification: toolSpec || '',
                purchase_link: validatedPurchaseLink,
                image_path: imagePath
            };

            console.log('Sending tool data to backend:', toolData);

            const response = await fetch(`${getApiUrl()}/users/${currentUser.uid}/tools`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(toolData),
            });

            if (response.ok) {
                const newTool = await response.json();
                setRepoTools(prev => [...prev, newTool]);
                console.log('Tool saved to repository:', newTool);
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

    // Save new material to repository
    const saveMaterialToRepository = async (materialName, materialSpec, materialImageFile, materialPurchaseLink) => {
        try {
            let imagePath = null;
            
            // Upload image to Firebase if provided
            if (materialImageFile) {
                try {
                    const storageRef = ref(storage, `materials/${currentUser.uid}/${Date.now()}_${materialImageFile.name}`);
                    const uploadResult = await uploadBytes(storageRef, materialImageFile);
                    imagePath = uploadResult.metadata.fullPath;
                    console.log('Material image uploaded to Firebase:', imagePath);
                } catch (uploadError) {
                    console.error('Error uploading material image:', uploadError);
                    alert('Failed to upload image. Material will be saved without image.');
                }
            }

            // Validate purchase link URL
            let validatedPurchaseLink = null;
            if (materialPurchaseLink && materialPurchaseLink.trim() !== '') {
                try {
                    // Basic URL validation - ensure it starts with http:// or https://
                    const url = materialPurchaseLink.trim();
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        alert('Purchase link must be a valid URL starting with http:// or https://');
                        return null;
                    }
                    validatedPurchaseLink = url;
                } catch (error) {
                    console.error('Invalid purchase link URL:', error);
                    alert('Invalid purchase link URL. Please enter a valid URL.');
                    return null;
                }
            }

            const materialData = {
                name: materialName,
                specification: materialSpec || '',
                purchase_link: validatedPurchaseLink,
                image_path: imagePath
            };

            console.log('Sending material data to backend:', materialData);

            const response = await fetch(`${getApiUrl()}/users/${currentUser.uid}/materials`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(materialData),
            });

            if (response.ok) {
                const newMaterial = await response.json();
                setRepoMaterials(prev => [...prev, newMaterial]);
                console.log('Material saved to repository:', newMaterial);
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
            // First save to repository
            const savedTool = await saveToolToRepository(
                currentStepToolName, 
                currentStepToolSpec, 
                currentStepToolImageFile,
                currentStepToolPurchaseLink
            );

            if (savedTool) {
                // Create step tool object with repository reference
                const stepTool = {
                    id: `tool_${Date.now()}_${Math.random()}`,
                    tool_id: savedTool.tool_id, // Use the correct tool_id from saved tool
                    name: currentStepToolName,
                    specification: currentStepToolSpec || '',
                    quantity: parseInt(currentStepToolQuantity) || 1,
                    purchase_link: currentStepToolPurchaseLink || null,
                    imageFile: currentStepToolImageFile,
                    hasExistingImage: false,
                    fromRepository: true
                };

                // Add to current step
                if (setCurrentStepTools && typeof setCurrentStepTools === 'function') {
                    setCurrentStepTools(prev => [...prev, stepTool]);
                } else if (typeof handleAddToolToCurrentStep === 'function') {
                    handleAddToolToCurrentStep();
                }

                // Clear form
                setCurrentStepToolName('');
                setCurrentStepToolSpec('');
                setCurrentStepToolImageFile(null);
                setCurrentStepToolPurchaseLink(null); // Clear purchase link
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
            // First save to repository
            const savedMaterial = await saveMaterialToRepository(
                currentStepMaterialName, 
                currentStepMaterialSpec, 
                currentStepMaterialImageFile,
                currentStepMaterialPurchaseLink
            );

            if (savedMaterial) {
                // Create step material object with repository reference
                const stepMaterial = {
                    id: `material_${Date.now()}_${Math.random()}`,
                    material_id: savedMaterial.material_id, // Use the ID from saved material
                    name: currentStepMaterialName,
                    specification: currentStepMaterialSpec || '',
                    quantity: parseInt(currentStepMaterialQuantity) || 1,
                    purchase_link: currentStepMaterialPurchaseLink || null,
                    imageFile: currentStepMaterialImageFile,
                    hasExistingImage: false,
                    fromRepository: true
                };

                // Add to current step
                if (setCurrentStepMaterials && typeof setCurrentStepMaterials === 'function') {
                    setCurrentStepMaterials(prev => [...prev, stepMaterial]);
                } else if (typeof handleAddMaterialToCurrentStep === 'function') {
                    handleAddMaterialToCurrentStep();
                }

                // Clear form
                setCurrentStepMaterialName('');
                setCurrentStepMaterialSpec('');
                setCurrentStepMaterialImageFile(null);
                setCurrentStepMaterialPurchaseLink(null); // Clear purchase link
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
                                            {tool.purchase_link && (
                                                <p style={{margin: 0, fontSize: '0.8rem', color: '#007bff'}}>
                                                    <a 
                                                        href={tool.purchase_link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{color: '#007bff', textDecoration: 'underline'}}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Purchase Link
                                                    </a>
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

                {/* Tool Quantity Input Modal */}
                {selectedToolForQuantity && (
                    <div 
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10000,
                        }}
                        onClick={cancelAddTool}
                    >
                        <div 
                            style={{
                                backgroundColor: '#111111',
                                border: '2px solid #007bff',
                                borderRadius: '12px',
                                padding: '2rem',
                                maxWidth: '400px',
                                width: '90%',
                                color: '#D9D9D9',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 style={{
                                margin: '0 0 1rem 0',
                                color: '#007bff',
                                fontSize: '1.2rem'
                            }}>
                                Set Quantity for Tool
                            </h3>
                            <div style={{marginBottom: '1rem'}}>
                                <p style={{margin: '0 0 0.5rem 0', fontWeight: '500'}}>
                                    {selectedToolForQuantity.name}
                                </p>
                                {selectedToolForQuantity.specification && (
                                    <p style={{margin: 0, fontSize: '0.9rem', color: '#D9D9D9'}}>
                                        {selectedToolForQuantity.specification}
                                    </p>
                                )}
                            </div>
                            <div style={{marginBottom: '1.5rem'}}>
                                <label style={{...styles.inputLabel, fontSize: '0.9rem'}}>Quantity</label>
                                <input
                                    type="number"
                                    value={tempToolQuantity}
                                    onChange={(e) => {
                                        const newQuantity = parseInt(e.target.value) || 1;
                                        setTempToolQuantity(newQuantity);
                                    }}
                                    min="1"
                                    style={{
                                        ...styles.inputField,
                                        width: '100%',
                                        fontSize: '1rem',
                                        padding: '0.75rem'
                                    }}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            confirmAddToolWithQuantity();
                                        } else if (e.key === 'Escape') {
                                            cancelAddTool();
                                        }
                                    }}
                                />
                            </div>
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    onClick={cancelAddTool}
                                    style={{
                                        ...styles.button,
                                        backgroundColor: '#666666',
                                        color: '#D9D9D9',
                                        padding: '0.75rem 1.5rem'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAddToolWithQuantity}
                                    style={{
                                        ...styles.button,
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        padding: '0.75rem 1.5rem'
                                    }}
                                >
                                    Add Tool
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                                                            style={{color: '#007bff', textDecoration: 'underline'}}
                                                        >
                                                            Purchase Link
                                                        </a>
                                                    </span>
                                                )}
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
                                            {material.purchase_link && (
                                                <p style={{margin: 0, fontSize: '0.8rem', color: '#007bff'}}>
                                                    <a 
                                                        href={material.purchase_link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{color: '#007bff', textDecoration: 'underline'}}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Purchase Link
                                                    </a>
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

                {/* Material Quantity Input Modal */}
                {selectedMaterialForQuantity && (
                    <div 
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10000,
                        }}
                        onClick={cancelAddMaterial}
                    >
                        <div 
                            style={{
                                backgroundColor: '#111111',
                                border: '2px solid #059669',
                                borderRadius: '12px',
                                padding: '2rem',
                                maxWidth: '400px',
                                width: '90%',
                                color: '#D9D9D9',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 style={{
                                margin: '0 0 1rem 0',
                                color: '#059669',
                                fontSize: '1.2rem'
                            }}>
                                Set Quantity for Material
                            </h3>
                            <div style={{marginBottom: '1rem'}}>
                                <p style={{margin: '0 0 0.5rem 0', fontWeight: '500'}}>
                                    {selectedMaterialForQuantity.name}
                                </p>
                                {selectedMaterialForQuantity.specification && (
                                    <p style={{margin: 0, fontSize: '0.9rem', color: '#D9D9D9'}}>
                                        {selectedMaterialForQuantity.specification}
                                    </p>
                                )}
                            </div>
                            <div style={{marginBottom: '1.5rem'}}>
                                <label style={{...styles.inputLabel, fontSize: '0.9rem'}}>Quantity</label>
                                <input
                                    type="number"
                                    value={tempMaterialQuantity}
                                    onChange={(e) => {
                                        const newQuantity = parseInt(e.target.value) || 1;
                                        setTempMaterialQuantity(newQuantity);
                                    }}
                                    min="1"
                                    style={{
                                        ...styles.inputField,
                                        width: '100%',
                                        fontSize: '1rem',
                                        padding: '0.75rem'
                                    }}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            confirmAddMaterialWithQuantity();
                                        } else if (e.key === 'Escape') {
                                            cancelAddMaterial();
                                        }
                                    }}
                                />
                            </div>
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    onClick={cancelAddMaterial}
                                    style={{
                                        ...styles.button,
                                        backgroundColor: '#666666',
                                        color: '#D9D9D9',
                                        padding: '0.75rem 1.5rem'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAddMaterialWithQuantity}
                                    style={{
                                        ...styles.button,
                                        backgroundColor: '#059669',
                                        color: 'white',
                                        padding: '0.75rem 1.5rem'
                                    }}
                                >
                                    Add Material
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
                                                            style={{color: '#007bff', textDecoration: 'underline'}}
                                                        >
                                                            Purchase Link
                                                        </a>
                                                    </span>
                                                )}
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

export default MaterialsAndFilesTab; 