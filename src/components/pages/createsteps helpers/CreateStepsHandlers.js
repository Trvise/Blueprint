// CreateStepsHandlers.js - Handler functions for CreateSteps component
import { v4 as uuidv4 } from 'uuid';
import { uploadFileToFirebase, getApiUrl } from './CreateStepsUtils';

export const createStepHandlers = (
    // State setters and dependencies
    {
        setActiveVideoIndex,
        setActiveVideoUrl,
        setCurrentStepStartTime,
        setCurrentStepEndTime,
        setFrameForAnnotation,
        setCurrentStepAnnotations,
        setVideoDimensions,
        setErrorMessage,
        setCurrentAnnotationTool,
        setCurrentStepTools,
        setCurrentStepToolName,
        setCurrentStepToolSpec,
        setCurrentStepToolImageFile,
        setCurrentStepMaterials,
        setCurrentStepMaterialName,
        setCurrentStepMaterialSpec,
        setCurrentStepMaterialImageFile,
        setCurrentStepSupFiles,
        setCurrentStepSupFileName,
        setCurrentStepResultImageFile,
        setProjectBuyList,
        setBuyListItemName,
        setBuyListItemQty,
        setBuyListItemSpec,
        setBuyListItemLink,
        setBuyListItemImageFile,
        setProjectSteps,
        setCurrentStepIndex,
        setIsStepLoading,
        setSuccessMessage,
        setIsLoading,
        // Refs
        toolImageInputRef,
        materialImageInputRef,
        supFileInputRef,
        buyListImageInputRef,
        videoRef,
        // State values
        uploadedVideos,
        currentStepStartTime,
        frameTimestampMs,
        videoDimensions,
        currentStepAnnotations,
        currentStepTools,
        currentStepMaterials,
        currentStepSupFiles,
        currentStepSupFileName,
        currentStepToolName,
        currentStepToolSpec,
        currentStepToolImageFile,
        currentStepMaterialName,
        currentStepMaterialSpec,
        currentStepMaterialImageFile,
        buyListItemName,
        buyListItemQty,
        buyListItemSpec,
        buyListItemLink,
        buyListItemImageFile,
        projectBuyList,
        projectSteps,
        currentStepIndex,
        projectId,
        currentUser,
        navigate
    }
) => {

    const handleVideoSelection = (index) => {
        if (uploadedVideos[index] && uploadedVideos[index].url) {
            setActiveVideoIndex(index);
            setActiveVideoUrl(uploadedVideos[index].url);
            setCurrentStepStartTime(null);
            setCurrentStepEndTime(null);
            setFrameForAnnotation(null); 
            setCurrentStepAnnotations([]); 
            setVideoDimensions({ width: 0, height: 0 });
        } else {
            console.warn(`Video at index ${index} is missing a URL.`);
            setErrorMessage(`Video ${index + 1} could not be loaded.`);
        }
    };

    const markTime = (type) => {
        if (videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            if (type === 'start') {
                setCurrentStepStartTime(currentTime);
            } else if (type === 'end') {
                if (currentStepStartTime !== null && currentTime <= currentStepStartTime) {
                    alert("End time must be after start time.");
                    return;
                }
                setCurrentStepEndTime(currentTime);
            }
        }
    };

    const handleAnnotationSubmit = (newAnnotationFromLibrary) => {
        const { geometry, data: libraryData } = newAnnotationFromLibrary; 
        if (!geometry) { setErrorMessage("Annotation missing geometry."); return; }
        
        // Store coordinates in the display format (0-100 scale) for consistency
        // This is the format expected by react-image-annotation library
        const customDataForAnnotation = {
            id: uuidv4(), 
            text: libraryData?.text || `Annotation ${currentStepAnnotations.filter(a => a.data.frame_timestamp_ms === frameTimestampMs).length + 1}`, 
            frame_timestamp_ms: frameTimestampMs,
            // Store coordinates in percentage format (0-100 scale)
            x: geometry.x,
            y: geometry.y, 
            width: geometry.width,
            height: geometry.height,
            type: geometry.type
        };
        
        // Store annotation with geometry in the same format as display
        const annotationToAdd = { 
            geometry: geometry, 
            data: customDataForAnnotation 
        };
        
        console.log('Adding new annotation:', {
            geometry: geometry,
            data: customDataForAnnotation
        });
        
        setCurrentStepAnnotations(prev => [...prev, annotationToAdd]);
        setCurrentAnnotationTool({}); 
    };

    const handleAddToolToCurrentStep = () => {
        if (!currentStepToolName.trim()) { alert("Tool name is required."); return; }
        setCurrentStepTools(prev => [...prev, { 
            id: `tool_${uuidv4()}`, name: currentStepToolName, 
            specification: currentStepToolSpec, imageFile: currentStepToolImageFile 
        }]);
        setCurrentStepToolName(''); setCurrentStepToolSpec(''); setCurrentStepToolImageFile(null);
        if (toolImageInputRef.current) toolImageInputRef.current.value = "";
    };

    const removeToolFromCurrentStep = (toolId) => setCurrentStepTools(prev => prev.filter(tool => tool.id !== toolId));

    const handleAddMaterialToCurrentStep = () => {
        if (!currentStepMaterialName.trim()) { alert("Material name is required."); return; }
        setCurrentStepMaterials(prev => [...prev, { 
            id: `material_${uuidv4()}`, name: currentStepMaterialName, 
            specification: currentStepMaterialSpec, imageFile: currentStepMaterialImageFile 
        }]);
        setCurrentStepMaterialName(''); setCurrentStepMaterialSpec(''); setCurrentStepMaterialImageFile(null);
        if (materialImageInputRef.current) materialImageInputRef.current.value = "";
    };

    const removeMaterialFromCurrentStep = (materialId) => setCurrentStepMaterials(prev => prev.filter(mat => mat.id !== materialId));

    const handleSupFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCurrentStepSupFiles(prev => [...prev, {
                id: `supfile_${uuidv4()}`,
                fileObject: file, 
                displayName: currentStepSupFileName || file.name
            }]);
            setCurrentStepSupFileName(''); 
            if (supFileInputRef.current) supFileInputRef.current.value = null; 
        }
    };

    const removeSupFileFromCurrentStep = (fileId) => setCurrentStepSupFiles(prev => prev.filter(f => f.id !== fileId));

    const handleResultImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setCurrentStepResultImageFile(e.target.files[0]);
        } else {
            setCurrentStepResultImageFile(null);
        }
    };

    const handleAddBuyListItem = () => {
        if (!buyListItemName.trim()) { alert("Item name is required for buy list."); return; }
        setProjectBuyList(prev => [...prev, {
            id: `buyitem_${uuidv4()}`, name: buyListItemName,
            quantity: parseInt(buyListItemQty, 10) || 1, specification: buyListItemSpec,
            purchase_link: buyListItemLink, imageFile: buyListItemImageFile 
        }]);
        setBuyListItemName(''); setBuyListItemQty(1); setBuyListItemSpec('');
        setBuyListItemLink(''); setBuyListItemImageFile(null);
        if (buyListImageInputRef.current) buyListImageInputRef.current.value = "";
    };

    const removeBuyListItem = (itemId) => setProjectBuyList(prev => prev.filter(item => item.id !== itemId));

    const handleFinishProject = async (projectName) => {
        if (!projectSteps.length) {
            alert("Please add at least one step before finishing the project.");
            return;
        }
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('Finalizing project... Uploading files...');

        try {
            const processedStepsPayload = [];
            for (const step of projectSteps) {
                const stepPayload = {
                    name: step.name,
                    description: step.description,
                    video_start_time_ms: step.video_start_time_ms,
                    video_end_time_ms: step.video_end_time_ms,
                    cautionary_notes: step.cautionary_notes,
                    best_practice_notes: step.best_practice_notes,
                    associated_video_path: step.associated_video_path,
                    step_order: step.step_order,
                    annotations: step.annotations.map(ann => ({
                        frame_timestamp_ms: ann.data.frame_timestamp_ms,
                        annotation_type: ann.geometry.type,
                        component_name: ann.data.text,
                        data: {
                            x: ann.data.x / 100,  // Convert from percentage to normalized (0-1)
                            y: ann.data.y / 100,
                            width: ann.data.width / 100,
                            height: ann.data.height / 100,
                            type: ann.data.type
                        }
                    })),
                    tools: [],
                    materials: [],
                    supplementary_files: [],
                    validation_metric: step.validation_metric,
                    result_image_url: null,
                    result_image_path: null,
                };

                // Upload Tool Images
                for (const toolFile of step._toolImageFiles || []) {
                    const uploaded = await uploadFileToFirebase(toolFile, `users/${currentUser.uid}/${projectId}/tools`, currentUser);
                    if (uploaded) {
                        stepPayload.tools.push({
                            name: step.tools.find(t => t.image_file_name === toolFile.name)?.name || 'Unknown Tool',
                            specification: step.tools.find(t => t.image_file_name === toolFile.name)?.specification || '',
                            image_url: uploaded.url,
                            image_path: uploaded.path,
                        });
                    }
                }
                // Add tools without images
                for (const tool of step.tools || []) {
                    if (!tool.image_file_name && !stepPayload.tools.some(t => t.name === tool.name)) {
                         stepPayload.tools.push({ name: tool.name, specification: tool.specification, image_url: tool.image_url || null, image_path: tool.image_path || null });
                    }
                }

                // Upload Material Images
                for (const materialFile of step._materialImageFiles || []) {
                    const uploaded = await uploadFileToFirebase(materialFile, `users/${currentUser.uid}/${projectId}/materials`, currentUser);
                    if (uploaded) {
                        stepPayload.materials.push({
                            name: step.materials.find(m => m.image_file_name === materialFile.name)?.name || 'Unknown Material',
                            specification: step.materials.find(m => m.image_file_name === materialFile.name)?.specification || '',
                            image_url: uploaded.url,
                            image_path: uploaded.path,
                        });
                    }
                }
                // Add materials without images
                for (const material of step.materials || []) {
                    if (!material.image_file_name && !stepPayload.materials.some(m => m.name === material.name)) {
                         stepPayload.materials.push({ name: material.name, specification: material.specification, image_url: material.image_url || null, image_path: material.image_path || null });
                    }
                }

                // Upload Supplementary Files
                for (const supFileObj of step._supplementaryFileObjects || []) {
                    const uploaded = await uploadFileToFirebase(supFileObj, `users/${currentUser.uid}/${projectId}/supplementary_files`, currentUser);
                    if (uploaded) {
                        stepPayload.supplementary_files.push({
                            display_name: step.supplementary_files.find(sf => sf.fileName === supFileObj.name)?.displayName || supFileObj.name,
                            file_url: uploaded.url,
                            file_path: uploaded.path,
                            original_filename: uploaded.name,
                            mime_type: uploaded.type,
                            file_size_bytes: uploaded.size,
                        });
                    }
                }

                // Upload Step Result Image
                if (step._resultImageFileObject) {
                    const uploaded = await uploadFileToFirebase(step._resultImageFileObject, `users/${currentUser.uid}/${projectId}/result_images`, currentUser);
                    if (uploaded) {
                        stepPayload.result_image_url = uploaded.url;
                        stepPayload.result_image_path = uploaded.path;
                    }
                }
                processedStepsPayload.push(stepPayload);
            }

            // Upload Buy List Item Images
            const processedBuyListPayload = [];
            for (const item of projectBuyList) {
                let itemImageUrl = null;
                let itemImagePath = null;
                if (item.imageFile) {
                    const uploaded = await uploadFileToFirebase(item.imageFile, `users/${currentUser.uid}/${projectId}/buy_list_images`, currentUser);
                    if (uploaded) {
                        itemImageUrl = uploaded.url;
                        itemImagePath = uploaded.path;
                    }
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

            const finalApiPayload = {
                project_id: projectId,
                project_name: projectName,
                user_id: currentUser.uid,
                steps: processedStepsPayload,
                buy_list: processedBuyListPayload,
            };

            console.log("Final API Payload to send to backend:", JSON.stringify(finalApiPayload, null, 2));

            // TODO: Replace with your actual API endpoint for finalizing project steps
            const backendApiUrl = `${getApiUrl()}/upload_steps`; 
            const token = currentUser.uid;

            const response = await fetch(backendApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(finalApiPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to save project steps to backend.");
            }
            
            const responseData = await response.json();
            console.log("Backend response from finalize_steps:", responseData);

            setSuccessMessage("Project finalized and all data saved successfully! Redirecting...");
            navigate(`/videos`);

        } catch (error) {
            console.error("Error during project finalization:", error);
            setErrorMessage(`Finalization failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        handleVideoSelection,
        markTime,
        handleAnnotationSubmit,
        handleAddToolToCurrentStep,
        removeToolFromCurrentStep,
        handleAddMaterialToCurrentStep,
        removeMaterialFromCurrentStep,
        handleSupFileChange,
        removeSupFileFromCurrentStep,
        handleResultImageChange,
        handleAddBuyListItem,
        removeBuyListItem,
        handleFinishProject
    };
}; 