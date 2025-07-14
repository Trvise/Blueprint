import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/authContext';
import { AiOutlinePlus, AiOutlineSearch, AiOutlineEdit, AiOutlineDelete, AiOutlineClose, AiOutlineUpload } from 'react-icons/ai';
import { uploadFileToFirebase, getApiUrl } from '../pages/createsteps helpers/CreateStepsUtils';
import { repositoryStyles } from '../pages/Repository.styles';

// No local getApiUrl function

const RepositoryPanel = ({ contextType = 'main', onAddToStep, onAddToBuyList }) => {
    const { currentUser } = useAuth();
    const [activeRepo, setActiveRepo] = useState('tools'); // 'tools' or 'materials'
    const [tools, setTools] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        specification: '',
        purchase_link: '',
        image_path: '',
        imageFile: null
    });

    // Fetch tools from API
    const fetchTools = useCallback(async () => {
        if (!currentUser?.uid) return;
        try {
            setLoading(true);
            const apiUrl = getApiUrl();
            const fullUrl = `${apiUrl}/users/${currentUser.uid}/tools`;
            const response = await fetch(fullUrl);
            if (response.ok) {
                const data = await response.json();
                setTools(data);
                setError(null);
            } else {
                setError(`Failed to load tools: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            setError(`Network error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.uid]);

    // Fetch materials from API
    const fetchMaterials = useCallback(async () => {
        if (!currentUser?.uid) return;
        try {
            setLoading(true);
            const apiUrl = getApiUrl();
            const fullUrl = `${apiUrl}/users/${currentUser.uid}/materials`;
            const response = await fetch(fullUrl);
            if (response.ok) {
                const data = await response.json();
                setMaterials(data);
                setError(null);
            } else {
                setError(`Failed to load materials: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            setError(`Network error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.uid]);

    // Handle image upload
    const handleImageUpload = async (file) => {
        if (!file || !currentUser?.uid) return null;
        try {
            setUploadingImage(true);
            const pathPrefix = `users/${currentUser.uid}/repository/${activeRepo}`;
            const uploadResult = await uploadFileToFirebase(file, pathPrefix, currentUser);
            return uploadResult?.path || null;
        } catch (error) {
            alert('Failed to upload image. Please try again.');
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    // Add new tool
    const addTool = async () => {
        if (!newItem.name.trim()) {
            alert('Tool name is required.');
            return;
        }
        try {
            setLoading(true);
            let imagePath = null;
            if (newItem.imageFile) {
                imagePath = await handleImageUpload(newItem.imageFile);
                if (!imagePath) {
                    setLoading(false);
                    return;
                }
            }
            const response = await fetch(`${getApiUrl()}/users/${currentUser.uid}/tools`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newItem.name,
                    specification: newItem.specification || null,
                    purchase_link: newItem.purchase_link || null,
                    image_path: imagePath
                }),
            });
            if (response.ok) {
                await fetchTools();
                setShowAddModal(false);
                resetNewItem();
                setError(null);
            } else {
                const errorData = await response.json();
                alert(`Failed to add tool: ${errorData.detail || response.statusText}`);
            }
        } catch (error) {
            alert('Network error while adding tool. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Add new material
    const addMaterial = async () => {
        if (!newItem.name.trim()) {
            alert('Material name is required.');
            return;
        }
        try {
            setLoading(true);
            let imagePath = null;
            if (newItem.imageFile) {
                imagePath = await handleImageUpload(newItem.imageFile);
                if (!imagePath) {
                    setLoading(false);
                    return;
                }
            }
            const response = await fetch(`${getApiUrl()}/users/${currentUser.uid}/materials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newItem.name,
                    specification: newItem.specification || null,
                    purchase_link: newItem.purchase_link || null,
                    image_path: imagePath
                }),
            });
            if (response.ok) {
                await fetchMaterials();
                setShowAddModal(false);
                resetNewItem();
                setError(null);
            } else {
                const errorData = await response.json();
                alert(`Failed to add material: ${errorData.detail || response.statusText}`);
            }
        } catch (error) {
            alert('Network error while adding material. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Delete tool
    const deleteTool = async (toolId) => {
        try {
            setLoading(true);
            const response = await fetch(`${getApiUrl()}/users/${currentUser.uid}/tools/${toolId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await fetchTools();
                setShowDeleteModal(false);
                setDeletingItem(null);
                setError(null);
            } else {
                const errorData = await response.json();
                alert(`Failed to delete tool: ${errorData.detail || response.statusText}`);
            }
        } catch (error) {
            alert('Network error while deleting tool. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Delete material
    const deleteMaterial = async (materialId) => {
        try {
            setLoading(true);
            const response = await fetch(`${getApiUrl()}/users/${currentUser.uid}/materials/${materialId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await fetchMaterials();
                setShowDeleteModal(false);
                setDeletingItem(null);
                setError(null);
            } else {
                const errorData = await response.json();
                alert(`Failed to delete material: ${errorData.detail || response.statusText}`);
            }
        } catch (error) {
            alert('Network error while deleting material. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Edit tool
    const editTool = async () => {
        if (!editingItem?.name?.trim()) {
            alert('Tool name is required.');
            return;
        }
        try {
            setLoading(true);
            let imagePath = editingItem.image_path;
            if (editingItem.imageFile) {
                const uploadedPath = await handleImageUpload(editingItem.imageFile);
                if (uploadedPath) {
                    imagePath = uploadedPath;
                } else {
                    setLoading(false);
                    return;
                }
            }
            const updateUrl = `${getApiUrl()}/users/${currentUser.uid}/tools/${editingItem.tool_id}`;
            const updatePayload = {
                name: editingItem.name,
                specification: editingItem.specification || null,
                purchase_link: editingItem.purchase_link || null,
                image_path: imagePath
            };
            const response = await fetch(updateUrl, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload),
            });
            if (response.ok) {
                await fetchTools();
                setShowEditModal(false);
                setEditingItem(null);
                setError(null);
            } else {
                const errorText = await response.text();
                let errorMessage = response.statusText;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.detail || errorData.message || response.statusText;
                } catch (e) {
                    errorMessage = errorText || response.statusText;
                }
                alert(`Failed to edit tool: ${errorMessage}`);
            }
        } catch (error) {
            alert('Network error while editing tool. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Edit material
    const editMaterial = async () => {
        if (!editingItem?.name?.trim()) {
            alert('Material name is required.');
            return;
        }
        try {
            setLoading(true);
            let imagePath = editingItem.image_path;
            if (editingItem.imageFile) {
                const uploadedPath = await handleImageUpload(editingItem.imageFile);
                if (uploadedPath) {
                    imagePath = uploadedPath;
                } else {
                    setLoading(false);
                    return;
                }
            }
            const updateUrl = `${getApiUrl()}/users/${currentUser.uid}/materials/${editingItem.material_id}`;
            const updatePayload = {
                name: editingItem.name,
                specification: editingItem.specification || null,
                purchase_link: editingItem.purchase_link || null,
                image_path: imagePath
            };
            const response = await fetch(updateUrl, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload),
            });
            if (response.ok) {
                await fetchMaterials();
                setShowEditModal(false);
                setEditingItem(null);
                setError(null);
            } else {
                const errorText = await response.text();
                let errorMessage = response.statusText;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.detail || errorData.message || response.statusText;
                } catch (e) {
                    errorMessage = errorText || response.statusText;
                }
                alert(`Failed to edit material: ${errorMessage}`);
            }
        } catch (error) {
            alert('Network error while editing material. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetNewItem = () => {
        setNewItem({
            name: '',
            specification: '',
            purchase_link: '',
            image_path: '',
            imageFile: null
        });
    };

    const handleAddItem = () => {
        if (activeRepo === 'tools') {
            addTool();
        } else {
            addMaterial();
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB.');
                return;
            }
            setNewItem({ ...newItem, imageFile: file });
        }
    };

    const handleEditItem = (item) => {
        setEditingItem({ ...item, imageFile: null });
        setShowEditModal(true);
    };

    const handleDeleteItem = (item) => {
        setDeletingItem(item);
        setShowDeleteModal(true);
    };

    const handleSaveEdit = () => {
        if (activeRepo === 'tools') {
            editTool();
        } else {
            editMaterial();
        }
    };

    const handleConfirmDelete = () => {
        if (activeRepo === 'tools') {
            deleteTool(deletingItem.tool_id);
        } else {
            deleteMaterial(deletingItem.material_id);
        }
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB.');
                return;
            }
            setEditingItem({ ...editingItem, imageFile: file });
        }
    };

    const filteredItems = (activeRepo === 'tools' ? tools : materials).filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.specification && item.specification.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    useEffect(() => {
        if (currentUser?.uid) {
            setError(null);
            fetchTools();
            fetchMaterials();
        }
    }, [currentUser, fetchTools, fetchMaterials]);

    return (
        <div className={repositoryStyles.container}>
            <div className={repositoryStyles.maxWidth}>
                {/* Header */}
                <div className={repositoryStyles.header.container}>
                    <h1 className={repositoryStyles.header.title}>Materials & Tools Repository</h1>
                    <p className={repositoryStyles.header.subtitle}>Manage your reusable materials and tools for all projects</p>
                </div>

                {/* Repository Tabs */}
                <div className={repositoryStyles.tabs.container}>
                    <div className={repositoryStyles.tabs.tabsWrapper}>
                        <button
                            onClick={() => setActiveRepo('tools')}
                            className={`${repositoryStyles.tabs.tab.base} ${
                                activeRepo === 'tools'
                                    ? repositoryStyles.tabs.tab.active
                                    : repositoryStyles.tabs.tab.inactive
                            }`}
                        >
                            Tools ({tools.length})
                        </button>
                        <button
                            onClick={() => setActiveRepo('materials')}
                            className={`${repositoryStyles.tabs.tab.base} ${
                                activeRepo === 'materials'
                                    ? repositoryStyles.tabs.tab.active
                                    : repositoryStyles.tabs.tab.inactive
                            }`}
                        >
                            Materials ({materials.length})
                        </button>
                    </div>

                    <div className={repositoryStyles.tabs.content}>
                        {/* Search and Add Controls */}
                        <div className={repositoryStyles.controls.container}>
                            <div className={repositoryStyles.controls.searchWrapper}>
                                <AiOutlineSearch className={repositoryStyles.controls.searchIcon} size={20} />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeRepo}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={repositoryStyles.controls.searchInput}
                                />
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className={repositoryStyles.controls.addButton}
                            >
                                <AiOutlinePlus size={20} />
                                Add {activeRepo === 'tools' ? 'Tool' : 'Material'}
                            </button>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className={repositoryStyles.error.container}>
                                <h4 className={repositoryStyles.error.title}>Connection Error</h4>
                                <p className={repositoryStyles.error.message}>{error}</p>
                                <p className={repositoryStyles.error.details}>
                                    Make sure the API server is running at <code className={repositoryStyles.error.code}>{getApiUrl()}</code>
                                </p>
                                <button 
                                    onClick={() => {
                                        setError(null);
                                        if (currentUser?.uid) {
                                            fetchTools();
                                            fetchMaterials();
                                        }
                                    }}
                                    className={repositoryStyles.error.retryButton}
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Items Grid */}
                        {loading ? (
                            <div className={repositoryStyles.loading.container}>
                                <div className={repositoryStyles.loading.spinner}></div>
                                <span className={repositoryStyles.loading.text}>Loading {activeRepo}...</span>
                            </div>
                        ) : (
                            <div className={repositoryStyles.grid.container}>
                                {filteredItems.map((item) => (
                                    <div key={item.tool_id || item.material_id} className={repositoryStyles.grid.card.base}>
                                        {/* Item Image */}
                                        {item.image_file?.file_url && (
                                            <div className={repositoryStyles.grid.card.imageWrapper}>
                                                <img
                                                    src={item.image_file.file_url}
                                                    alt={item.name}
                                                    className={repositoryStyles.grid.card.image}
                                                />
                                                <div className={repositoryStyles.grid.card.imageOverlay}></div>
                                            </div>
                                        )}
                                        
                                        {/* Item Details */}
                                        <h3 className={repositoryStyles.grid.card.title}>{item.name}</h3>
                                        {item.specification && (
                                            <p className={repositoryStyles.grid.card.specification}>{item.specification}</p>
                                        )}
                                        {item.purchase_link && (
                                            <a
                                                href={item.purchase_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={repositoryStyles.grid.card.purchaseLink}
                                            >
                                                Purchase Link →
                                            </a>
                                        )}
                                        
                                        {/* Action Buttons */}
                                        <div className={repositoryStyles.grid.card.actionsContainer}>
                                            <button 
                                                onClick={() => handleEditItem(item)}
                                                className={`${repositoryStyles.grid.card.actionButton} ${repositoryStyles.grid.card.editButton}`}
                                                title="Edit"
                                            >
                                                <AiOutlineEdit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteItem(item)}
                                                className={`${repositoryStyles.grid.card.actionButton} ${repositoryStyles.grid.card.deleteButton}`}
                                                title="Delete"
                                            >
                                                <AiOutlineDelete size={16} />
                                            </button>
                                            {onAddToBuyList && (
                                                <button 
                                                    onClick={() => onAddToBuyList(item)}
                                                    className={`${repositoryStyles.grid.card.actionButton} ${repositoryStyles.grid.card.buyButton}`}
                                                    title="Add to Buy List"
                                                >
                                                    <AiOutlinePlus size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                {filteredItems.length === 0 && !loading && (
                                    <div className={repositoryStyles.emptyState.container}>
                                        <div className={repositoryStyles.emptyState.iconContainer}>
                                            <AiOutlinePlus size={48} className={repositoryStyles.emptyState.icon} />
                                        </div>
                                        <h3 className={repositoryStyles.emptyState.title}>No {activeRepo} found</h3>
                                        <p className={repositoryStyles.emptyState.message}>
                                            {searchTerm ? 'Try adjusting your search term.' : `Get started by adding your first ${activeRepo.slice(0, -1)}!`}
                                        </p>
                                        {!searchTerm && (
                                            <button 
                                                onClick={() => setShowAddModal(true)}
                                                className={repositoryStyles.emptyState.button}
                                            >
                                                Add {activeRepo === 'tools' ? 'Tool' : 'Material'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Item Modal */}
                {showAddModal && (
                    <div className={repositoryStyles.modal.overlay}>
                        <div className={repositoryStyles.modal.container}>
                            <div className={repositoryStyles.modal.header}>
                                <h3 className={repositoryStyles.modal.title}>
                                    Add New {activeRepo === 'tools' ? 'Tool' : 'Material'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetNewItem();
                                    }}
                                    className={repositoryStyles.modal.closeButton}
                                >
                                    <AiOutlineClose size={24} />
                                </button>
                            </div>

                            <div className={repositoryStyles.modal.content}>
                                <div>
                                    <label className={repositoryStyles.form.label}>
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        className={repositoryStyles.form.input}
                                        placeholder="Enter name"
                                    />
                                </div>

                                <div>
                                    <label className={repositoryStyles.form.label}>
                                        Specification
                                    </label>
                                    <textarea
                                        value={newItem.specification}
                                        onChange={(e) => setNewItem({ ...newItem, specification: e.target.value })}
                                        className={repositoryStyles.form.textarea}
                                        placeholder="Enter specification"
                                        rows="3"
                                    />
                                </div>

                                <div>
                                    <label className={repositoryStyles.form.label}>
                                        Purchase Link
                                    </label>
                                    <input
                                        type="url"
                                        value={newItem.purchase_link}
                                        onChange={(e) => setNewItem({ ...newItem, purchase_link: e.target.value })}
                                        className={repositoryStyles.form.input}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <label className={repositoryStyles.form.label}>
                                        Image
                                    </label>
                                    <div className={repositoryStyles.form.fileInputWrapper}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className={repositoryStyles.form.fileInputHidden}
                                            id="image-upload"
                                        />
                                        <label 
                                            htmlFor="image-upload"
                                            className={repositoryStyles.form.fileInputLabel}
                                        >
                                            <AiOutlineUpload size={16} />
                                            Choose Image
                                        </label>
                                        {newItem.imageFile && (
                                            <span className={repositoryStyles.form.fileName}>
                                                {newItem.imageFile.name}
                                            </span>
                                        )}
                                    </div>
                                    <p className={repositoryStyles.form.helpText}>
                                        Max 5MB, JPG/PNG/GIF supported
                                    </p>
                                </div>

                                {/* Image preview */}
                                {newItem.imageFile && (
                                    <div>
                                        <img 
                                            src={URL.createObjectURL(newItem.imageFile)}
                                            alt="Preview"
                                            className={repositoryStyles.form.imagePreview}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className={repositoryStyles.modal.footer}>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        resetNewItem();
                                    }}
                                    className={repositoryStyles.buttons.cancel}
                                    disabled={loading || uploadingImage}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddItem}
                                    disabled={!newItem.name.trim() || loading || uploadingImage}
                                    className={repositoryStyles.buttons.primary}
                                >
                                    {(loading || uploadingImage) && (
                                        <div className={repositoryStyles.buttons.spinner}></div>
                                    )}
                                    {uploadingImage ? 'Uploading...' : loading ? 'Adding...' : `Add ${activeRepo === 'tools' ? 'Tool' : 'Material'}`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Item Modal */}
                {showEditModal && editingItem && (
                    <div className={repositoryStyles.modal.overlay}>
                        <div className={repositoryStyles.modal.container}>
                            <div className={repositoryStyles.modal.header}>
                                <h3 className={repositoryStyles.modal.title}>
                                    Edit {activeRepo === 'tools' ? 'Tool' : 'Material'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingItem(null);
                                    }}
                                    className={repositoryStyles.modal.closeButton}
                                >
                                    <AiOutlineClose size={24} />
                                </button>
                            </div>

                            <div className={repositoryStyles.modal.content}>
                                <div>
                                    <label className={repositoryStyles.form.label}>
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editingItem.name}
                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                        className={repositoryStyles.form.input}
                                        placeholder="Enter name"
                                    />
                                </div>

                                <div>
                                    <label className={repositoryStyles.form.label}>
                                        Specification
                                    </label>
                                    <textarea
                                        value={editingItem.specification}
                                        onChange={(e) => setEditingItem({ ...editingItem, specification: e.target.value })}
                                        className={repositoryStyles.form.textarea}
                                        placeholder="Enter specification"
                                        rows="3"
                                    />
                                </div>

                                <div>
                                    <label className={repositoryStyles.form.label}>
                                        Purchase Link
                                    </label>
                                    <input
                                        type="url"
                                        value={editingItem.purchase_link}
                                        onChange={(e) => setEditingItem({ ...editingItem, purchase_link: e.target.value })}
                                        className={repositoryStyles.form.input}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <label className={repositoryStyles.form.label}>
                                        Image
                                    </label>
                                    <div className={repositoryStyles.form.fileInputWrapper}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleEditImageChange}
                                            className={repositoryStyles.form.fileInputHidden}
                                            id="edit-image-upload"
                                        />
                                        <label 
                                            htmlFor="edit-image-upload"
                                            className={repositoryStyles.form.fileInputLabel}
                                        >
                                            <AiOutlineUpload size={16} />
                                            Choose Image
                                        </label>
                                        {editingItem.imageFile && (
                                            <span className={repositoryStyles.form.fileName}>
                                                {editingItem.imageFile.name}
                                            </span>
                                        )}
                                    </div>
                                    <p className={repositoryStyles.form.helpText}>
                                        Max 5MB, JPG/PNG/GIF supported
                                    </p>
                                </div>

                                {/* Image preview */}
                                {editingItem.imageFile && (
                                    <div>
                                        <img 
                                            src={URL.createObjectURL(editingItem.imageFile)}
                                            alt="Preview"
                                            className={repositoryStyles.form.imagePreview}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className={repositoryStyles.modal.footer}>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingItem(null);
                                    }}
                                    className={repositoryStyles.buttons.cancel}
                                    disabled={loading || uploadingImage}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={!editingItem.name.trim() || loading || uploadingImage}
                                    className={repositoryStyles.buttons.primary}
                                >
                                    {(loading || uploadingImage) && (
                                        <div className={repositoryStyles.buttons.spinner}></div>
                                    )}
                                    {uploadingImage ? 'Uploading...' : loading ? 'Saving...' : `Save ${activeRepo === 'tools' ? 'Tool' : 'Material'}`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && deletingItem && (
                    <div className={repositoryStyles.modal.overlay}>
                        <div className={repositoryStyles.modal.container}>
                            <div className={repositoryStyles.modal.header}>
                                <h3 className={repositoryStyles.modal.title}>
                                    Confirm Deletion
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletingItem(null);
                                    }}
                                    className={repositoryStyles.modal.closeButton}
                                >
                                    <AiOutlineClose size={24} />
                                </button>
                            </div>

                            <p className="text-gray-300 mb-4">
                                Are you sure you want to delete "{deletingItem.name}"? This action cannot be undone.
                            </p>

                            <div className={repositoryStyles.modal.footer}>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletingItem(null);
                                    }}
                                    className={repositoryStyles.buttons.cancel}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className={repositoryStyles.buttons.danger}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RepositoryPanel; 