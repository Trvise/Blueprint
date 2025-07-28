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
        setCurrentStepResultImage,

        setProjectSteps,
        setIsStepLoading,
        setErrorMessage,
        setSuccessMessage,
        setIsLoading,
        projectSteps,
        currentStepIndex,
        currentStepStartTime,
        currentStepEndTime,
        activeVideoIndex,
        uploadedVideos,
        projectId,
        projectBuyList,
        currentUser,
        navigate,
        existingThumbnailUrl
    } = state;

    // Function to load step data for editing
    const loadStepForEditing = (step, index) => {
        console.log('Loading step for editing:', step);
        console.log('Video times - start_ms:', step.video_start_time_ms, 'end_ms:', step.video_end_time_ms);
        
        setCurrentStepIndex(index);
        setCurrentStepName(step.name || '');
        setCurrentStepDescription(step.description || '');
        
        // Convert milliseconds to seconds with better validation
        const startTimeMs = step.video_start_time_ms;
        const endTimeMs = step.video_end_time_ms;
        
        let startTimeSeconds = null;
        let endTimeSeconds = null;
        
        if (startTimeMs !== null && startTimeMs !== undefined && !isNaN(startTimeMs) && startTimeMs >= 0) {
            startTimeSeconds = startTimeMs / 1000;
        }
        
        if (endTimeMs !== null && endTimeMs !== undefined && !isNaN(endTimeMs) && endTimeMs >= 0) {
            endTimeSeconds = endTimeMs / 1000;
        }
        
        console.log('Converted times - start_sec:', startTimeSeconds, 'end_sec:', endTimeSeconds);
        
        setCurrentStepStartTime(startTimeSeconds);
        setCurrentStepEndTime(endTimeSeconds);
        setCurrentCautionaryNotes(step.cautionary_notes || '');
        setCurrentBestPracticeNotes(step.best_practice_notes || '');
        // Transform existing annotations to library format expected by react-image-annotation
        console.log('Original step annotations:', step.annotations);
        const annotations = (step.annotations || []).map((ann) => {
            console.log('Processing annotation:', ann);
            
            // If annotation already has geometry (locally created), pass through
            if (ann.geometry && ann.data) {
                console.log('Annotation has geometry, passing through');
                return ann;
            }
            
            // Handle database annotations - they come with different structure
            // Database format: { frame_timestamp_ms, annotation_type, component_name, data: {x, y, width, height} }
            if (ann.data && typeof ann.data === 'object') {
                // Check if data has normalized coordinates (0-1 scale from database)
                const coords = ann.data;
                if (coords.x !== undefined && coords.y !== undefined) {
                    const transformed = {
                        geometry: {
                            type: ann.annotation_type || 'rectangle',
                            x: coords.x * 100,  // Convert normalized (0-1) to percentage (0-100)
                            y: coords.y * 100,
                            width: coords.width * 100,
                            height: coords.height * 100,
                        },
                        data: {
                            text: ann.component_name || 'Untitled annotation',
                            id: ann.annotation_id || Math.random().toString(),
                            frame_timestamp_ms: ann.frame_timestamp_ms,
                        }
                    };
                    console.log('Transformed DB annotation:', transformed);
                    return transformed;
                }
            }
            
            // Fallback - return as is
            console.log('Returning annotation as-is');
            return ann;
        });
        console.log('Final transformed annotations:', annotations);
        setCurrentStepAnnotations(annotations);
        
        // Ensure tools / materials keep existing image paths if any and restore as proper objects
        const mappedTools = (step.tools || []).map(t => ({
            id: t.tool_id || t.id || `tool_${uuidv4()}`,
            name: t.name,
            specification: t.specification || '',
            quantity: t.quantity || 1,
            imageFile: null, // Will be restored if has image_url
            image_file_name: t.image_file_name || null,
            image_path: t.image_path || t.image_file?.file_key || null,
            image_url: t.image_url || t.image_file?.file_url || null, // Extract from nested structure
            hasExistingImage: !!(t.image_url || t.image_file?.file_url || t.image_path || t.image_file?.file_key), // Flag to show existing image
        }));

        const mappedMaterials = (step.materials || []).map(m => ({
            id: m.item_id || m.id || `material_${uuidv4()}`,
            name: m.name,
            specification: m.specification || '',
            quantity: m.quantity || 1,
            imageFile: null, // Will be restored if has image_url
            image_file_name: m.image_file_name || null,
            image_path: m.image_path || m.image_file?.file_key || null,
            image_url: m.image_url || m.image_file?.file_url || null, // Extract from nested structure
            hasExistingImage: !!(m.image_url || m.image_file?.file_url || m.image_path || m.image_file?.file_key), // Flag to show existing image
        }));

        // Map supplementary files to proper format
        const mappedSupFiles = (step.supplementary_files || []).map(f => ({
            id: f.file_id || f.id || `supfile_${uuidv4()}`,
            displayName: f.display_name || f.displayName || f.file?.original_filename || f.original_filename,
            fileObject: null, // Can't restore file object, but we have the info
            hasExistingFile: !!(f.file_url || f.file?.file_url || f.file_path || f.file?.file_key),
            file_url: f.file_url || f.file?.file_url || null,
            file_path: f.file_path || f.file?.file_key || null,
            original_filename: f.original_filename || f.file?.original_filename || null,
            mime_type: f.mime_type || f.file?.mime_type || null,
            file_size_bytes: f.file_size_bytes || f.file?.file_size_bytes || null,
        }));

        setCurrentStepTools(mappedTools);
        setCurrentStepMaterials(mappedMaterials);
        setCurrentStepSupFiles(mappedSupFiles);
        setCurrentStepValidationQuestion(step.validation_metric?.validation_data?.question || step.validation_metric?.question || '');
        setCurrentStepValidationAnswer(step.validation_metric?.validation_data?.expected_answer || step.validation_metric?.expected_answer || '');
        
        // Debug logging to help track validation data
        console.log('Loading step validation data:', {
            stepId: step.id,
            validationMetric: step.validation_metric,
            validationData: step.validation_metric?.validation_data,
            question: step.validation_metric?.validation_data?.question || step.validation_metric?.question || '',
            answer: step.validation_metric?.validation_data?.expected_answer || step.validation_metric?.expected_answer || ''
        });
        
        // Handle result image - show existing if available
        const resultImageUrl = step.result_image_url || step.result_image_file?.file_url;
        const resultImagePath = step.result_image_path || step.result_image_file?.file_key;
        
        if (resultImageUrl || resultImagePath) {
            // We can't restore the actual File object, but we can show the existing image
            setCurrentStepResultImageFile({
                name: step.result_image_file_info?.name || step.result_image_file?.original_filename || 'result-image.jpg',
                hasExistingImage: true,
                image_url: resultImageUrl,
                image_path: resultImagePath
            });
            setCurrentStepResultImage(resultImageUrl);
        } else {
            setCurrentStepResultImageFile(null);
            setCurrentStepResultImage(null);
        }
        
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
        setCurrentStepResultImage(null);
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
        if (stepData.currentStepStartTime === null || stepData.currentStepStartTime === undefined || 
            stepData.currentStepEndTime === null || stepData.currentStepEndTime === undefined) {
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
                id: tool.id,
                name: tool.name,
                specification: tool.specification,
                quantity: tool.quantity || 1,
                image_file_name: tool.imageFile ? tool.imageFile.name : tool.image_file_name,
                image_url: tool.imageFile ? null : tool.image_url, // Keep existing URL if no new file
                image_path: tool.imageFile ? null : tool.image_path, // Keep existing path if no new file
                hasExistingImage: tool.hasExistingImage && !tool.imageFile, // Flag for existing image
            })), 
            materials: currentStepMaterials.map(mat => ({ 
                id: mat.id,
                name: mat.name,
                specification: mat.specification,
                quantity: mat.quantity || 1,
                image_file_name: mat.imageFile ? mat.imageFile.name : mat.image_file_name,
                image_url: mat.imageFile ? null : mat.image_url, // Keep existing URL if no new file
                image_path: mat.imageFile ? null : mat.image_path, // Keep existing path if no new file
                hasExistingImage: mat.hasExistingImage && !mat.imageFile, // Flag for existing image
            })),
            supplementary_files: currentStepSupFiles.map(f => ({ 
                id: f.id,
                displayName: f.displayName, 
                fileName: f.fileObject ? f.fileObject.name : f.original_filename,
                fileType: f.fileObject ? f.fileObject.type : f.mime_type,
                // Keep existing file info if no new file uploaded
                file_url: f.fileObject ? null : f.file_url,
                file_path: f.fileObject ? null : f.file_path,
                original_filename: f.fileObject ? f.fileObject.name : f.original_filename,
                mime_type: f.fileObject ? f.fileObject.type : f.mime_type,
                file_size_bytes: f.fileObject ? f.fileObject.size : f.file_size_bytes,
                hasExistingFile: f.hasExistingFile && !f.fileObject,
            })), 
            validation_metric: { 
                question: currentStepValidationQuestion || '',
                expected_answer: currentStepValidationAnswer || ''
            },
            result_image_file_info: currentStepResultImageFile && (currentStepResultImageFile instanceof File || currentStepResultImageFile.hasExistingImage)
                ? { 
                    name: currentStepResultImageFile.name, 
                    type: currentStepResultImageFile.type || 'image/jpeg', 
                    size: currentStepResultImageFile.size || 0,
                    hasExistingImage: currentStepResultImageFile.hasExistingImage,
                    image_url: currentStepResultImageFile.image_url,
                    image_path: currentStepResultImageFile.image_path
                } 
                : null,
                
                // Store file objects for later upload (only new files)
                _toolImageFiles: currentStepTools.filter(tool => tool.imageFile).map(tool => tool.imageFile),
                _materialImageFiles: currentStepMaterials.filter(mat => mat.imageFile).map(mat => mat.imageFile),
                _supFileObjects: currentStepSupFiles.filter(f => f.fileObject).map(f => f.fileObject),
                _resultImageFile: currentStepResultImageFile instanceof File ? currentStepResultImageFile : null,
                
                // Keep existing URLs for items without new files
                result_image_url: currentStepResultImageFile && !(currentStepResultImageFile instanceof File) ? currentStepResultImageFile.image_url : null,
                result_image_path: currentStepResultImageFile && !(currentStepResultImageFile instanceof File) ? currentStepResultImageFile.image_path : null
        };

        // Debug logging for validation data
        console.log('Saving step validation data:', {
            stepName: currentStepName,
            validationMetric: {
                question: currentStepValidationQuestion || '',
                expected_answer: currentStepValidationAnswer || ''
            },
            validationData: {
                question: currentStepValidationQuestion || '',
                expected_answer: currentStepValidationAnswer || ''
            }
        });

        if (currentStepIndex >= 0 && currentStepIndex < projectSteps.length) {
            // Update existing step
            setProjectSteps(prev => {
                const updatedSteps = prev.map((step, index) => 
                    index === currentStepIndex ? newStepData : step
                );
                console.log('Updated steps array:', updatedSteps.map(s => ({
                    name: s.name,
                    validationMetric: s.validation_metric
                })));
                return updatedSteps;
            });
            setSuccessMessage(`Step "${currentStepName}" updated successfully!`);
            // Keep the step in edit mode after update
        } else {
            // Add new step
            setProjectSteps(prev => {
                const newSteps = [...prev, newStepData];
                console.log('Added new step to array:', newSteps.map(s => ({
                    name: s.name,
                    validationMetric: s.validation_metric
                })));
                return newSteps;
            });
            setSuccessMessage(`Step "${currentStepName}" added successfully!`);
            // Clear form after adding new step, but preserve the step data in the array
            clearCurrentStepForm();
        }

        } catch (error) {
            console.error('Error adding step:', error);
            setErrorMessage(`Error adding step: ${error.message}`);
        } finally {
        setIsStepLoading(false);
        }
    };

    // Function to regenerate a step with AI
    const handleRegenerateStep = async (stepIndex) => {
        if (stepIndex < 0 || stepIndex >= projectSteps.length) {
            setErrorMessage("Invalid step index for regeneration.");
            return;
        }

        const currentStep = projectSteps[stepIndex];
        
        console.log('Regenerating step:', currentStep);
        console.log('Current step index:', currentStepIndex);
        console.log('Current form timestamps:', { currentStepStartTime, currentStepEndTime });
        console.log('Uploaded videos:', uploadedVideos);
        
        // Check if this is an AI-generated step or has valid timestamps
        const isAiGenerated = currentStep.is_ai_generated;
        
        // Check for timestamps in various formats (milliseconds, seconds, or current form values)
        const hasValidTimestamps = (
            (currentStep.video_start_time_ms && currentStep.video_end_time_ms) ||
            (currentStep.video_start_time && currentStep.video_end_time) ||
            (currentStep.start_time && currentStep.end_time)
        );
        
        // Also check if we're currently editing a step with timestamps set
        const currentStepHasTimestamps = currentStepIndex === stepIndex && 
            (currentStepStartTime !== null && currentStepEndTime !== null);
        
        if (!isAiGenerated && !hasValidTimestamps && !currentStepHasTimestamps) {
            setErrorMessage("Step must be AI-generated or have valid start/end timestamps to regenerate. Please set start and end times for this step first.");
            return;
        }

        setIsStepLoading(true);
        setErrorMessage('');
        setSuccessMessage('Regenerating step with AI...');

        try {
            // Get the video data for this step
            const videoIndex = currentStep.associated_video_index || currentStep.video_index || 0;
            const videoData = uploadedVideos[videoIndex];
            
            if (!videoData) {
                throw new Error("Video file not found for regeneration.");
            }
            
            console.log('Video data:', videoData);
            
            // Get video file - either from preserved file or download from Firebase
            let videoFile;
            if (videoData.file && videoData.file instanceof File) {
                // Use preserved file if available
                videoFile = videoData.file;
                console.log('Using preserved file');
            } else {
                // Download from Firebase URL
                console.log('Downloading video from Firebase:', videoData.url);
                setSuccessMessage('Downloading video from Firebase...');
                
                try {
                    const response = await fetch(videoData.url);
                    if (!response.ok) {
                        throw new Error(`Failed to download video: ${response.status}`);
                    }
                    
                    const videoBlob = await response.blob();
                    videoFile = new File([videoBlob], videoData.name || 'video.mp4', { 
                        type: 'video/mp4' 
                    });
                    console.log('Successfully downloaded video from Firebase');
                } catch (downloadError) {
                    console.error('Error downloading video:', downloadError);
                    throw new Error(`Failed to download video from Firebase: ${downloadError.message}`);
                }
            }
            
            console.log('Final videoFile:', videoFile);
            console.log('VideoFile type:', typeof videoFile);
            console.log('VideoFile instanceof File:', videoFile instanceof File);

            // Import the Google Cloud API service
            const { googleCloudApi } = await import('../../../services/googleCloudApi');

            let analysisResult;

            if (isAiGenerated) {
                // For AI-generated steps: use full video analysis
                setSuccessMessage('Extracting audio from video...');
                const audioResult = await googleCloudApi.extractAudio(videoFile);

                setSuccessMessage('Transcribing audio...');
                const transcriptionResult = await googleCloudApi.transcribeAudio(audioResult.audio_url);

                setSuccessMessage('Analyzing transcript for step regeneration...');
                analysisResult = await googleCloudApi.analyzeTranscript(
                    transcriptionResult.transcript,
                    {
                        filename: videoFile.name,
                        duration: videoFile.duration || 0,
                        size: videoFile.size,
                    },
                    {
                        project_name: 'Step Regeneration',
                        project_description: 'Regenerating individual step with AI',
                        tags: ['Regeneration']
                    }
                );
            } else {
                // For non-AI steps: use existing transcript and analyze specific time range
                setSuccessMessage('Reading existing transcript...');
                
                // Get the step's time range in seconds - handle various timestamp formats
                let startTimeSeconds, endTimeSeconds;
                
                if (currentStep.video_start_time_ms && currentStep.video_end_time_ms) {
                    // Timestamps stored in milliseconds
                    startTimeSeconds = currentStep.video_start_time_ms / 1000;
                    endTimeSeconds = currentStep.video_end_time_ms / 1000;
                } else if (currentStep.video_start_time && currentStep.video_end_time) {
                    // Timestamps stored in seconds
                    startTimeSeconds = currentStep.video_start_time;
                    endTimeSeconds = currentStep.video_end_time;
                } else if (currentStepIndex === stepIndex && currentStepStartTime !== null && currentStepEndTime !== null) {
                    // Using current form values
                    startTimeSeconds = currentStepStartTime;
                    endTimeSeconds = currentStepEndTime;
                } else {
                    throw new Error("Could not determine step time range for regeneration.");
                }
                
                // Extract audio and transcribe
                const audioResult = await googleCloudApi.extractAudio(videoFile);
                const transcriptionResult = await googleCloudApi.transcribeAudio(audioResult.audio_url);
                
                // Check if transcript is too short (less than 10 characters)
                if (transcriptionResult.transcript.length < 10) {
                    setSuccessMessage('Transcript too short, analyzing full video for context...');
                    
                    // For short transcripts, analyze the full video (up to 10 minutes) for context
                    const maxAnalysisDuration = Math.min(600, videoFile.duration || 600); // 10 minutes max
                    
                    analysisResult = await googleCloudApi.analyzeTranscript(
                        transcriptionResult.transcript,
                        {
                            filename: videoFile.name,
                            duration: videoFile.duration || 0,
                            size: videoFile.size,
                            step_start_time: startTimeSeconds,
                            step_end_time: endTimeSeconds,
                            full_video_context: true,
                            max_context_duration: maxAnalysisDuration,
                        },
                        {
                            project_name: 'Step Regeneration',
                            project_description: `Regenerating step from ${startTimeSeconds}s to ${endTimeSeconds}s with full video context`,
                            tags: ['Regeneration', 'TimeRange', 'FullContext']
                        }
                    );
                } else {
                    // Use normal analysis for longer transcripts
                    setSuccessMessage('Analyzing transcript for specific step time range...');
                    analysisResult = await googleCloudApi.analyzeTranscript(
                        transcriptionResult.transcript,
                        {
                            filename: videoFile.name,
                            duration: videoFile.duration || 0,
                            size: videoFile.size,
                            step_start_time: startTimeSeconds,
                            step_end_time: endTimeSeconds,
                        },
                        {
                            project_name: 'Step Regeneration',
                            project_description: `Regenerating step from ${startTimeSeconds}s to ${endTimeSeconds}s`,
                            tags: ['Regeneration', 'TimeRange']
                        }
                    );
                }
            }

            // Check for no-voice response from backend
            if (analysisResult.error === 'no_voice') {
                setErrorMessage(analysisResult.message || "No voice detected in this video segment. The step content will remain unchanged.");
                return;
            }
            
            // Update the specific step with new AI-generated data
            if (analysisResult.steps && analysisResult.steps.length > 0) {
                // Use the first step from the analysis or create a new one
                const aiStep = analysisResult.steps[0];
                
                const updatedStep = {
                    ...currentStep,
                    name: aiStep.name || currentStep.name,
                    description: aiStep.description || currentStep.description,
                    estimated_duration: aiStep.estimated_duration || currentStep.estimated_duration,
                    difficulty_level: aiStep.difficulty_level || currentStep.difficulty_level,
                    materials: analysisResult.materials || currentStep.materials,
                    tools: analysisResult.tools || currentStep.tools,
                    cautions: analysisResult.cautions || currentStep.cautions,
                    questions: analysisResult.questions || currentStep.questions,
                    is_ai_generated: isAiGenerated, // Preserve original AI status
                    regenerated_at: new Date().toISOString(),
                };

                setProjectSteps(prev => {
                    const updatedSteps = prev.map((step, index) => 
                        index === stepIndex ? updatedStep : step
                    );
                    return updatedSteps;
                });

                // If this is the currently selected step, update the form
                if (currentStepIndex === stepIndex) {
                    setCurrentStepName(updatedStep.name);
                    setCurrentStepDescription(updatedStep.description);
                    setCurrentStepTools(updatedStep.tools || []);
                    setCurrentStepMaterials(updatedStep.materials || []);
                }

                setSuccessMessage(`Step "${updatedStep.name}" regenerated successfully!`);
            } else {
                throw new Error("No steps generated from AI analysis.");
            }

        } catch (error) {
            console.error('Error regenerating step:', error);
            setErrorMessage(`Error regenerating step: ${error.message}`);
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
            let thumbnailFileToUpload = null;
            let uploadedThumbnailInfo = null;
            
            if (!existingThumbnailUrl && capturedAnnotationFrames && Object.keys(capturedAnnotationFrames).length > 0) {
                const firstFrameTimestamp = Object.keys(capturedAnnotationFrames)[0];
                thumbnailFileToUpload = capturedAnnotationFrames[firstFrameTimestamp];

                if (thumbnailFileToUpload) {
                    setSuccessMessage('Using first annotation frame as project thumbnail...');
                    uploadedThumbnailInfo = await uploadFileToFirebase(
                        thumbnailFileToUpload, 
                        `users/${currentUser.uid}/${projectId}/thumbnails`,
                        currentUser
                    );
                }
            } else if (existingThumbnailUrl) {
                console.log('Project already has thumbnail, skipping thumbnail upload:', existingThumbnailUrl);
                setSuccessMessage('Project already has thumbnail, proceeding with step finalization...');
            }

            const processedStepsPayload = [];
            for (const step of projectSteps) {
                
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
                        
                        // Handle geometry data - normalize coordinates to 0-1 scale for backend
                        let geometryData = {};
                        if (ann.geometry) {
                            // Local annotation with geometry object (coordinates in 0-100 scale)
                            geometryData = {
                                x: ann.geometry.x / 100,  // Convert from percentage to normalized (0-1)
                                y: ann.geometry.y / 100,
                                width: ann.geometry.width / 100,
                                height: ann.geometry.height / 100,
                                type: ann.geometry.type || 'rectangle'
                            };
                        } else if (ann.data && typeof ann.data === 'object') {
                            // Database annotation or other format
                            geometryData = {
                                x: ann.data.x || 0,
                                y: ann.data.y || 0,
                                width: ann.data.width || 0,
                                height: ann.data.height || 0,
                                type: ann.data.type || 'rectangle'
                            };
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
                                quantity: toolData?.quantity || 1,
                            image_url: uploaded.url,
                            image_path: uploaded.path,
                        });
                        }
                    } catch (error) {
                        console.error(`Error uploading tool image ${toolFile.name}:`, error);
                    }
                }

                // Add tools without new images (including those with existing images)
                for (const tool of step.tools.filter(t => !t.image_file_name || t.hasExistingImage)) {
                    stepPayload.tools.push({ 
                        name: tool.name, 
                        specification: tool.specification, 
                        quantity: tool.quantity || 1,
                        image_path: tool.image_path || null,
                        image_url: tool.image_url || null,
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

                // Add materials without new images (including those with existing images)
                for (const material of step.materials.filter(m => !m.image_file_name || m.hasExistingImage)) {
                    stepPayload.materials.push({ 
                        name: material.name, 
                        specification: material.specification, 
                        quantity: material.quantity || 1,
                        image_path: material.image_path || null,
                        image_url: material.image_url || null,
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
                            const supFileData = (step.supplementary_files || []).find(sf => sf.fileName === supFile.name);
                        stepPayload.supplementary_files.push({
                                display_name: supFileData?.displayName || supFile.name,
                                file_url: uploaded.url,
                            file_path: uploaded.path,
                            original_filename: uploaded.name,
                            mime_type: uploaded.type,
                            file_size_bytes: uploaded.size || 0, // Ensure it's always an integer
                        });
                    }
                    } catch (error) {
                        console.error(`Error uploading supplementary file ${supFile.name}:`, error);
                    }
                }

                // Add existing supplementary files (without new uploads)
                for (const supFile of (step.supplementary_files || []).filter(sf => sf.hasExistingFile)) {
                    stepPayload.supplementary_files.push({
                        display_name: supFile.displayName,
                        file_url: supFile.file_url,
                        file_path: supFile.file_path,
                        original_filename: supFile.original_filename,
                        mime_type: supFile.mime_type,
                        file_size_bytes: supFile.file_size_bytes || 0, // Ensure it's always an integer
                    });
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
                        stepPayload.result_image_url = uploaded.url;
                        stepPayload.result_image_path = uploaded.path;
                        }
                    } catch (error) {
                        console.error(`Error uploading result image:`, error);
                    }
                } else if (step.result_image_url) {
                    // Keep existing result image
                    stepPayload.result_image_url = step.result_image_url;
                    stepPayload.result_image_path = step.result_image_path;
                }
                
                processedStepsPayload.push(stepPayload);
            }

            // --- 3. PROCESS BUY LIST ITEMS ---
            const processedBuyListPayload = [];
            for (const item of projectBuyList) {
                let itemImageUrl = null;
                let itemImagePath = null;
                
                if (item.imageFile) {
                    // New image file to upload
                    const uploaded = await uploadFileToFirebase(item.imageFile, `users/${currentUser.uid}/${projectId}/buy_list_images`, currentUser);
                    if (uploaded) {
                        itemImageUrl = uploaded.url;
                        itemImagePath = uploaded.path;
                    }
                } else if (item.hasExistingImage && item.image_url && item.image_path) {
                    // Preserve existing image from database
                    itemImageUrl = item.image_url;
                    itemImagePath = item.image_path;
                }
                
                processedBuyListPayload.push({
                    name: item.name,
                    quantity: item.quantity,
                    specification: item.specification,
                    purchase_link: item.purchase_link,
                    image_url: itemImageUrl,
                    image_path: itemImagePath,
                });
            }

            // If buy list is empty, explicitly send empty array to prevent backend auto-generation
            console.log(`Finalizing project with ${processedBuyListPayload.length} buy list items (${projectBuyList ? projectBuyList.length : 0} in frontend)`);

            // --- 4. SYNC BUY LIST TO DATABASE BEFORE FINALIZING ---
            // Send the buy list data to the database to ensure it's saved
            try {
                const buyListSyncResponse = await fetch(`${getApiUrl()}/projects/${projectId}/buy_list?firebase_uid=${currentUser.uid}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(processedBuyListPayload),
                });

                if (!buyListSyncResponse.ok) {
                    const errorData = await buyListSyncResponse.json();
                    console.warn("Failed to sync buy list to database:", errorData);
                    // Continue with finalization even if sync fails
                } else {
                    const syncResult = await buyListSyncResponse.json();
                    console.log("Buy list synced to database:", syncResult.message);
                }
            } catch (syncError) {
                console.warn("Error syncing buy list to database:", syncError);
                // Continue with finalization even if sync fails
            }

            // --- 5. VALIDATE AND SEND FINAL PAYLOAD TO THE API ---
            const finalPayload = {
                project_name: projectName,
                project_id: projectId,
                user_id: currentUser.uid,
                steps: processedStepsPayload,
                buy_list: processedBuyListPayload,
                thumbnail_path: uploadedThumbnailInfo ? uploadedThumbnailInfo.path : null,
                // Explicitly indicate if buy list should be auto-generated from steps
                auto_generate_buy_list: false, // Never auto-generate, only use what's explicitly provided
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

            // Clear the buy list state from localStorage since project is now finalized
            localStorage.removeItem(`buyListState_${projectId}`);
            // Also clear the old sessionStorage flag if it exists
            sessionStorage.removeItem(`buyListCleared_${projectId}`);

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
        handleRegenerateStep,
        handleFinishProject
    };
}; 

 