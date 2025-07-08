import React from 'react';
import { COMPONENTS, TYPOGRAPHY, formatFileSize, getListItemBorder } from './shared/styles';

const FilesTab = ({
    currentStepSupFiles,
    currentStepSupFileName,
    setCurrentStepSupFileName,
    supFileInputRef,
    handleSupFileChange,
    removeSupFileFromCurrentStep,
    styles
}) => (
    <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Supplementary Files</h2>
        <p style={TYPOGRAPHY.sectionDescription}>
            Add documents, PDFs, or other files that support this step (assembly instructions, datasheets, etc.)
        </p>
        
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
            <div style={{marginTop: '16px'}}>
                <h4 style={TYPOGRAPHY.listTitle}>Added Files ({currentStepSupFiles.length}):</h4>
                <div style={COMPONENTS.fileList}>
                    {currentStepSupFiles.map((f, index) => (
                        <div 
                            key={f.id} 
                            style={{
                                ...COMPONENTS.fileListItem,
                                ...getListItemBorder(index, currentStepSupFiles.length)
                            }}
                        >
                            <div>
                                <p style={COMPONENTS.fileListItemTitle}>
                                    📎 {f.displayName}
                                </p>
                                <p style={COMPONENTS.fileListItemSubtext}>
                                    {f.fileObject ? (
                                        `New file: ${f.fileObject.name} (${formatFileSize(f.fileObject.size)})`
                                    ) : f.hasExistingFile ? (
                                        `Existing file: ${f.original_filename} ${f.file_size_bytes ? `(${formatFileSize(f.file_size_bytes)})` : ''}`
                                    ) : (
                                        'File information unavailable'
                                    )}
                                </p>
                            </div>
                            <button 
                                onClick={() => removeSupFileFromCurrentStep(f.id)} 
                                style={COMPONENTS.removeButton}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {currentStepSupFiles.length === 0 && (
            <div style={COMPONENTS.emptyState}>
                <p style={COMPONENTS.emptyStateText}>
                    No supplementary files added yet. Upload files that will help users complete this step.
                </p>
            </div>
        )}
    </div>
);

export default FilesTab; 