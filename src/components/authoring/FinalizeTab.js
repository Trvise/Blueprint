import React from 'react';

const FinalizeTab = ({ 
    projectSteps,
    projectBuyList,
    buyListItemName,
    setBuyListItemName,
    buyListItemQty,
    setBuyListItemQty,
    buyListItemSpec,
    setBuyListItemSpec,
    buyListItemLink,
    setBuyListItemLink,
    buyListItemImageFile,
    setBuyListItemImageFile,
    buyListImageInputRef,
    handleAddBuyListItem,
    removeBuyListItem,
    handleFinishProject,
    isLoading,
    formatTime,
    styles 
}) => {
    return (
        <div>
            {/* Buy List Management */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Shopping List</h2>
                <p style={{fontSize: '0.9rem', color: '#D9D9D9', marginBottom: '20px'}}>
                    Add items that users will need to purchase to complete this project.
                </p>
                
                {/* Add Buy List Item Form */}
                <div style={{backgroundColor: '#000000', border: '1px solid #444444', padding: '20px', borderRadius: '8px', marginBottom: '20px'}}>
                    <h3 style={{...styles.subSectionTitle, marginTop: '0'}}>Add New Item</h3>
                    <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px'}}>
                        <div>
                            <label style={styles.inputLabel}>Item Name *</label>
                            <input
                                type="text"
                                value={buyListItemName}
                                onChange={(e) => setBuyListItemName(e.target.value)}
                                placeholder="e.g., Arduino Uno R3"
                                style={styles.inputField}
                            />
                        </div>
                        <div>
                            <label style={styles.inputLabel}>Quantity</label>
                            <input
                                type="number"
                                value={buyListItemQty}
                                onChange={(e) => setBuyListItemQty(e.target.value)}
                                min="1"
                                style={styles.inputField}
                            />
                        </div>
                    </div>
                    
                    <div style={{marginBottom: '16px'}}>
                        <label style={styles.inputLabel}>Specification/Description</label>
                        <textarea
                            value={buyListItemSpec}
                            onChange={(e) => setBuyListItemSpec(e.target.value)}
                            placeholder="Detailed specifications or requirements..."
                            style={styles.textareaField}
                        />
                    </div>
                    
                    <div style={{marginBottom: '16px'}}>
                        <label style={styles.inputLabel}>Purchase Link (Optional)</label>
                        <input
                            type="url"
                            value={buyListItemLink}
                            onChange={(e) => setBuyListItemLink(e.target.value)}
                            placeholder="https://..."
                            style={styles.inputField}
                        />
                    </div>
                    
                    <div style={{marginBottom: '16px'}}>
                        <label style={styles.inputLabel}>Item Image (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setBuyListItemImageFile(e.target.files[0])}
                            ref={buyListImageInputRef}
                            style={styles.fileInput}
                        />
                    </div>
                    
                    <button
                        onClick={handleAddBuyListItem}
                        style={{...styles.button, ...styles.buttonPrimary}}
                    >
                        Add to Shopping List
                    </button>
                </div>

                {/* Current Buy List */}
                {projectBuyList.length > 0 && (
                    <div>
                        <h3 style={styles.subSectionTitle}>Current Shopping List</h3>
                        <div style={{border: '1px solid #444444', borderRadius: '8px', overflow: 'hidden'}}>
                            {projectBuyList.map((item, index) => (
                                <div key={item.id} style={{
                                    padding: '16px',
                                    borderBottom: index < projectBuyList.length - 1 ? '1px solid #444444' : 'none',
                                    backgroundColor: index % 2 === 0 ? '#D9D9D9' : '#CCCCCC'
                                }}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                        <div style={{flex: 1}}>
                                            <div style={{fontWeight: '600', color: '#000000', marginBottom: '4px'}}>
                                                {item.name} (Qty: {item.quantity})
                                            </div>
                                            {item.specification && (
                                                <div style={{fontSize: '0.85rem', color: '#333333', marginBottom: '4px'}}>
                                                    {item.specification}
                                                </div>
                                            )}
                                            {item.purchase_link && (
                                                <div style={{fontSize: '0.8rem'}}>
                                                    <a 
                                                        href={item.purchase_link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        style={{color: '#0000FF', textDecoration: 'none'}}
                                                    >
                                                        View Product Link
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeBuyListItem(item.id)}
                                            style={styles.removeButton}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Finalize Project Section */}
            <div style={{
                ...styles.card,
                backgroundColor: '#f0fff4',
                border: '2px solid #10b981',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
            }}>
                <h2 style={{...styles.sectionTitle, color: '#065f46'}}>Ready to Finalize?</h2>
                <p style={{fontSize: '1rem', color: '#047857', marginBottom: '20px'}}>
                    Once you finalize this project, all your steps, materials, and shopping list will be saved and published.
                </p>
                
                <div style={{backgroundColor: 'white', padding: '16px', borderRadius: '8px', marginBottom: '20px'}}>
                    <h3 style={{fontSize: '1.1rem', fontWeight: '600', color: '#065f46', marginBottom: '12px'}}>
                        Final Checklist
                    </h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span style={{color: projectSteps.length > 0 ? '#10b981' : '#ef4444', fontSize: '1.2rem'}}>
                                {projectSteps.length > 0 ? '✓' : '✗'}
                            </span>
                            <span style={{color: projectSteps.length > 0 ? '#065f46' : '#7f1d1d'}}>
                                Project has at least one step ({projectSteps.length} steps)
                            </span>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span style={{color: '#10b981', fontSize: '1.2rem'}}>✓</span>
                            <span style={{color: '#065f46'}}>
                                Shopping list configured ({projectBuyList.length} items)
                            </span>
                        </div>
                    </div>
                </div>
                
                <button
                    onClick={handleFinishProject}
                    disabled={isLoading || projectSteps.length === 0}
                    style={{
                        ...styles.button,
                        backgroundColor: projectSteps.length > 0 ? '#10b981' : '#9ca3af',
                        color: 'white',
                        fontSize: '1.1rem',
                        padding: '14px 28px',
                        fontWeight: '600',
                        ...(isLoading && styles.buttonDisabled)
                    }}
                >
                    {isLoading ? 'Finalizing Project...' : 'Finalize & Publish Project'}
                </button>
                
                {projectSteps.length === 0 && (
                    <p style={{fontSize: '0.85rem', color: '#dc2626', marginTop: '8px', fontStyle: 'italic'}}>
                        Please add at least one step before finalizing the project.
                    </p>
                )}
            </div>
        </div>
    );
};

export default FinalizeTab; 