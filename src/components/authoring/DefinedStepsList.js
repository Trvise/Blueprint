import React from 'react';

const DefinedStepsList = ({ styles, projectSteps, formatTime }) => {
    if (projectSteps.length === 0) {
        return null;
    }

    return (
        <div style={{...styles.card, marginTop: '30px'}}>
            <h2 style={styles.sectionTitle}>Defined Project Steps ({projectSteps.length})</h2>
            <ul style={{listStyle: 'none', padding: 0}}>
                {projectSteps.map((step, index) => (
                    <li key={step.id || index} style={{padding: '15px 0', borderBottom: '1px solid #eee', ...(index === projectSteps.length -1 && {borderBottom: 'none'})}}>
                        <h3 style={{fontSize: '1.2rem', fontWeight: '600', color: '#2c3e50'}}>{index + 1}. {step.name} (Video {step.associated_video_index + 1})</h3>
                        <p style={{fontSize: '0.9rem', color: '#555', marginTop: '4px', whiteSpace: 'pre-wrap'}}>{step.description}</p>
                        {step.cautionary_notes && <p style={{fontSize: '0.85rem', color: '#e67e22', marginTop: '6px'}}><strong>Caution:</strong> {step.cautionary_notes}</p>}
                        {step.best_practice_notes && <p style={{fontSize: '0.85rem', color: '#3498db', marginTop: '6px'}}><strong>Best Practice:</strong> {step.best_practice_notes}</p>}
                        <p style={{fontSize: '0.8rem', color: '#7f8c8d', marginTop: '6px'}}>Video Segment: {formatTime(step.video_start_time_ms / 1000)} - {formatTime(step.video_end_time_ms / 1000)}</p>
                        {step.annotations?.length > 0 && <details style={{fontSize: '0.85rem', marginTop: '6px'}}><summary style={{color: '#8e44ad', cursor: 'pointer', fontWeight:'500'}}>Annotations ({step.annotations.length})</summary><ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px'}}>{step.annotations.map((ann, annIndex) => (<li key={ann.data.id || `ann-${annIndex}`}>{ann.data.text} at {formatTime(ann.data.frame_timestamp_ms / 1000)}</li>))}</ul></details>}
                        {step.materials?.length > 0 && <details style={{fontSize: '0.85rem', marginTop: '6px'}}><summary style={{color: '#d35400', cursor: 'pointer', fontWeight:'500'}}>Materials ({step.materials.length})</summary><ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px'}}>{step.materials.map((mat, matIndex) => (<li key={mat.id || `mat-${matIndex}`}>{mat.name} {mat.imageFile && `(${mat.imageFile.name.substring(0,15)}...)`}</li>))}</ul></details>}
                        {step.tools?.length > 0 && <details style={{fontSize: '0.85rem', marginTop: '6px'}}><summary style={{color: '#16a085', cursor: 'pointer', fontWeight:'500'}}>Tools ({step.tools.length})</summary><ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px'}}>{step.tools.map((tool, toolIndex) => (<li key={tool.id || `tool-${toolIndex}`}>{tool.name} {tool.imageFile && `(${tool.imageFile.name.substring(0,15)}...)`}</li>))}</ul></details>}
                        {step.supplementary_files?.length > 0 && <details style={{fontSize: '0.85rem', marginTop: '6px'}}><summary style={{color: '#2980b9', cursor: 'pointer', fontWeight:'500'}}>Files ({step.supplementary_files.length})</summary><ul style={{listStyle: 'disc', paddingLeft: '20px', marginTop: '4px'}}>{step.supplementary_files.map((f, fileIndex) => (<li key={f.id || `sup-file-${fileIndex}`}>{f.displayName}</li>))}</ul></details>}
                        {step.result_image_file_info && <p style={{fontSize: '0.85rem', color: '#7f8c8d', marginTop: '6px'}}><strong>Result Image:</strong> {step.result_image_file_info.name}</p>}
                        {step.validation_metric?.question && <p style={{fontSize: '0.85rem', color: '#27ae60', marginTop: '6px'}}><strong>Validation:</strong> {step.validation_metric.question}</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DefinedStepsList;