import React from 'react';
import { COMPONENTS, TYPOGRAPHY, LAYOUT } from './shared/styles';

const SignOffTab = ({
    currentCautionaryNotes,
    setCurrentCautionaryNotes,
    currentBestPracticeNotes,
    setBestPracticeNotes,
    currentStepValidationQuestion,
    setCurrentStepValidationQuestion,
    currentStepValidationAnswer,
    setCurrentStepValidationAnswer,
    styles
}) => (
    <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Sign Off Requirements</h2>
        <div style={COMPONENTS.flexColumn}>
            <div>
                <label htmlFor="cautionaryNotes" style={styles.inputLabel}>
                    Cautionary Notes
                </label>
                <textarea 
                    id="cautionaryNotes" 
                    value={currentCautionaryNotes} 
                    onChange={(e) => setCurrentCautionaryNotes(e.target.value)} 
                    rows="3" 
                    placeholder="e.g., Wear safety glasses, ensure power is off, handle with care..." 
                    style={styles.textareaField}
                />
                <p style={TYPOGRAPHY.helpText}>
                    Important safety warnings or precautions users should know
                </p>
            </div>

            <div>
                <label htmlFor="bestPracticeNotes" style={styles.inputLabel}>
                    Best Practice Notes
                </label>
                <textarea 
                    id="bestPracticeNotes" 
                    value={currentBestPracticeNotes} 
                    onChange={(e) => setBestPracticeNotes(e.target.value)} 
                    rows="3" 
                    placeholder="e.g., Pre-drill pilot holes, use clamps for stability, work in well-lit area..." 
                    style={styles.textareaField}
                />
                <p style={TYPOGRAPHY.helpText}>
                    Tips and recommendations for better results
                </p>
            </div>

            <div>
                <label htmlFor="validationQuestion" style={styles.inputLabel}>
                    Validation Question
                </label>
                <textarea 
                    id="validationQuestion"
                    value={currentStepValidationQuestion} 
                    onChange={(e) => setCurrentStepValidationQuestion(e.target.value)} 
                    placeholder="e.g., What should the voltage reading be? How tight should the connection be?" 
                    rows="2" 
                    style={{...styles.textareaField, marginBottom: LAYOUT.inputSpacing}}
                />
                <p style={TYPOGRAPHY.helpText}>
                    Question to help users verify they completed the step correctly
                </p>
                
                <label htmlFor="validationAnswer" style={{...styles.inputLabel, marginTop: LAYOUT.inputSpacing}}>
                    Expected Answer
                </label>
                <input 
                    type="text" 
                    id="validationAnswer"
                    value={currentStepValidationAnswer} 
                    onChange={(e) => setCurrentStepValidationAnswer(e.target.value)} 
                    placeholder="e.g., 12V, Hand tight plus 1/4 turn, Firm but not forced" 
                    style={styles.inputField}
                />
                <p style={TYPOGRAPHY.helpText}>
                    Expected answer or acceptable range for validation
                </p>
            </div>
        </div>
    </div>
);

export default SignOffTab; 