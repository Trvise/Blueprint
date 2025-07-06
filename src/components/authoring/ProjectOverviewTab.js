import React from 'react';
import { COLORS, LAYOUT, formatFileSize, COMPONENTS, getListItemBorder, TYPOGRAPHY } from './shared/styles';

const ProjectOverviewTab = ({
    projectSteps,
    formatTime,
    projectBuyList,
    onEditStep,
    styles
}) => {
    const totalSteps = projectSteps.length;
    const totalAnnotations = projectSteps.reduce((sum, step) => sum + (step.annotations?.length || 0), 0);
    const totalTools = projectSteps.reduce((sum, step) => sum + (step.tools?.length || 0), 0);
    const totalMaterials = projectSteps.reduce((sum, step) => sum + (step.materials?.length || 0), 0);

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: LAYOUT.cardPadding}}>
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Project Overview</h2>
                <div style={{marginBottom: LAYOUT.sectionSpacing}}>
                    <p style={TYPOGRAPHY.sectionDescription}>
                        This is a comprehensive overview of your project steps. Review each step to ensure all details are correct before finalizing.
                    </p>
                    <div style={{
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: LAYOUT.lg, 
                        marginBottom: LAYOUT.sectionSpacing
                    }}>
                        <div style={{
                            backgroundColor: '#e3f2fd',
                            padding: LAYOUT.lg,
                            borderRadius: '8px',
                            textAlign: 'center',
                            border: `2px solid ${COLORS.primary}20`
                        }}>
                            <div style={{fontSize: '2rem', fontWeight: 'bold', color: COLORS.primary}}>
                                {totalSteps}
                            </div>
                            <div style={{fontSize: '0.9rem', color: COLORS.text.secondary}}>
                                Total Steps
                            </div>
                        </div>
                        <div style={{
                            backgroundColor: '#f3e5f5',
                            padding: LAYOUT.lg,
                            borderRadius: '8px',
                            textAlign: 'center',
                            border: `2px solid #7b1fa220`
                        }}>
                            <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#7b1fa2'}}>
                                {totalAnnotations}
                            </div>
                            <div style={{fontSize: '0.9rem', color: COLORS.text.secondary}}>
                                Total Annotations
                            </div>
                        </div>
                        <div style={{
                            backgroundColor: COLORS.successBg,
                            padding: LAYOUT.lg,
                            borderRadius: '8px',
                            textAlign: 'center',
                            border: `2px solid ${COLORS.success}20`
                        }}>
                            <div style={{fontSize: '2rem', fontWeight: 'bold', color: COLORS.success}}>
                                {totalTools}
                            </div>
                            <div style={{fontSize: '0.9rem', color: COLORS.text.secondary}}>
                                Tools
                            </div>
                        </div>
                        <div style={{
                            backgroundColor: COLORS.warningBg,
                            padding: LAYOUT.lg,
                            borderRadius: '8px',
                            textAlign: 'center',
                            border: `2px solid ${COLORS.warning}20`
                        }}>
                            <div style={{fontSize: '2rem', fontWeight: 'bold', color: COLORS.warning}}>
                                {totalMaterials}
                            </div>
                            <div style={{fontSize: '0.9rem', color: COLORS.text.secondary}}>
                                Materials
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {projectSteps.length > 0 && (
                <div style={styles.card}>
                    <h2 style={styles.sectionTitle}>Defined Project Steps ({totalSteps})</h2>
                    <div style={COMPONENTS.fileList}>
                        {projectSteps.map((step, index) => (
                            <div 
                                key={step.id || index} 
                                style={{
                                    padding: `${LAYOUT.sectionSpacing} ${LAYOUT.lg}`,
                                    ...getListItemBorder(index, projectSteps.length)
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: LAYOUT.sm
                                }}>
                                    <div style={{flex: 1}}>
                                        <h3 style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            color: COLORS.text.primary,
                                            marginBottom: LAYOUT.sm
                                        }}>
                                            {index + 1}. {step.name} (Video {step.associated_video_index + 1})
                                        </h3>
                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: COLORS.text.secondary,
                                            marginBottom: LAYOUT.sm,
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {step.description}
                                        </p>
                                        
                                        {step.cautionary_notes && (
                                            <div style={{
                                                fontSize: '0.85rem',
                                                color: '#e67e22',
                                                marginBottom: LAYOUT.sm,
                                                padding: LAYOUT.sm,
                                                backgroundColor: '#fff3cd',
                                                borderRadius: '4px',
                                                border: '1px solid #ffeaa7'
                                            }}>
                                                <strong>⚠️ Caution:</strong> {step.cautionary_notes}
                                            </div>
                                        )}
                                        
                                        {step.best_practice_notes && (
                                            <div style={{
                                                fontSize: '0.85rem',
                                                color: '#3498db',
                                                marginBottom: LAYOUT.sm,
                                                padding: LAYOUT.sm,
                                                backgroundColor: '#d1ecf1',
                                                borderRadius: '4px',
                                                border: '1px solid #bee5eb'
                                            }}>
                                                <strong>💡 Best Practice:</strong> {step.best_practice_notes}
                                            </div>
                                        )}
                                        
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: COLORS.text.muted,
                                            marginBottom: LAYOUT.sm
                                        }}>
                                            <strong>Video Segment:</strong> {formatTime(step.video_start_time_ms / 1000)} - {formatTime(step.video_end_time_ms / 1000)}
                                        </div>
                                    </div>
                                    
                                    {onEditStep && (
                                        <button
                                            onClick={() => onEditStep(step, index)}
                                            style={{
                                                backgroundColor: COLORS.primary,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '6px 12px',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                marginLeft: LAYOUT.sm
                                            }}
                                        >
                                            Edit Step
                                        </button>
                                    )}
                                </div>
                                
                                <div style={{display: 'flex', flexWrap: 'wrap', gap: LAYOUT.sm}}>
                                    {step.annotations?.length > 0 && (
                                        <details style={{fontSize: '0.85rem'}}>
                                            <summary style={{
                                                color: '#8e44ad',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                padding: '4px 8px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '4px',
                                                border: '1px solid #e9ecef'
                                            }}>
                                                📍 Annotations ({step.annotations.length})
                                            </summary>
                                            <ul style={{
                                                listStyle: 'disc',
                                                paddingLeft: '20px',
                                                marginTop: LAYOUT.sm,
                                                fontSize: '0.8rem'
                                            }}>
                                                {step.annotations.map((ann, annIndex) => {
                                                    // Handle both data structures for annotation text and timestamp
                                                    const annotationText = ann.component_name || ann.data?.text || 'Untitled annotation';
                                                    const annotationTimestamp = ann.frame_timestamp_ms || ann.data?.frame_timestamp_ms;
                                                    const annotationId = ann.annotation_id || ann.data?.id;
                                                    
                                                    return (
                                                        <li key={annotationId || `annotation-${annIndex}`}>
                                                            {annotationText} at {formatTime(annotationTimestamp / 1000)}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </details>
                                    )}
                                    
                                    {step.tools?.length > 0 && (
                                        <details style={{fontSize: '0.85rem'}}>
                                            <summary style={{
                                                color: '#e67e22',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                padding: '4px 8px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '4px',
                                                border: '1px solid #e9ecef'
                                            }}>
                                                🔧 Tools ({step.tools.length})
                                            </summary>
                                            <ul style={{
                                                listStyle: 'disc',
                                                paddingLeft: '20px',
                                                marginTop: LAYOUT.sm,
                                                fontSize: '0.8rem'
                                            }}>
                                                {step.tools.map((tool, toolIndex) => (
                                                    <li key={tool.id || `tool-${toolIndex}`}>
                                                        <strong>{tool.name}</strong>
                                                        {tool.specification && <span> - {tool.specification}</span>}
                                                        {tool.image_file && <span> 📷</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    )}
                                    
                                    {step.materials?.length > 0 && (
                                        <details style={{fontSize: '0.85rem'}}>
                                            <summary style={{
                                                color: '#27ae60',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                padding: '4px 8px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '4px',
                                                border: '1px solid #e9ecef'
                                            }}>
                                                🧱 Materials ({step.materials.length})
                                            </summary>
                                            <ul style={{
                                                listStyle: 'disc',
                                                paddingLeft: '20px',
                                                marginTop: LAYOUT.sm,
                                                fontSize: '0.8rem'
                                            }}>
                                                {step.materials.map((material, matIndex) => (
                                                    <li key={material.id || `material-${matIndex}`}>
                                                        <strong>{material.name}</strong>
                                                        {material.specification && <span> - {material.specification}</span>}
                                                        {material.image_file && <span> 📷</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    )}
                                    
                                    {step.supplementary_files?.length > 0 && (
                                        <details style={{fontSize: '0.85rem'}}>
                                            <summary style={{
                                                color: '#3498db',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                padding: '4px 8px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '4px',
                                                border: '1px solid #e9ecef'
                                            }}>
                                                📎 Files ({step.supplementary_files.length})
                                            </summary>
                                            <ul style={{
                                                listStyle: 'disc',
                                                paddingLeft: '20px',
                                                marginTop: LAYOUT.sm,
                                                fontSize: '0.8rem'
                                            }}>
                                                {step.supplementary_files.map((file, fileIndex) => (
                                                    <li key={file.id || `file-${fileIndex}`}>
                                                        {file.display_name || file.displayName}
                                                        {file.file && <span> ({formatFileSize(file.file.file_size_bytes)})</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                    )}
                                    
                                    {step.validation_metric?.question && (
                                        <details style={{fontSize: '0.85rem'}}>
                                            <summary style={{
                                                color: '#9b59b6',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                padding: '4px 8px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '4px',
                                                border: '1px solid #e9ecef'
                                            }}>
                                                ✅ Validation
                                            </summary>
                                            <div style={{
                                                paddingLeft: '20px',
                                                marginTop: LAYOUT.sm,
                                                fontSize: '0.8rem'
                                            }}>
                                                <strong>Q:</strong> {step.validation_metric.question}<br/>
                                                <strong>Expected:</strong> {step.validation_metric.expected_answer}
                                            </div>
                                        </details>
                                    )}
                                </div>
                                
                                {step.result_image_file_info && (
                                    <p style={{
                                        fontSize: '0.85rem',
                                        color: COLORS.text.secondary,
                                        marginTop: LAYOUT.sm,
                                        padding: LAYOUT.sm,
                                        backgroundColor: COLORS.gray[50],
                                        borderRadius: '4px'
                                    }}>
                                        <strong>📸 Result Image:</strong> {step.result_image_file_info.name}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {projectBuyList && projectBuyList.length > 0 && (
                <div>
                    <h3 style={{...styles.inputLabel, marginBottom: LAYOUT.sm}}>
                        🛒 Shopping List ({projectBuyList.length} items)
                    </h3>
                    <div style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        padding: LAYOUT.md,
                        backgroundColor: COLORS.gray[50],
                        borderRadius: '8px',
                        border: `1px solid ${COLORS.gray[200]}`
                    }}>
                        {projectBuyList.map((item, index) => (
                            <div 
                                key={item.id || index}
                                style={{
                                    padding: '8px 0',
                                    borderBottom: index < projectBuyList.length - 1 ? `1px solid ${COLORS.gray[200]}` : 'none',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <strong>{item.name}</strong> (Qty: {item.quantity})
                                {item.specification && <div style={{fontSize: '0.8rem', color: COLORS.text.muted}}>{item.specification}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectOverviewTab; 