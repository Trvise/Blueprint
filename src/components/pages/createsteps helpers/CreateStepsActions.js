// CreateStepsActions.js - Step management actions for CreateSteps component
import { v4 as uuidv4 } from 'uuid';
import { uploadFileToFirebase, getApiUrl } from './CreateStepsUtils';

export const createStepActions = (state) => {
    const {
        setCurrentStepIndex,
        setCurrentStepName,
        setCurrentStepDescription,
        setCurrentStepStartTime,
        setCurrentStepEndTime,
        setCurrentCautionaryNotes,
        setCurrentBestPracticeNotes,
        setCurrentStepAnnotations,
        setCurrentStepTools,
        setCurrentStepMaterials,
        setCurrentStepSupFiles,
        setCurrentStepSupFileName,
        setCurrentStepValidationQuestion,
        setCurrentStepValidationAnswer,
        setCurrentStepResultImageFile,
        setFrameForAnnotation,
        setCurrentAnnotationTool,
        setProjectSteps,
        setIsStepLoading,
        setErrorMessage,
        setSuccessMessage,
        setIsLoading,
        projectSteps,
        currentStepIndex,
        activeVideoIndex,
        uploadedVideos,
        projectId,
        projectBuyList,
        currentUser,
        navigate
    } = state;

    // Function to load step data for editing
    const loadStepForEditing = (step, index) => {
        setCurrentStepIndex(index);
        setCurrentStepName(step.name || '');
        setCurrentStepDescription(step.description || '');
        setCurrentStepStartTime(step.video_start_time_ms ? step.video_start_time_ms / 1000 : null);
        setCurrentStepEndTime(step.video_end_time_ms ? step.video_end_time_ms / 1000 : null);
        setCurrentCautionaryNotes(step.cautionary_notes || '');
        setCurrentBestPracticeNotes(step.best_practice_notes || '');
        const annotations = step.annotations || [];
        console.log('Loading annotations for editing:', annotations);
        setCurrentStepAnnotations(annotations);
        
        setCurrentStepTools(step.tools || []);
        setCurrentStepMaterials(step.materials || []);
        setCurrentStepSupFiles(step.supplementary_files || []);
        setCurrentStepValidationQuestion(step.validation_metric?.question || '');
        setCurrentStepValidationAnswer(step.validation_metric?.expected_answer || '');
        setCurrentStepResultImageFile(step.result_image_file_info ? new File([], step.result_image_file_info.name) : null);
        
        // Set active video if different
        if (step.associated_video_index !== undefined && step.associated_video_index !== activeVideoIndex) {
            // handleVideoSelection(step.associated_video_index); // This would need to be passed in
        }
    };

    // Function to clear current step form
    const clearCurrentStepForm = () => {
        setCurrentStepIndex(-1);
        setCurrentStepName('');
        setCurrentStepDescription('');
        setCurrentStepStartTime(null);
        setCurrentStepEndTime(null);
        setCurrentCautionaryNotes('');
        setCurrentBestPracticeNotes('');
        setCurrentStepAnnotations([]);
        setCurrentStepTools([]);
        setCurrentStepMaterials([]);
        setCurrentStepSupFiles([]);
        setCurrentStepSupFileName('');
        setCurrentStepValidationQuestion('');
        setCurrentStepValidationAnswer('');
        setCurrentStepResultImageFile(null);
        // Don't clear annotation frame and tool state - preserve for new steps
        // setFrameForAnnotation(null);
        // setCurrentAnnotationTool({});
    };

    // Function to delete a step
    const deleteStep = (index) => {
        setProjectSteps(prev => prev.filter((_, i) => i !== index));
        if (currentStepIndex === index) {
            clearCurrentStepForm();
        } else if (currentStepIndex > index) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    // Function to add new step
    const addNewStep = () => {
        clearCurrentStepForm();
    };

    // Function to add new step
    const handleAddStep = async (stepData) => {
        if (!stepData.currentStepName.trim()) {
            setErrorMessage("Step name is required.");
            return;
        }
        if (!stepData.currentStepDescription.trim()) {
            setErrorMessage("Step description is required.");
            return;
        }
        if (stepData.currentStepStartTime === null || stepData.currentStepEndTime === null) {
            setErrorMessage("Please set both start and end times for the step.");
            return;
        }

        setIsStepLoading(true);
        setErrorMessage('');

        try {
            const {
                currentStepName,
                currentStepDescription,
                currentStepStartTime,
                currentStepEndTime,
                currentCautionaryNotes,
                currentBestPracticeNotes,
                currentStepAnnotations,
                currentStepTools,
                currentStepMaterials,
                currentStepSupFiles,
                currentStepValidationQuestion,
                currentStepValidationAnswer,
                currentStepResultImageFile
            } = stepData;

            const newStepData = {
                id: currentStepIndex >= 0 && currentStepIndex < projectSteps.length 
                    ? projectSteps[currentStepIndex].id 
                    : `local_step_${uuidv4()}`,
                project_id: projectId, 
                name: currentStepName,
                description: currentStepDescription, 
                video_start_time_ms: Math.round(currentStepStartTime * 1000),
                video_end_time_ms: Math.round(currentStepEndTime * 1000),
                cautionary_notes: currentCautionaryNotes, 
                best_practice_notes: currentBestPracticeNotes,
                associated_video_index: activeVideoIndex, 
                associated_video_path: uploadedVideos[activeVideoIndex]?.path, 
                step_order: currentStepIndex >= 0 ? currentStepIndex : projectSteps.length, 
                annotations: [...currentStepAnnotations], 
                tools: currentStepTools.map(tool => ({ 
                    name: tool.name,
                    specification: tool.specification,
                    image_file_name: tool.imageFile ? tool.imageFile.name : null,
                })), 
                materials: currentStepMaterials.map(mat => ({ 
                    name: mat.name,
                    specification: mat.specification,
                    image_file_name: mat.imageFile ? mat.imageFile.name : null,
                })),
                supplementary_files: currentStepSupFiles.map(f => ({ 
                    displayName: f.displayName, 
                    fileName: f.fileObject.name, 
                    fileType: f.fileObject.type,
                })), 
                validation_metric: { 
                    question: currentStepValidationQuestion,
                    expected_answer: currentStepValidationAnswer 
                },
                result_image_file_info: currentStepResultImageFile 
                    ? { name: currentStepResultImageFile.name, type: currentStepResultImageFile.type, size: currentStepResultImageFile.size } 
                    : null,
                
                // Store file objects for later upload
                _toolImageFiles: currentStepTools.filter(tool => tool.imageFile).map(tool => tool.imageFile),
                _materialImageFiles: currentStepMaterials.filter(mat => mat.imageFile).map(mat => mat.imageFile),
                _supFileObjects: currentStepSupFiles.map(f => f.fileObject),
                _resultImageFile: currentStepResultImageFile
            };

            if (currentStepIndex >= 0 && currentStepIndex < projectSteps.length) {
                // Update existing step
                setProjectSteps(prev => prev.map((step, index) => 
                    index === currentStepIndex ? newStepData : step
                ));
                setSuccessMessage(`Step "${currentStepName}" updated successfully!`);
            } else {
                // Add new step
                setProjectSteps(prev => [...prev, newStepData]);
                setSuccessMessage(`Step "${currentStepName}" added successfully!`);
            }

        } catch (error) {
            console.error('Error adding step:', error);
            setErrorMessage(`Error adding step: ${error.message}`);
        } finally {
            setIsStepLoading(false);
        }
    };

    const handleFinishProject = async (projectName, capturedAnnotationFrames) => {
        if (!projectSteps.length) {
            alert("Please add at least one step before finishing the project.");
            return;
        }
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('Finalizing project... Uploading files...');

        try {
            // --- 1. UPLOAD THUMBNAIL IMAGE ---
            let thumbnailFileToUpload = null;
            let uploadedThumbnailInfo = null;
            
            if (capturedAnnotationFrames && Object.keys(capturedAnnotationFrames).length > 0) {
                const firstFrameTimestamp = Object.keys(capturedAnnotationFrames)[0];
                thumbnailFileToUpload = capturedAnnotationFrames[firstFrameTimestamp];
                
                if (thumbnailFileToUpload) {
                    setSuccessMessage('Uploading project thumbnail...');
                    uploadedThumbnailInfo = await uploadFileToFirebase(
                        thumbnailFileToUpload, 
                        `users/${currentUser.uid}/${projectId}/thumbnails`,
                        currentUser
                    );
                }
            }

            // --- 2. LOOP THROUGH STEPS TO PROCESS AND UPLOAD ALL OTHER FILES ---
            const processedStepsPayload = [];
            for (const step of projectSteps) {
                
                // --- A. Process Annotations and Upload their Frames ---
                const processedAnnotations = [];
                
                // Only process annotations if they exist and are valid
                if (step.annotations && Array.isArray(step.annotations)) {
                    console.log(`Processing ${step.annotations.length} annotations for step "${step.name}"`);
                    for (const ann of step.annotations) {
                        console.log('Processing annotation:', ann);
                        // Handle both database and local annotation structures
                        const frameTimestamp = ann.frame_timestamp_ms || ann.data?.frame_timestamp_ms;
                        if (!frameTimestamp) {
                            console.warn("Skipping annotation without frame_timestamp_ms:", ann);
                            continue;
                        }
                        
                        let uploadedFrameInfo = null;
                        const frameFileToUpload = capturedAnnotationFrames[frameTimestamp];

                        // If a captured frame exists for this annotation's timestamp, upload it.
                        // We check if it's the thumbnail to avoid re-uploading the same image.
                        if (frameFileToUpload && frameFileToUpload !== thumbnailFileToUpload) {
                            const annotationText = ann.component_name || ann.data?.text || 'Untitled annotation';
                            setSuccessMessage(`Uploading frame for annotation: ${annotationText}...`);
                            uploadedFrameInfo = await uploadFileToFirebase(
                                frameFileToUpload, 
                                `users/${currentUser.uid}/${projectId}/annotation_frames`,
                                currentUser
                            );
                        } else if (frameFileToUpload === thumbnailFileToUpload) {
                            // If this frame IS the thumbnail, just reuse its upload info.
                            uploadedFrameInfo = uploadedThumbnailInfo;
                        }

                        // Add the uploaded frame's info to the annotation payload
                        // Handle both database and local annotation structures
                        const annotationType = ann.annotation_type || ann.geometry?.type || 'rectangle';
                        const annotationText = ann.component_name || ann.data?.text || 'Untitled annotation';
                        
                        // Handle geometry data from both structures
                        let geometryData = {};
                        if (ann.data && typeof ann.data === 'object') {
                            // Check if coordinates are in percentage format (0-100) and normalize to 0-1 for backend
                            if (ann.data.x !== undefined) {
                                // Local annotation format - coordinates in percentage (0-100)
                                geometryData = {
                                    x: ann.data.x / 100,  // Convert from percentage to normalized (0-1)
                                    y: ann.data.y / 100,
                                    width: ann.data.width / 100,
                                    height: ann.data.height / 100,
                                    type: ann.data.type || 'rectangle'
                                };
                            } else if (ann.data.normalized_geometry) {
                                // Already normalized format (0-1)
                                geometryData = ann.data.normalized_geometry;
                            } else {
                                // Fallback for other database structures
                                geometryData = {
                                    x: (ann.data.x || 0) / 100,
                                    y: (ann.data.y || 0) / 100,
                                    width: (ann.data.width || 0) / 100,
                                    height: (ann.data.height || 0) / 100,
                                    type: ann.data.type || 'rectangle'
                                };
                            }
                        }
                        
                        const processedAnnotation = {
                            frame_timestamp_ms: frameTimestamp,
                            annotation_type: annotationType,
                            component_name: annotationText,
                            data: geometryData,
                            // Pass the path for the backend to create the File record
                            frame_image_path: uploadedFrameInfo ? uploadedFrameInfo.path : null,
                        };
                        
                        console.log('Processed annotation:', processedAnnotation);
                        processedAnnotations.push(processedAnnotation);
                    }
                }
                
                // --- B. Initialize the Step Payload for the API ---
                console.log("Step data:", step);
                console.log("Uploaded videos:", uploadedVideos);
                console.log("Step associated_video_index:", step.associated_video_index);
                console.log("Video at index:", uploadedVideos[step.associated_video_index]);
                
                // Determine video path with multiple fallbacks
                let videoPath = step.associated_video_path;
                if (!videoPath && step.associated_video_index >= 0) {
                    const video = uploadedVideos[step.associated_video_index];
                    videoPath = video?.path || video?.url || video?.firebase_path;
                }
                
                if (!videoPath && uploadedVideos.length > 0) {
                    // Fallback to first video if index is invalid
                    const firstVideo = uploadedVideos[0];
                    videoPath = firstVideo?.path || firstVideo?.url || firstVideo?.firebase_path;
                }
                console.log("Final video path:", videoPath);
                
                const stepPayload = {
                    name: step.name,
                    description: step.description,
                    video_start_time_ms: step.video_start_time_ms,
                    video_end_time_ms: step.video_end_time_ms,
                    cautionary_notes: step.cautionary_notes,
                    best_practice_notes: step.best_practice_notes,
                    associated_video_path: videoPath,
                    step_order: step.step_order,
                    annotations: processedAnnotations, // Use the newly processed annotations
                    tools: [],
                    materials: [],
                    supplementary_files: [],
                    validation_metric: step.validation_metric && step.validation_metric.question ? {
                        question: step.validation_metric.question,
                        expected_answer: step.validation_metric.expected_answer
                    } : null,
                    result_image_path: null,
                };

                // --- C. Upload and Process Tools ---
                for (const toolFile of step._toolImageFiles || []) {
                    try {
                        const uploaded = await uploadFileToFirebase(
                            toolFile, 
                            `users/${currentUser.uid}/${projectId}/tools`,
                            currentUser
                        );
                        if (uploaded) {
                            const toolData = step.tools.find(t => t.image_file_name === toolFile.name);
                            stepPayload.tools.push({
                                name: toolData?.name || 'Unknown Tool',
                                specification: toolData?.specification || '',
                                image_url: uploaded.url,
                                image_path: uploaded.path,
                            });
                        }
                    } catch (error) {
                        console.error(`Error uploading tool image ${toolFile.name}:`, error);
                    }
                }

                // Add tools without images
                for (const tool of step.tools.filter(t => !t.image_file_name)) {
                    stepPayload.tools.push({ 
                        name: tool.name, 
                        specification: tool.specification, 
                        image_path: null 
                    });
                }

                // --- D. Upload and Process Materials ---
                for (const materialFile of step._materialImageFiles || []) {
                    try {
                        const uploaded = await uploadFileToFirebase(
                            materialFile, 
                            `users/${currentUser.uid}/${projectId}/materials`,
                            currentUser
                        );
                        if (uploaded) {
                            const materialData = step.materials.find(m => m.image_file_name === materialFile.name);
                            stepPayload.materials.push({
                                name: materialData?.name || 'Unknown Material',
                                specification: materialData?.specification || '',
                                quantity: materialData?.quantity || 1,
                                image_url: uploaded.url,
                                image_path: uploaded.path,
                            });
                        }
                    } catch (error) {
                        console.error(`Error uploading material image ${materialFile.name}:`, error);
                    }
                }

                // Add materials without images
                for (const material of step.materials.filter(m => !m.image_file_name)) {
                    stepPayload.materials.push({ 
                        name: material.name, 
                        specification: material.specification, 
                        quantity: material.quantity || 1,
                        image_path: null 
                    });
                }

                // --- E. Upload and Process Supplementary Files ---
                for (const supFile of step._supFileObjects || []) {
                    try {
                        const uploaded = await uploadFileToFirebase(
                            supFile, 
                            `users/${currentUser.uid}/${projectId}/supplementary_files`,
                            currentUser
                        );
                        if (uploaded) {
                            const supFileData = step.supplementary_files.find(sf => sf.fileName === supFile.name);
                            stepPayload.supplementary_files.push({
                                display_name: supFileData?.displayName || supFile.name,
                                file_url: uploaded.url,
                                file_path: uploaded.path,
                            });
                        }
                    } catch (error) {
                        console.error(`Error uploading supplementary file ${supFile.name}:`, error);
                    }
                }

                // --- F. Upload Result Image ---
                if (step._resultImageFile) {
                    try {
                        const uploaded = await uploadFileToFirebase(
                            step._resultImageFile, 
                            `users/${currentUser.uid}/${projectId}/result_images`,
                            currentUser
                        );
                        if (uploaded) {
                            stepPayload.result_image_path = uploaded.path;
                        }
                    } catch (error) {
                        console.error(`Error uploading result image:`, error);
                    }
                }

                processedStepsPayload.push(stepPayload);
            }

            // --- 3. VALIDATE AND SEND FINAL PAYLOAD TO THE API ---
            const finalPayload = {
                project_name: projectName,
                project_id: projectId,
                user_id: currentUser.uid,
                steps: processedStepsPayload,
                buy_list: projectBuyList || [],
                thumbnail_image_path: uploadedThumbnailInfo ? uploadedThumbnailInfo.path : null,
            };

            // Validate payload before sending
            console.log('Final payload being sent to API:', finalPayload);
            console.log('Annotations in final payload:');
            finalPayload.steps.forEach((step, index) => {
                console.log(`Step ${index + 1} (${step.name}):`, step.annotations);
                
                // Validate required fields for each step
                if (!step.name || !step.description) {
                    throw new Error(`Step ${index + 1} is missing required name or description`);
                }
                if (!step.associated_video_path) {
                    console.warn(`Step ${index + 1} is missing associated_video_path`);
                }
                
                // Validate annotations
                step.annotations.forEach((ann, annIndex) => {
                    if (!ann.frame_timestamp_ms) {
                        console.warn(`Annotation ${annIndex + 1} in step ${index + 1} is missing frame_timestamp_ms`);
                    }
                    if (!ann.component_name) {
                        console.warn(`Annotation ${annIndex + 1} in step ${index + 1} is missing component_name`);
                    }
                });
            });

            const response = await fetch(`${getApiUrl()}/upload_steps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload),
            });

            if (!response.ok) {
                console.error(`HTTP ${response.status}: ${response.statusText}`);
                
                let errorDetails = null;
                let errorText = '';
                
                try {
                    errorText = await response.text();
                    console.error('Raw error response:', errorText);
                    
                    if (errorText) {
                        errorDetails = JSON.parse(errorText);
                        console.error('Parsed error details:', errorDetails);
                    }
                } catch (parseError) {
                    console.error('Could not parse error response:', parseError);
                }
                
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                
                if (errorDetails) {
                    if (errorDetails.detail) {
                        if (Array.isArray(errorDetails.detail)) {
                            // FastAPI validation errors format
                            const validationErrors = errorDetails.detail.map(err => 
                                `${err.loc ? err.loc.join('.') : 'unknown'}: ${err.msg}`
                            ).join(', ');
                            errorMessage = `Validation errors: ${validationErrors}`;
                        } else if (typeof errorDetails.detail === 'string') {
                            errorMessage = errorDetails.detail;
                        } else {
                            errorMessage = JSON.stringify(errorDetails.detail);
                        }
                    } else if (errorDetails.message) {
                        errorMessage = errorDetails.message;
                    } else {
                        errorMessage = JSON.stringify(errorDetails);
                    }
                } else if (errorText) {
                    errorMessage = errorText;
                }
                
                const error = new Error(errorMessage);
                error.status = response.status;
                error.details = errorDetails;
                throw error;
            }

            const result = await response.json();
            console.log('API Response:', result);
            
            setSuccessMessage('Project finalized successfully! Redirecting to projects...');
            setTimeout(() => navigate('/my-projects'), 2000);

        } catch (error) {
            console.error('Error finalizing project:', error);
            console.error('Error type:', typeof error);
            console.error('Error keys:', Object.keys(error));
            
            let errorMessage = 'Unknown error occurred';
            
            if (error && typeof error === 'object') {
                if (error.message) {
                    errorMessage = error.message;
                } else if (error.detail) {
                    errorMessage = error.detail;
                } else if (error.toString && typeof error.toString === 'function') {
                    errorMessage = error.toString();
                } else {
                    // Try to extract meaningful information from the error object
                    errorMessage = JSON.stringify(error, null, 2);
                }
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            
            setErrorMessage(`Error finalizing project: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        loadStepForEditing,
        clearCurrentStepForm,
        deleteStep,
        addNewStep,
        handleAddStep,
        handleFinishProject
    };
}; 