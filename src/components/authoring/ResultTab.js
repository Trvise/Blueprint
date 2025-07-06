import React from 'react';
import { COMPONENTS, TYPOGRAPHY, COLORS, LAYOUT } from './shared/styles';

const ResultTab = ({
    currentStepResultImage,
    currentStepResultImageFile,
    handleResultImageChange,
    resultImageInputRef,
    styles
}) => (
    <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Step Result</h2>
        <p style={TYPOGRAPHY.sectionDescription}>
            Upload an image showing what the completed step should look like
        </p>
        
        <div style={{marginBottom: LAYOUT.sectionSpacing}}>
            <label style={styles.inputLabel}>Result Image</label>
            <input 
                type="file" 
                accept="image/*" 
                onChange={handleResultImageChange} 
                ref={resultImageInputRef} 
                style={styles.fileInput}
            />
            <p style={TYPOGRAPHY.helpText}>
                Choose an image that clearly shows the expected result after completing this step
            </p>
        </div>
        
        {currentStepResultImage && (
            <div style={{marginTop: LAYOUT.sectionSpacing}}>
                <h4 style={TYPOGRAPHY.listTitle}>Preview:</h4>
                <div style={{
                    ...COMPONENTS.fileList,
                    padding: LAYOUT.sectionSpacing,
                    textAlign: 'center'
                }}>
                    <img 
                        src={currentStepResultImage} 
                        alt="Step result preview" 
                        style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            borderRadius: '8px',
                            border: `2px solid ${COLORS.gray[200]}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    />
                    {currentStepResultImageFile && (
                        <p style={{
                            ...COMPONENTS.fileListItemSubtext,
                            marginTop: LAYOUT.inputSpacing,
                            textAlign: 'center'
                        }}>
                            File: {currentStepResultImageFile.name}
                        </p>
                    )}
                </div>
            </div>
        )}
        
        {!currentStepResultImage && (
            <div style={COMPONENTS.emptyState}>
                <p style={COMPONENTS.emptyStateText}>
                    No result image uploaded yet. Upload an image showing the expected outcome of this step.
                </p>
            </div>
        )}
    </div>
);

export default ResultTab; 