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
        setCurrentStepResultImage,
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

    const handleAnnotationSubmit = (annotationData) => {
        console.log('Annotation submitted:', annotationData);
        console.log('Current frameTimestampMs:', frameTimestampMs);
        
        // Validate that we have a valid timestamp
        if (!frameTimestampMs || frameTimestampMs <= 0) {
            alert('Please capture a frame first before creating annotations.');
            return;
        }
        
        // The annotationData from react-image-annotation comes with geometry and data
        // We need to ensure it has the correct structure for our system
        const newAnnotation = {
            geometry: annotationData.geometry,
            data: {
                text: annotationData.data?.text || 'Untitled annotation',
                id: `annotation_${uuidv4()}`,
                frame_timestamp_ms: frameTimestampMs,
            }
        };
        
        console.log('Creating annotation:', newAnnotation);
        setCurrentStepAnnotations(prev => [...prev, newAnnotation]);
        
        // Clear the annotation tool after successful submission
        setCurrentAnnotationTool({});
    };

    // Function to clear all annotations for the current step
    const handleClearAnnotations = () => {
        if (currentStepAnnotations.length === 0) {
            setSuccessMessage('No annotations to clear.');
            setTimeout(() => setSuccessMessage(''), 2000);
            return;
        }

        const confirmed = window.confirm(`Are you sure you want to clear all ${currentStepAnnotations.length} annotations? This action cannot be undone.`);
        if (confirmed) {
            setCurrentStepAnnotations([]);
            setCurrentAnnotationTool({});
            setSuccessMessage('All annotations cleared successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
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
            const file = e.target.files[0];
            setCurrentStepResultImageFile(file);
            // Create a URL for immediate preview
            setCurrentStepResultImage(URL.createObjectURL(file));
        } else {
            setCurrentStepResultImageFile(null);
            setCurrentStepResultImage(null);
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

    // New function to fetch repository items and auto-populate buy list
    const handleAutoPopulateBuyList = async () => {
        if (!currentUser?.uid) {
            setErrorMessage("User not authenticated");
            return;
        }

        try {
            setIsLoading(true);
            setErrorMessage('');
            
            const apiUrl = getApiUrl();
            
            // Fetch both tools and materials in parallel
            const [toolsResponse, materialsResponse] = await Promise.all([
                fetch(`${apiUrl}/users/${currentUser.uid}/tools`),
                fetch(`${apiUrl}/users/${currentUser.uid}/materials`)
            ]);

            let allItems = [];

            // Process tools
            if (toolsResponse.ok) {
                const tools = await toolsResponse.json();
                console.log('Fetched tools for auto-populate:', tools);
                
                const toolItems = tools.map(tool => ({
                    id: `buyitem_tool_${tool.tool_id || uuidv4()}`,
                    name: tool.name,
                    quantity: 1, // Default quantity
                    specification: tool.specification || '',
                    purchase_link: tool.purchase_link || '',
                    imageFile: null, // Repository items already have uploaded images
                    sourceType: 'tool', // Track source for reference
                    sourceId: tool.tool_id
                }));
                
                allItems = [...allItems, ...toolItems];
            } else {
                console.warn('Failed to fetch tools:', toolsResponse.status);
            }

            // Process materials
            if (materialsResponse.ok) {
                const materials = await materialsResponse.json();
                console.log('Fetched materials for auto-populate:', materials);
                
                const materialItems = materials.map(material => ({
                    id: `buyitem_material_${material.material_id || uuidv4()}`,
                    name: material.name,
                    quantity: 1, // Default quantity
                    specification: material.specification || '',
                    purchase_link: material.purchase_link || '',
                    imageFile: null, // Repository items already have uploaded images
                    sourceType: 'material', // Track source for reference
                    sourceId: material.material_id
                }));
                
                allItems = [...allItems, ...materialItems];
            } else {
                console.warn('Failed to fetch materials:', materialsResponse.status);
            }

            if (allItems.length === 0) {
                setSuccessMessage('No items found in repository to add to buy list.');
                setTimeout(() => setSuccessMessage(''), 3000);
                return;
            }

            // Filter out items that are already in the buy list (by name to avoid duplicates)
            const existingItemNames = new Set(projectBuyList.map(item => item.name.toLowerCase()));
            const newItems = allItems.filter(item => !existingItemNames.has(item.name.toLowerCase()));

            if (newItems.length === 0) {
                setSuccessMessage('All repository items are already in the buy list.');
                setTimeout(() => setSuccessMessage(''), 3000);
                return;
            }

            // Add new items to the buy list
            setProjectBuyList(prev => [...prev, ...newItems]);
            
            setSuccessMessage(`Successfully added ${newItems.length} items from repository to buy list!`);
            setTimeout(() => setSuccessMessage(''), 5000);

        } catch (error) {
            console.error('Error auto-populating buy list:', error);
            setErrorMessage(`Failed to fetch repository items: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // New function to clear the entire buy list
    const handleClearBuyList = () => {
        if (projectBuyList.length === 0) {
            setSuccessMessage('Buy list is already empty.');
            setTimeout(() => setSuccessMessage(''), 3000);
            return;
        }

        const confirmed = window.confirm(`Are you sure you want to clear all ${projectBuyList.length} items from the buy list? This action cannot be undone.`);
        if (confirmed) {
            setProjectBuyList([]);
            setSuccessMessage('Buy list cleared successfully.');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    const handleFinishProject = async (projectName) => {
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // Create project data payload
            const processedStepsPayload = [];

            for (let i = 0; i < projectSteps.length; i++) {
                const step = projectSteps[i];
                
                // Build the video path
                const videoPath = step.associated_video_path || (uploadedVideos[step.associated_video_index]?.path) || null;
                
                const stepPayload = {
                    name: step.name,
                    description: step.description,
                    video_start_time_ms: Math.round(step.video_start_time_ms),
                    video_end_time_ms: Math.round(step.video_end_time_ms),
                    cautionary_notes: step.cautionary_notes,
                    best_practice_notes: step.best_practice_notes,
                    associated_video_path: videoPath,
                    step_order: step.step_order,
                    annotations: step.annotations || [],
                    tools: [],
                    materials: [],
                    supplementary_files: [],
                    validation_metric: step.validation_metric && step.validation_metric.question ? {
                        question: step.validation_metric.question,
                        expected_answer: step.validation_metric.expected_answer
                    } : null,
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

            // Process Buy List Items
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
        handleClearAnnotations,
        handleAddToolToCurrentStep,
        removeToolFromCurrentStep,
        handleAddMaterialToCurrentStep,
        removeMaterialFromCurrentStep,
        handleSupFileChange,
        removeSupFileFromCurrentStep,
        handleResultImageChange,
        handleAddBuyListItem,
        removeBuyListItem,
        handleAutoPopulateBuyList,
        handleClearBuyList,
        handleFinishProject
    };
}; 