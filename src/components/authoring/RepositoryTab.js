import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/authContext';
import { AiOutlinePlus, AiOutlineSearch, AiOutlineClose } from 'react-icons/ai';

// Import the getApiUrl function to match the existing codebase pattern
const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:8000';
};

const RepositoryTab = () => {
    const { currentUser } = useAuth();
    const [activeRepo, setActiveRepo] = useState('tools'); // 'tools' or 'materials'
    const [tools, setTools] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newItem, setNewItem] = useState({
        name: '',
        specification: '',
        purchase_link: '',
        image_path: ''
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

    // Add new tool
    const addTool = async () => {
        if (!newItem.name.trim()) return;
        
        try {
            const response = await fetch(`${getApiUrl()}/users/${currentUser.uid}/tools`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newItem.name,
                    specification: newItem.specification || null,
                    purchase_link: newItem.purchase_link || null,
                    image_path: newItem.image_path || null
                }),
            });

            if (response.ok) {
                await fetchTools();
                setShowAddModal(false);
                resetNewItem();
            }
        } catch (error) {
            console.error('Error adding tool:', error);
        }
    };

    // Add new material
    const addMaterial = async () => {
        if (!newItem.name.trim()) return;
        
        try {
            const response = await fetch(`${getApiUrl()}/users/${currentUser.uid}/materials`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newItem.name,
                    specification: newItem.specification || null,
                    purchase_link: newItem.purchase_link || null,
                    image_path: newItem.image_path || null
                }),
            });

            if (response.ok) {
                await fetchMaterials();
                setShowAddModal(false);
                resetNewItem();
            }
        } catch (error) {
            console.error('Error adding material:', error);
        }
    };

    const resetNewItem = () => {
        setNewItem({
            name: '',
            specification: '',
            purchase_link: '',
            image_path: ''
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

    return (
        <div className="p-6 bg-white rounded-lg">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Materials & Tools Repository</h2>
                <p className="text-gray-600">Manage your reusable materials and tools for projects</p>
            </div>

            {/* Repository Tabs */}
            <div className="flex mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveRepo('tools')}
                    className={`px-6 py-3 font-medium transition-colors ${
                        activeRepo === 'tools'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Tools ({tools.length})
                </button>
                <button
                    onClick={() => setActiveRepo('materials')}
                    className={`px-6 py-3 font-medium transition-colors ${
                        activeRepo === 'materials'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Materials ({materials.length})
                </button>
            </div>

            {/* Search and Add Controls */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative flex-1 max-w-md">
                    <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={`Search ${activeRepo}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <AiOutlinePlus size={20} />
                    Add {activeRepo === 'tools' ? 'Tool' : 'Material'}
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <h4 className="font-medium">Connection Error</h4>
                    <p className="text-sm mt-1">{error}</p>
                    <p className="text-sm mt-2">
                        Make sure the API server is running at <code className="bg-red-100 px-1 rounded">{getApiUrl()}</code>
                    </p>
                    <button 
                        onClick={() => {
                            setError(null);
                            if (currentUser?.uid) {
                                fetchTools();
                                fetchMaterials();
                            }
                        }}
                        className="mt-3 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Items Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading {activeRepo}...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item) => (
                        <div key={item.tool_id || item.material_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                            {/* Item Image */}
                            {item.image_file?.file_url && (
                                <img
                                    src={item.image_file.file_url}
                                    alt={item.name}
                                    className="w-full h-32 object-cover rounded-lg mb-3"
                                />
                            )}
                            
                            {/* Item Details */}
                            <h3 className="font-semibold text-gray-800 mb-2">{item.name}</h3>
                            {item.specification && (
                                <p className="text-sm text-gray-600 mb-2">{item.specification}</p>
                            )}
                            {item.purchase_link && (
                                <a
                                    href={item.purchase_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 text-sm hover:underline"
                                >
                                    Purchase Link
                                </a>
                            )}
                        </div>
                    ))}
                    
                    {filteredItems.length === 0 && !loading && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No {activeRepo} found. {searchTerm ? 'Try adjusting your search.' : `Add your first ${activeRepo.slice(0, -1)}!`}
                        </div>
                    )}
                </div>
            )}

            {/* Add Item Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                Add New {activeRepo === 'tools' ? 'Tool' : 'Material'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetNewItem();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <AiOutlineClose size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Specification
                                </label>
                                <textarea
                                    value={newItem.specification}
                                    onChange={(e) => setNewItem({ ...newItem, specification: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter specification"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Purchase Link
                                </label>
                                <input
                                    type="url"
                                    value={newItem.purchase_link}
                                    onChange={(e) => setNewItem({ ...newItem, purchase_link: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetNewItem();
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddItem}
                                disabled={!newItem.name.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add {activeRepo === 'tools' ? 'Tool' : 'Material'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepositoryTab; 