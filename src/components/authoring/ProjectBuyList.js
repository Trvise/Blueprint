import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid'; 

const ProjectBuyList = ({ styles, projectBuyList, onAddBuyListItem, onRemoveBuyListItem }) => {
    const [buyListItemName, setBuyListItemName] = useState('');
    const [buyListItemQty, setBuyListItemQty] = useState(1);
    const [buyListItemSpec, setBuyListItemSpec] = useState('');
    const [buyListItemLink, setBuyListItemLink] = useState('');
    const [buyListItemImageFile, setBuyListItemImageFile] = useState(null); 
    const buyListImageInputRef = useRef(null); 

    const handleAddItem = () => {
        if (!buyListItemName.trim()) { alert("Item name is required for buy list."); return; }
        
        onAddBuyListItem({
            id: `buyitem_${uuidv4()}`,
            name: buyListItemName,
            quantity: parseInt(buyListItemQty, 10) || 1,
            specification: buyListItemSpec,
            purchase_link: buyListItemLink,
            imageFile: buyListItemImageFile
        });
        
        setBuyListItemName(''); setBuyListItemQty(1); setBuyListItemSpec('');
        setBuyListItemLink(''); setBuyListItemImageFile(null);
        if (buyListImageInputRef.current) buyListImageInputRef.current.value = "";
    };

    return (
        <div style={{...styles.card, position: 'sticky', top: '20px'}}>
            <h2 style={styles.sectionTitle}>Project Buy List</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <div><label style={styles.inputLabel}>Item Name <span style={{color: 'red'}}>*</span></label><input type="text" value={buyListItemName} onChange={(e) => setBuyListItemName(e.target.value)} placeholder="e.g., M3x10mm Screw" style={styles.inputField}/></div>
                <div><label style={styles.inputLabel}>Quantity</label><input type="number" value={buyListItemQty} onChange={(e) => setBuyListItemQty(e.target.value)} min="1" style={styles.inputField}/></div>
                <div><label style={styles.inputLabel}>Specification</label><input type="text" value={buyListItemSpec} onChange={(e) => setBuyListItemSpec(e.target.value)} placeholder="e.g., Phillips head" style={styles.inputField}/></div>
                <div><label style={styles.inputLabel}>Purchase Link</label><input type="url" value={buyListItemLink} onChange={(e) => setBuyListItemLink(e.target.value)} placeholder="https://example.com" style={styles.inputField}/></div>
                <div><label style={{...styles.inputLabel, fontSize: '0.8rem'}}>Item Image</label><input type="file" accept="image/*" onChange={(e) => setBuyListItemImageFile(e.target.files[0])} ref={buyListImageInputRef} style={styles.fileInput}/></div>
                <button onClick={handleAddItem} style={{...styles.button, ...styles.buttonSecondary, width: '100%'}}>Add to Buy List</button>
            </div>
            {projectBuyList.length > 0 && (
                <div style={{marginTop: '20px', maxHeight: '250px', overflowY: 'auto'}}>
                    <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#34495e', marginBottom: '8px'}}>Current Items:</h3>
                    <ul style={{listStylePosition: 'inside', paddingLeft: '0', fontSize: '0.9rem', borderTop: '1px solid #eee'}}> 
                        {projectBuyList.map((item, index) => (
                            <li key={item.id} style={{...styles.listItem, ...(index === projectBuyList.length -1 && styles.listItemLast)}}>
                                <div>{item.name} (Qty: {item.quantity}) {item.imageFile && <span style={{fontSize: '0.75rem', color: '#777'}}>({item.imageFile.name.substring(0,10)}...)</span>}</div> 
                                <button onClick={() => onRemoveBuyListItem(item.id)} style={styles.removeButton}>X</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProjectBuyList;