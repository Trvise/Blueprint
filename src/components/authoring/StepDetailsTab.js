import React from 'react';

const StepDetailsTab = ({
    currentStepName,
    setCurrentStepName,
    currentStepDescription,
    setCurrentStepDescription,
    currentStepStartTime,
    currentStepEndTime,
    currentCautionaryNotes,
    setCurrentCautionaryNotes,
    currentBestPracticeNotes,
    setBestPracticeNotes,
    currentStepValidationQuestion,
    setCurrentStepValidationQuestion,
    currentStepValidationAnswer,
    setCurrentStepValidationAnswer,
    formatTime,
    styles
}) => (
    <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Step Details</h2>
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <div>
                <label htmlFor="stepName" style={styles.inputLabel}>
                    Step Name <span style={{color: 'red'}}>*</span>
                </label>
                <input 
                    type="text" 
                    id="stepName" 
                    value={currentStepName} 
                    onChange={(e) => setCurrentStepName(e.target.value)} 
                    placeholder="e.g., Attach side panel A" 
                    style={styles.inputField}
                />
            </div>

            <div>
                <label htmlFor="stepDescription" style={styles.inputLabel}>
                    Step Description <span style={{color: 'red'}}>*</span>
                </label>
                <textarea 
                    id="stepDescription" 
                    value={currentStepDescription} 
                    onChange={(e) => setCurrentStepDescription(e.target.value)} 
                    rows="4" 
                    placeholder="Detailed instructions..." 
                    style={styles.textareaField}
                />
            </div>

            {/* Display time range as read-only information */}
            <div style={{
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
            }}>
                <label style={styles.inputLabel}>Video Time Range</label>
                <div style={{fontSize: '0.9rem', color: '#4a5568'}}>
                    Start: {currentStepStartTime !== null ? formatTime(currentStepStartTime) : 'Not set'}
                    <br />
                    End: {currentStepEndTime !== null ? formatTime(currentStepEndTime) : 'Not set'}
                </div>
            </div>

            <div>
                <label htmlFor="cautionaryNotes" style={styles.inputLabel}>Cautionary Notes</label>
                <textarea 
                    id="cautionaryNotes" 
                    value={currentCautionaryNotes} 
                    onChange={(e) => setCurrentCautionaryNotes(e.target.value)} 
                    rows="2" 
                    placeholder="e.g., Wear safety glasses." 
                    style={styles.textareaField}
                />
            </div>

            <div>
                <label htmlFor="bestPracticeNotes" style={styles.inputLabel}>Best Practice Notes</label>
                <textarea 
                    id="bestPracticeNotes" 
                    value={currentBestPracticeNotes} 
                    onChange={(e) => setBestPracticeNotes(e.target.value)} 
                    rows="2" 
                    placeholder="e.g., Pre-drill pilot holes." 
                    style={styles.textareaField}
                />
            </div>

            <div>
                <label htmlFor="validationQuestion" style={styles.inputLabel}>Validation Question</label>
                <textarea 
                    id="validationQuestion"
                    value={currentStepValidationQuestion} 
                    onChange={(e) => setCurrentStepValidationQuestion(e.target.value)} 
                    placeholder="Validation Question Prompt" 
                    rows="2" 
                    style={{...styles.textareaField, marginBottom: '8px'}}
                />
                <input 
                    type="text" 
                    value={currentStepValidationAnswer} 
                    onChange={(e) => setCurrentStepValidationAnswer(e.target.value)} 
                    placeholder="Expected Answer/Range" 
                    style={styles.inputField}
                />
            </div>
        </div>
    </div>
);

export default StepDetailsTab; 