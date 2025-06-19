import React from 'react';

const ProjectOverviewTab = ({
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
    formatTime,
    styles
}) => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
        <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Project Buy List</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <div>
                    <label style={styles.inputLabel}>Item Name <span style={{color: 'red'}}>*</span></label>
                    <input 
                        type="text" 
                        value={buyListItemName} 
                        onChange={(e) => setBuyListItemName(e.target.value)} 
                        placeholder="e.g., M3x10mm Screw" 
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
                <div>
                    <label style={styles.inputLabel}>Specification</label>
                    <input 
                        type="text" 
                        value={buyListItemSpec} 
                        onChange={(e) => setBuyListItemSpec(e.target.value)} 
                        placeholder="e.g., Phillips head" 
                        style={styles.inputField}
                    />
                </div>
                <div>
                    <label style={styles.inputLabel}>Purchase Link</label>
                    <input 
                        type="url" 
                        value={buyListItemLink} 
                        onChange={(e) => setBuyListItemLink(e.target.value)} 
                        placeholder="https://example.com" 
                        style={styles.inputField}
                    />
                </div>
                <div>
                    <label style={{...styles.inputLabel, fontSize: '0.8rem'}}>Item Image</label>
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
                    style={{...styles.button, ...styles.buttonSecondary, width: '100%'}}
                >
                    Add to Buy List
                </button>
            </div>
            {projectBuyList.length > 0 && (
                <div style={{marginTop: '20px', maxHeight: '250px', overflowY: 'auto'}}>
                    <h3 style={{fontSize: '1rem', fontWeight: '600', color: '#34495e', marginBottom: '8px'}}>
                        Current Items:
                    </h3>
                    <ul style={{listStylePosition: 'inside', paddingLeft: '0', fontSize: '0.9rem', borderTop: '1px solid #eee'}}>
                        {projectBuyList.map((item, index) => (
                            <li key={item.id} style={{...styles.listItem, ...(index === projectBuyList.length -1 && styles.listItemLast)}}>
                                <div>
                                    {item.name} (Qty: {item.quantity}) 
                                    {item.imageFile && (
                                        <span style={{fontSize: '0.75rem', color: '#777'}}>
                                            ({item.imageFile.name.substring(0,10)}...)
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => removeBuyListItem(item.id)} style={styles.removeButton}>X</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        {projectSteps.length > 0 && (
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Defined Project Steps ({projectSteps.length})</h2>
                <ul style={{listStyle: 'none', padding: 0}}>
                    {projectSteps.map((step, index) => (
                        <li key={step.id || index} style={{padding: '15px 0', borderBottom: '1px solid #eee', ...(index === projectSteps.length -1 && {borderBottom: 'none'})}}>
                            <h3 style={{fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50'}}>
                                {index + 1}. {step.name} (Video {step.associated_video_index + 1})
                            </h3>
                            <p style={{fontSize: '0.9rem', color: '#555', marginTop: '4px', whiteSpace: 'pre-wrap'}}>
                                {step.description}
                            </p>
                            {step.cautionary_notes && (
                                <p style={{fontSize: '0.85rem', color: '#e67e22', marginTop: '6px'}}>
                                    <strong>Caution:</strong> {step.cautionary_notes}
                                </p>
                            )}
                            {step.best_practice_notes && (
                                <p style={{fontSize: '0.85rem', color: '#3498db', marginTop: '6px'}}>
                                    <strong>Best Practice:</strong> {step.best_practice_notes}
                                </p>
                            )}
                            <p style={{fontSize: '0.8rem', color: '#7f8c8d', marginTop: '6px'}}>
                                Video Segment: {formatTime(step.video_start_time_ms / 1000)} - {formatTime(step.video_end_time_ms / 1000)}
                            </p>
                            {step.annotations?.length > 0 && (
                                <details style={{fontSize: '0.85rem', marginTop: '6px'}}>
                                    <summary style={{color: '#8e44ad', cursor: 'pointer', fontWeight:'500'}}>
                                        Annotations ({step.annotations.length})
                                    </summary>
                                    <ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px'}}>
                                        {step.annotations.map(ann => (
                                            <li key={ann.data.id}>
                                                {ann.data.text} at {formatTime(ann.data.frame_timestamp_ms / 1000)}
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            )}
                            {step.materials?.length > 0 && (
                                <details style={{fontSize: '0.85rem', marginTop: '6px'}}>
                                    <summary style={{color: '#d35400', cursor: 'pointer', fontWeight:'500'}}>
                                        Materials ({step.materials.length})
                                    </summary>
                                    <ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px'}}>
                                        {step.materials.map(mat => (
                                            <li key={mat.id}>
                                                {mat.name} {mat.imageFile && `(${mat.imageFile.name.substring(0,15)}...)`}
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            )}
                            {step.supplementary_files?.length > 0 && (
                                <details style={{fontSize: '0.85rem', marginTop: '6px'}}>
                                    <summary style={{color: '#2980b9', cursor: 'pointer', fontWeight:'500'}}>
                                        Files ({step.supplementary_files.length})
                                    </summary>
                                    <ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px'}}>
                                        {step.supplementary_files.map(f => (
                                            <li key={f.id}>{f.displayName}</li>
                                        ))}
                                    </ul>
                                </details>
                            )}
                            {step.result_image_file_info && (
                                <p style={{fontSize: '0.85rem', color: '#7f8c8d', marginTop: '6px'}}>
                                    <strong>Result Image:</strong> {step.result_image_file_info.name}
                                </p>
                            )}
                            {step.validation_metric?.question && (
                                <p style={{fontSize: '0.85rem', color: '#27ae60', marginTop: '6px'}}>
                                    <strong>Validation:</strong> {step.validation_metric.question}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);

export default ProjectOverviewTab; 