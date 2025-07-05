import React from 'react';

const ProjectOverviewTab = ({
    projectSteps,
    formatTime,
    styles
}) => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
        <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Project Overview</h2>
            <div style={{marginBottom: '20px'}}>
                <p style={{fontSize: '1rem', color: '#4a5568', marginBottom: '12px'}}>
                    This is a comprehensive overview of your project steps. Review each step to ensure all details are correct before finalizing.
                </p>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px'}}>
                    <div style={{backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '8px', textAlign: 'center'}}>
                        <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#1976d2'}}>{projectSteps.length}</div>
                        <div style={{fontSize: '0.9rem', color: '#1565c0'}}>Total Steps</div>
                    </div>
                    <div style={{backgroundColor: '#f3e5f5', padding: '16px', borderRadius: '8px', textAlign: 'center'}}>
                        <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#7b1fa2'}}>{projectSteps.reduce((acc, step) => acc + (step.annotations?.length || 0), 0)}</div>
                        <div style={{fontSize: '0.9rem', color: '#6a1b9a'}}>Total Annotations</div>
                    </div>
                    <div style={{backgroundColor: '#e8f5e8', padding: '16px', borderRadius: '8px', textAlign: 'center'}}>
                        <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#388e3c'}}>{projectSteps.reduce((acc, step) => acc + (step.tools?.length || 0) + (step.materials?.length || 0), 0)}</div>
                        <div style={{fontSize: '0.9rem', color: '#2e7d32'}}>Tools & Materials</div>
                    </div>
                </div>
            </div>
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
                                        {step.annotations.map((ann, annIndex) => (
                                            <li key={ann.data.id || `annotation-${annIndex}`}>
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
                                        {step.materials.map((mat, matIndex) => (
                                            <li key={mat.id || `material-${matIndex}`}>
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
                                        {step.supplementary_files.map((f, fileIndex) => (
                                            <li key={f.id || `file-${fileIndex}`}>{f.displayName}</li>
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