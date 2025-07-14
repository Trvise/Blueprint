import React, { useState } from 'react';
import RepositoryPanel from './RepositoryPanel';
import { v4 as uuidv4 } from 'uuid';
import { getApiUrl } from '../pages/createsteps helpers/CreateStepsUtils';
import { useAuth } from '../../contexts/authContext';

const FinalizeTab = ({ 
    projectSteps,
    projectBuyList,
    handleFinishProject,
    isLoading,
    formatTime,
    styles,
    setProjectBuyList,
    projectId
}) => {
    const { currentUser } = useAuth();
    
    const [showQuantityModal, setShowQuantityModal] = useState(false);
    const [selectedRepoItem, setSelectedRepoItem] = useState(null);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    
    // Handler to clear the entire buy list
    const handleClearBuyList = async () => {
        if (projectBuyList.length === 0) {
            return;
        }

        const confirmed = window.confirm(`Are you sure you want to clear all ${projectBuyList.length} items from the buy list? This action cannot be undone.`);
        if (confirmed) {
            setProjectBuyList([]);
            // Save empty state to localStorage
            localStorage.setItem(`buyListState_${projectId}`, JSON.stringify([]));
            // Remove the old sessionStorage flag (no longer needed)
            sessionStorage.removeItem(`buyListCleared_${projectId}`);
            
            // Also sync the clear action to the database
            try {
                const response = await fetch(`${getApiUrl()}/projects/${projectId}/buy_list?firebase_uid=${currentUser?.uid}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log("Buy list cleared in database:", result.message);
                } else {
                    const errorData = await response.json();
                    console.warn("Failed to clear buy list in database:", errorData);
                }
            } catch (error) {
                console.warn("Error clearing buy list in database:", error);
                // Continue with local clear even if database sync fails
            }
        }
    };
    
    // Handler to show quantity modal for repository items
    const handleShowQuantityModal = (repoItem) => {
        setSelectedRepoItem(repoItem);
        setSelectedQuantity(1);
        setShowQuantityModal(true);
    };
    
    // Handler to add repository items to buy list with quantity
    const handleAddToBuyListWithQuantity = () => {
        if (!selectedRepoItem || selectedQuantity < 1) return;
        
        // Check if item already exists in buy list
        const existingItem = projectBuyList.find(item => 
            item.name.toLowerCase() === selectedRepoItem.name.toLowerCase() && 
            (item.specification || '').toLowerCase() === (selectedRepoItem.specification || '').toLowerCase()
        );
        
        let newBuyList;
        
        if (existingItem) {
            // If item exists, increase quantity
            newBuyList = projectBuyList.map(item => 
                item.id === existingItem.id 
                    ? { ...item, quantity: item.quantity + selectedQuantity }
                    : item
            );
        } else {
            // If item doesn't exist, add new item
            const newBuyListItem = {
                id: `buyitem_repo_${uuidv4()}`,
                name: selectedRepoItem.name,
                quantity: selectedQuantity,
                specification: selectedRepoItem.specification || '',
                purchase_link: selectedRepoItem.purchase_link || '',
                imageFile: null,
                hasExistingImage: !!(selectedRepoItem.image_file && selectedRepoItem.image_file.file_url),
                image_url: selectedRepoItem.image_file?.file_url || null,
                image_path: selectedRepoItem.image_file?.file_key || null,
                sourceType: 'repository',
                sourceId: selectedRepoItem.tool_id || selectedRepoItem.material_id
            };
            
            newBuyList = [...projectBuyList, newBuyListItem];
        }
        
        setProjectBuyList(newBuyList);
        // Save updated state to localStorage
        localStorage.setItem(`buyListState_${projectId}`, JSON.stringify(newBuyList));
        
        // Close modal
        setShowQuantityModal(false);
        setSelectedRepoItem(null);
        setSelectedQuantity(1);
    };

    const removeBuyListItem = (itemId) => {
        const newBuyList = projectBuyList.filter(item => item.id !== itemId);
        setProjectBuyList(newBuyList);
        // Save updated state to localStorage
        localStorage.setItem(`buyListState_${projectId}`, JSON.stringify(newBuyList));
    };

    return (
        <div>
            {/* Repository Section */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Add from Repository</h2>
                <p style={{fontSize: '0.9rem', color: '#D9D9D9', marginBottom: '20px'}}>
                    Add tools and materials from your repository to the shopping list.
                </p>
                <RepositoryPanel 
                    contextType="project" 
                    onAddToBuyList={handleShowQuantityModal}
                />
            </div>

            {/* Buy List Management */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Shopping List</h2>
                <p style={{fontSize: '0.9rem', color: '#D9D9D9', marginBottom: '20px'}}>
                    Items that users will need to purchase to complete this project.
                </p>

                {/* Clear Controls */}
                <div style={{
                    backgroundColor: '#000000', 
                    border: '1px solid #D9D9D9', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <span style={{fontSize: '0.9rem', color: '#D9D9D9', marginRight: '8px'}}>
                        Quick Actions:
                    </span>
                    {projectBuyList.length > 0 && (
                        <button
                            onClick={handleClearBuyList}
                            disabled={isLoading}
                            style={{
                                ...styles.button,
                                backgroundColor: '#dc2626',
                                color: 'white',
                                padding: '8px 16px',
                                fontSize: '0.9rem',
                                opacity: isLoading ? 0.6 : 1,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                border: 'none',
                                borderRadius: '6px'
                            }}
                        >
                            Clear All
                        </button>
                    )}
                    <span style={{fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic'}}>
                        Add items from your repository above. Use "Clear All" to remove everything from the buy list.
                    </span>
                </div>

                {/* Current Buy List */}
                {projectBuyList.length > 0 && (
                    <div>
                        <h3 style={styles.subSectionTitle}>Current Shopping List</h3>
                        <div style={{border: '1px solid #D9D9D9', borderRadius: '8px', overflow: 'hidden'}}>
                            {projectBuyList.map((item, index) => (
                                <div key={item.id} style={{
                                    padding: '16px',
                                    borderBottom: index < projectBuyList.length - 1 ? '1px solid #D9D9D9' : 'none',
                                    backgroundColor: index % 2 === 0 ? '#111111' : '#000000'
                                }}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px'}}>
                                        {/* Item Image */}
                                        {(item.hasExistingImage && item.image_url) || item.imageFile ? (
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '6px',
                                                overflow: 'hidden',
                                                border: '2px solid #666666',
                                                flexShrink: 0
                                            }}>
                                                <img 
                                                    src={item.hasExistingImage && item.image_url ? item.image_url : (item.imageFile ? URL.createObjectURL(item.imageFile) : null)}
                                                    alt={item.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div style={{
                                                    display: 'none',
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundColor: '#888888',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.7rem',
                                                    color: '#D9D9D9'
                                                }}>
                                                    IMG
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '6px',
                                                backgroundColor: '#888888',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.7rem',
                                                color: '#D9D9D9',
                                                flexShrink: 0
                                            }}>
                                                IMG
                                            </div>
                                        )}
                                        
                                        {/* Item Details */}
                                        <div style={{flex: 1}}>
                                            <h4 style={{
                                                fontSize: '1rem',
                                                fontWeight: 'bold',
                                                color: '#D9D9D9',
                                                marginBottom: '4px'
                                            }}>
                                                {item.name} (Qty: {item.quantity})
                                            </h4>
                                            {item.specification && (
                                                <p style={{
                                                    fontSize: '0.85rem',
                                                    color: '#9ca3af',
                                                    marginBottom: '4px'
                                                }}>
                                                    {item.specification}
                                                </p>
                                            )}
                                            {item.purchase_link && (
                                                <a 
                                                    href={item.purchase_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        color: '#0000FF',
                                                        textDecoration: 'underline',
                                                        marginBottom: '4px',
                                                        display: 'block'
                                                    }}
                                                >
                                                    View Product Link
                                                </a>
                                            )}
                                            <span style={{
                                                fontSize: '0.75rem',
                                                color: '#6b7280',
                                                fontStyle: 'italic'
                                            }}>
                                                {item.sourceType === 'repository' ? 'From Repository' : 'Manual Add'}
                                            </span>
                                        </div>
                                        
                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeBuyListItem(item.id)}
                                            style={{
                                                ...styles.button,
                                                backgroundColor: '#dc2626',
                                                color: 'white',
                                                padding: '6px 12px',
                                                fontSize: '0.8rem',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                flexShrink: 0
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {projectBuyList.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#6b7280',
                        fontStyle: 'italic'
                    }}>
                        No items in shopping list yet. Add items from your repository above.
                    </div>
                )}
            </div>

            {/* Quantity Modal */}
            {showQuantityModal && selectedRepoItem && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#111111',
                        border: '1px solid #D9D9D9',
                        borderRadius: '8px',
                        padding: '24px',
                        maxWidth: '400px',
                        width: '90%'
                    }}>
                        <h3 style={{
                            color: '#F1C232',
                            marginBottom: '16px',
                            fontSize: '1.2rem'
                        }}>
                            Add to Shopping List
                        </h3>
                        
                        <div style={{marginBottom: '16px'}}>
                            <h4 style={{
                                color: '#D9D9D9',
                                marginBottom: '8px',
                                fontSize: '1rem'
                            }}>
                                {selectedRepoItem.name}
                            </h4>
                            {selectedRepoItem.specification && (
                                <p style={{
                                    color: '#9ca3af',
                                    fontSize: '0.9rem',
                                    marginBottom: '8px'
                                }}>
                                    {selectedRepoItem.specification}
                                </p>
                            )}
                        </div>
                        
                        <div style={{marginBottom: '20px'}}>
                            <label style={{
                                display: 'block',
                                color: '#D9D9D9',
                                marginBottom: '8px',
                                fontSize: '0.9rem'
                            }}>
                                Quantity:
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={selectedQuantity}
                                onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    backgroundColor: '#000000',
                                    border: '1px solid #D9D9D9',
                                    borderRadius: '4px',
                                    color: '#D9D9D9',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={() => {
                                    setShowQuantityModal(false);
                                    setSelectedRepoItem(null);
                                    setSelectedQuantity(1);
                                }}
                                style={{
                                    ...styles.button,
                                    backgroundColor: '#666666',
                                    color: '#D9D9D9',
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddToBuyListWithQuantity}
                                disabled={selectedQuantity < 1}
                                style={{
                                    ...styles.button,
                                    backgroundColor: '#F1C232',
                                    color: '#000000',
                                    padding: '8px 16px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    opacity: selectedQuantity < 1 ? 0.6 : 1
                                }}
                            >
                                Add to List
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Finalize Project Section */}
            <div style={{...styles.card, marginTop: '32px'}}>
                <h2 style={styles.sectionTitle}>Finalize Project</h2>
                <p style={{fontSize: '0.9rem', color: '#D9D9D9', marginBottom: '20px'}}>
                    Complete your project and make it available to users.
                </p>
                
                <button
                    onClick={handleFinishProject}
                    disabled={isLoading}
                    style={{
                        ...styles.button,
                        ...styles.buttonPrimary,
                        ...(isLoading && styles.buttonDisabled),
                        padding: '12px 24px',
                        fontSize: '1rem'
                    }}
                >
                    {isLoading ? 'Finalizing Project...' : 'Finish Project'}
                </button>
            </div>
        </div>
    );
};

export default FinalizeTab; 