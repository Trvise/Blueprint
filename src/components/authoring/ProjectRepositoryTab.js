import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/authContext';
import { AiOutlinePlus, AiOutlineSearch, AiOutlineClose } from 'react-icons/ai';

// Import the getApiUrl function to match the existing codebase pattern
const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:8000';
};

const ProjectRepositoryTab = ({ styles, onRepositoryUpdate }) => {
    const { currentUser } = useAuth();
    const [activeRepo, setActiveRepo] = useState('tools'); // 'tools' or 'materials'
    const [tools, setTools] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [newItem, setNewItem] = useState({
        name: '',
        specification: '',
        purchase_link: '',
        imageFile: null
    });

    // Fetch tools from API
    const fetchTools = useCallback(async () => {
        if (!currentUser?.uid) return;
        
        try {
            setLoading(true);
            const apiUrl = getApiUrl();
            const fullUrl = `${apiUrl}/users/${currentUser.uid}/tools`;
            console.log('Fetching tools from:', fullUrl);
            
            const response = await fetch(fullUrl);
            console.log('Tools response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Tools data:', data);
                setTools(data);
            } else {
                console.error('Tools fetch failed:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                setError(`Failed to load tools: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching tools:', error);
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
            console.log('Fetching materials from:', fullUrl);
            
            const response = await fetch(fullUrl);
            console.log('Materials response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Materials data:', data);
                setMaterials(data);
            } else {
                console.error('Materials fetch failed:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                setError(`Failed to load materials: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching materials:', error);
            setError(`Network error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.uid]);

    // Add tool to repository
    const addTool = async () => {
        if (!newItem.name.trim()) return;

        try {
            setLoading(true);
            const apiUrl = getApiUrl();
            const formData = new FormData();
            formData.append('name', newItem.name);
            formData.append('specification', newItem.specification || '');
            formData.append('purchase_link', newItem.purchase_link || '');
            
            if (newItem.imageFile) {
                formData.append('image_file', newItem.imageFile);
            }

            const response = await fetch(`${apiUrl}/users/${currentUser.uid}/tools`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const newTool = await response.json();
                setTools(prev => [...prev, newTool]);
                setSuccessMessage('Tool added successfully!');
                setShowAddModal(false);
                resetNewItem();
                setTimeout(() => setSuccessMessage(''), 3000);
                // Trigger repository update callback
                if (onRepositoryUpdate) {
                    onRepositoryUpdate();
                }
            } else {
                const errorData = await response.json();
                setError(`Failed to add tool: ${errorData.detail || response.statusText}`);
            }
        } catch (error) {
            console.error('Error adding tool:', error);
            setError(`Network error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Add material to repository
    const addMaterial = async () => {
        if (!newItem.name.trim()) return;

        try {
            setLoading(true);
            const apiUrl = getApiUrl();
            const formData = new FormData();
            formData.append('name', newItem.name);
            formData.append('specification', newItem.specification || '');
            formData.append('purchase_link', newItem.purchase_link || '');
            
            if (newItem.imageFile) {
                formData.append('image_file', newItem.imageFile);
            }

            const response = await fetch(`${apiUrl}/users/${currentUser.uid}/materials`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const newMaterial = await response.json();
                setMaterials(prev => [...prev, newMaterial]);
                setSuccessMessage('Material added successfully!');
                setShowAddModal(false);
                resetNewItem();
                setTimeout(() => setSuccessMessage(''), 3000);
                // Trigger repository update callback
                if (onRepositoryUpdate) {
                    onRepositoryUpdate();
                }
            } else {
                const errorData = await response.json();
                setError(`Failed to add material: ${errorData.detail || response.statusText}`);
            }
        } catch (error) {
            console.error('Error adding material:', error);
            setError(`Network error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const resetNewItem = () => {
        setNewItem({
            name: '',
            specification: '',
            purchase_link: '',
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

    // Filter items based on search term
    const filteredItems = (activeRepo === 'tools' ? tools : materials).filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.specification && item.specification.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    useEffect(() => {
        if (currentUser?.uid) {
            setError(null); // Clear any previous errors
            fetchTools();
            fetchMaterials();
        }
    }, [currentUser, fetchTools, fetchMaterials]);

    const handleRetry = () => {
        setError(null);
        if (currentUser?.uid) {
            fetchTools();
            fetchMaterials();
        }
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            {/* Header */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Repository Management</h2>
                <p style={{color: '#D9D9D9', fontSize: '0.9rem', marginBottom: '20px'}}>
                    Add tools and materials to your repository for use across all projects
                </p>

                {/* Repository Tabs */}
                <div style={{
                    display: 'flex',
                    borderBottom: '2px solid #D9D9D9',
                    marginBottom: '20px'
                }}>
                    <button
                        onClick={() => setActiveRepo('tools')}
                        style={{
                            padding: '12px 16px',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            border: 'none',
                            backgroundColor: activeRepo === 'tools' ? '#F1C232' : 'transparent',
                            color: activeRepo === 'tools' ? '#000000' : '#D9D9D9',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderBottom: activeRepo === 'tools' ? '2px solid #0000FF' : '2px solid transparent',
                            borderRadius: '6px 6px 0 0'
                        }}
                    >
                        Tools ({tools.length})
                    </button>
                    <button
                        onClick={() => setActiveRepo('materials')}
                        style={{
                            padding: '12px 16px',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            border: 'none',
                            backgroundColor: activeRepo === 'materials' ? '#F1C232' : 'transparent',
                            color: activeRepo === 'materials' ? '#000000' : '#D9D9D9',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderBottom: activeRepo === 'materials' ? '2px solid #0000FF' : '2px solid transparent',
                            borderRadius: '6px 6px 0 0'
                        }}
                    >
                        Materials ({materials.length})
                    </button>
                </div>

                {/* Search and Add Controls */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    gap: '16px'
                }}>
                    <div style={{position: 'relative', flex: 1, maxWidth: '400px'}}>
                        <AiOutlineSearch style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#F1C232'
                        }} size={20} />
                        <input
                            type="text"
                            placeholder={`Search ${activeRepo}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px 8px 40px',
                                border: '1px solid #D9D9D9',
                                borderRadius: '6px',
                                backgroundColor: '#000000',
                                color: '#D9D9D9',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            backgroundColor: '#F1C232',
                            color: '#000000',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#0000FF'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#F1C232'}
                    >
                        <AiOutlinePlus size={16} />
                        Add {activeRepo === 'tools' ? 'Tool' : 'Material'}
                    </button>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#003300',
                        border: '1px solid #CCFFCC',
                        color: '#10b981',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        marginBottom: '20px'
                    }}>
                        {successMessage}
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#2d0000',
                        border: '1px solid #FFCCCC',
                        color: '#D8000C',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        marginBottom: '20px'
                    }}>
                        <div style={{fontWeight: '500'}}>Error loading {activeRepo}</div>
                        <div style={{fontSize: '0.8rem', marginTop: '4px'}}>{error}</div>
                        <button
                            onClick={handleRetry}
                            style={{
                                marginTop: '8px',
                                backgroundColor: '#D8000C',
                                color: '#FFFFFF',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                            }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {loading ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '40px',
                        color: '#D9D9D9'
                    }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid #F1C232',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <span style={{marginLeft: '12px'}}>Loading {activeRepo}...</span>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '16px'
                    }}>
                        {filteredItems.map((item) => (
                            <div key={item.tool_id || item.material_id} style={{
                                border: '1px solid #D9D9D9',
                                borderRadius: '8px',
                                padding: '16px',
                                backgroundColor: '#000000',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#1a1a1a'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#000000'}
                            >
                                {/* Item Image */}
                                {item.image_file?.file_url && (
                                    <img
                                        src={item.image_file.file_url}
                                        alt={item.name}
                                        style={{
                                            width: '100%',
                                            height: '120px',
                                            objectFit: 'cover',
                                            borderRadius: '6px',
                                            marginBottom: '12px'
                                        }}
                                    />
                                )}
                                
                                {/* Item Details */}
                                <h3 style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#F1C232',
                                    margin: '0 0 8px 0'
                                }}>{item.name}</h3>
                                {item.specification && (
                                    <p style={{
                                        fontSize: '0.85rem',
                                        color: '#D9D9D9',
                                        margin: '0 0 8px 0'
                                    }}>{item.specification}</p>
                                )}
                                {item.purchase_link && (
                                    <a
                                        href={item.purchase_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            color: '#0000FF',
                                            fontSize: '0.8rem',
                                            textDecoration: 'none'
                                        }}
                                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                    >
                                        Purchase Link
                                    </a>
                                )}
                            </div>
                        ))}
                        
                        {filteredItems.length === 0 && !loading && (
                            <div style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '40px',
                                color: '#D9D9D9'
                            }}>
                                No {activeRepo} found. {searchTerm ? 'Try adjusting your search.' : `Add your first ${activeRepo.slice(0, -1)}!`}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Item Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#000000',
                        borderRadius: '8px',
                        padding: '24px',
                        width: '100%',
                        maxWidth: '400px',
                        margin: '0 20px',
                        border: '1px solid #D9D9D9'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: '#F1C232',
                                margin: 0
                            }}>
                                Add New {activeRepo === 'tools' ? 'Tool' : 'Material'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetNewItem();
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#D9D9D9',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem'
                                }}
                            >
                                <AiOutlineClose size={20} />
                            </button>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    color: '#D9D9D9',
                                    marginBottom: '4px'
                                }}>
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #D9D9D9',
                                        borderRadius: '6px',
                                        backgroundColor: '#000000',
                                        color: '#D9D9D9',
                                        fontSize: '0.9rem',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="Enter name"
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    color: '#D9D9D9',
                                    marginBottom: '4px'
                                }}>
                                    Specification
                                </label>
                                <textarea
                                    value={newItem.specification}
                                    onChange={(e) => setNewItem({ ...newItem, specification: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #D9D9D9',
                                        borderRadius: '6px',
                                        backgroundColor: '#000000',
                                        color: '#D9D9D9',
                                        fontSize: '0.9rem',
                                        boxSizing: 'border-box',
                                        resize: 'vertical',
                                        minHeight: '80px'
                                    }}
                                    placeholder="Enter specification"
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    color: '#D9D9D9',
                                    marginBottom: '4px'
                                }}>
                                    Purchase Link
                                </label>
                                <input
                                    type="url"
                                    value={newItem.purchase_link}
                                    onChange={(e) => setNewItem({ ...newItem, purchase_link: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #D9D9D9',
                                        borderRadius: '6px',
                                        backgroundColor: '#000000',
                                        color: '#D9D9D9',
                                        fontSize: '0.9rem',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder="https://..."
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    color: '#D9D9D9',
                                    marginBottom: '4px'
                                }}>
                                    Image (Optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setNewItem({ ...newItem, imageFile: e.target.files[0] })}
                                    style={{
                                        width: '100%',
                                        fontSize: '0.85rem',
                                        color: '#D9D9D9',
                                        padding: '4px 0',
                                        boxSizing: 'border-box',
                                        backgroundColor: '#000000',
                                        border: '1px solid #D9D9D9',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                            marginTop: '24px'
                        }}>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetNewItem();
                                }}
                                style={{
                                    padding: '8px 16px',
                                    color: '#D9D9D9',
                                    border: '1px solid #D9D9D9',
                                    borderRadius: '6px',
                                    backgroundColor: '#000000',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddItem}
                                disabled={!newItem.name.trim() || loading}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#F1C232',
                                    color: '#000000',
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: newItem.name.trim() && !loading ? 'pointer' : 'not-allowed',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    opacity: newItem.name.trim() && !loading ? 1 : 0.5
                                }}
                            >
                                {loading ? 'Adding...' : `Add ${activeRepo === 'tools' ? 'Tool' : 'Material'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ProjectRepositoryTab; 