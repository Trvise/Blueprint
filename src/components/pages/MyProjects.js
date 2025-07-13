import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { isImageUrl, isVideoUrl, formatDate, createApiCall } from './createsteps helpers/CreateStepsUtils';
import { LazyImage, VideoThumbnail } from './createsteps helpers/CommonComponents';

const responsiveGridCSS = `
.projects-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-top: 2rem;
}

@media (min-width: 768px) {
    .projects-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1400px) {
    .projects-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
`;

const styles = {
    container: {
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: "'Inter', sans-serif",
        backgroundColor: '#000000',
        color: '#D9D9D9',
    },
    header: {
        marginBottom: '2rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#F1C232',
        marginBottom: '0.5rem',
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#D9D9D9',
        marginBottom: '2rem',
    },
    createButton: {
        backgroundColor: '#F1C232',
        color: '#000000',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        border: 'none',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textDecoration: 'none',
        display: 'inline-block',
        boxShadow: '0 2px 8px rgba(241,194,50,0.15)'
    },
    tabsContainer: {
        display: 'flex',
        borderBottom: '1px solid #333',
        marginBottom: '2rem',
    },
    tabButton: {
        padding: '1rem 1.5rem',
        cursor: 'pointer',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#D9D9D9',
        fontSize: '1rem',
        fontWeight: '500',
        borderBottom: '2px solid transparent',
        transition: 'all 0.2s',
    },
    activeTabButton: {
        color: '#F1C232',
        borderBottom: '2px solid #F1C232',
    },
    publishButton: {
        backgroundColor: '#22c55e', // Green
        color: '#ffffff',
    },
    unpublishButton: {
        backgroundColor: '#6b7280', // Gray
        color: '#ffffff',
    },
    projectCard: {
        backgroundColor: '#111111',
        borderRadius: '1rem',
        padding: '0',
        boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.3)',
        border: '1px solid #D9D9D9',
        transition: 'all 0.3s',
        cursor: 'pointer',
        overflow: 'hidden',
        minHeight: '320px',
    },
    projectCardHover: {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 35px -5px rgba(241,194,50,0.15)',
    },
    projectThumbnail: {
        width: '100%',
        height: '160px',
        objectFit: 'cover',
        backgroundColor: '#222222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af',
        fontSize: '0.875rem',
    },
    projectContent: {
        padding: '1.5rem',
    },
    projectName: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#F1C232',
        marginBottom: '0.5rem',
    },
    projectDescription: {
        fontSize: '0.9rem',
        color: '#D9D9D9',
        marginBottom: '1rem',
        lineHeight: '1.5',
        minHeight: '2.8rem',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
    },
    projectMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        fontSize: '0.875rem',
        color: '#D9D9D9',
    },
    projectActions: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    actionButton: {
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        border: 'none',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    editButton: {
        backgroundColor: '#0000FF',
        color: '#D9D9D9',
    },
    deleteButton: {
        backgroundColor: '#ef4444',
        color: '#D9D9D9',
    },
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        color: '#D9D9D9',
        backgroundColor: '#000000',
        marginTop: '2rem',
    },
    emptyStateIcon: {
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'center',
    },
    emptyStateText: {
        fontSize: '1.125rem',
        marginBottom: '1rem',
        color: '#D9D9D9',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        fontSize: '1.125rem',
        color: '#D9D9D9',
        backgroundColor: '#000000',
    },
    error: {
        backgroundColor: '#2d0000',
        color: '#dc2626',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid #dc2626',
        marginBottom: '1rem',
    },
    statsContainer: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '0.5rem',
    },
    statItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        fontSize: '0.875rem',
        color: '#D9D9D9',
    },
};

const ProjectCard = React.memo(({ 
    project, 
    onEdit, 
    onDelete, 
    onGenerateThumbnail, 
    deleteLoading, 
    formatDate,
    isPublished,
    onTogglePublication,
    toggleLoading
}) => {
    return (
        <div
            style={styles.projectCard}
            onMouseEnter={(e) => { Object.assign(e.currentTarget.style, styles.projectCardHover); }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(0, 0, 0, 0.1)'; }}
        >
            <div style={styles.projectThumbnail}>
                {project.thumbnail_url && isImageUrl(project.thumbnail_url) ? (
                    <LazyImage
                        src={project.thumbnail_url} 
                        alt={`${project.name} thumbnail`}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                        onError={(e) => {
                            const placeholder = e.target.parentElement;
                            placeholder.innerHTML = `
                                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #9ca3af;">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <polyline points="21,15 16,10 5,21"/>
                                    </svg>
                                </div>
                            `;
                        }}
                    />
                ) : project.frame_url && isVideoUrl(project.frame_url) ? (
                    <VideoThumbnail
                        videoUrl={project.frame_url}
                        projectName={project.name}
                    />
                ) : (
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '0.5rem'}}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            <polygon points="23 7 16 12 23 17 23 7"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                        <span style={{fontSize: '0.75rem', color: '#9ca3af'}}>No thumbnail</span>
                    </div>
                )}
            </div>

            <div style={styles.projectContent}>
                <div style={styles.projectName}>{project.name}</div>
                <div style={styles.projectDescription}>
                    {project.description || 'No description provided'}
                </div>
                
                <div style={styles.statsContainer}>
                    <div style={styles.statItem}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        <span>{project.view_count || 0}</span>
                    </div>
                    <div style={styles.statItem}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        <span>{project.like_count || 0}</span>
                    </div>
                    <div style={styles.statItem}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>
                        </svg>
                        <span>{project.comments?.length || 0}</span>
                    </div>
                </div>

                <div style={styles.projectMeta}>
                    <span>Created: {formatDate(project.created_at)}</span>
                </div>

                <div style={styles.projectActions}>
                    <button
                        style={{ ...styles.actionButton, ...styles.editButton }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(project.project_id);
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#000099'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#0000FF'}
                    >
                        Edit Steps
                    </button>
                    <button
                        style={{...styles.actionButton, backgroundColor: '#F1C232', color: '#000'}}
                        onClick={(e) => {
                            e.stopPropagation();
                            onGenerateThumbnail(project.project_id);
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#E6B800'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#F1C232'}
                    >
                        {(project.thumbnail_url || project.frame_url) ? 'Replace Thumbnail' : 'Upload Thumbnail'}
                    </button>
                    <button
                        style={{
                            ...styles.actionButton,
                            ...(isPublished ? styles.unpublishButton : styles.publishButton)
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onTogglePublication(project.project_id, isPublished);
                        }}
                        disabled={toggleLoading === project.project_id}
                    >
                        {toggleLoading === project.project_id 
                            ? (isPublished ? 'Unpublishing...' : 'Publishing...')
                            : (isPublished ? 'Unpublish' : 'Publish')
                        }
                    </button>
                    <button
                        style={{ ...styles.actionButton, ...styles.deleteButton }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(project.project_id, project.name);
                        }}
                        disabled={deleteLoading === project.project_id}
                        onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#dc2626')}
                        onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#ef4444')}
                    >
                        {deleteLoading === project.project_id ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
});

const MyProjects = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('published');
    const [publishedProjects, setPublishedProjects] = useState([]);
    const [draftProjects, setDraftProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [toggleLoading, setToggleLoading] = useState(null);

    const fetchMyProjects = useCallback(async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            setError('');
            const data = await createApiCall(`/users/${currentUser.uid}/projects`);
            
            setPublishedProjects(data.published || []);
            setDraftProjects(data.unpublished || []);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Failed to load projects');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchMyProjects();
    }, [fetchMyProjects]);

    const handleTogglePublication = async (projectId, isCurrentlyPublished) => {
        if (!window.confirm(`Are you sure you want to ${isCurrentlyPublished ? 'unpublish' : 'publish'} this project?`)) {
            return;
        }

        try {
            setToggleLoading(projectId);
            const response = await createApiCall(`/projects/${projectId}/toggle-publication`, {
                method: 'POST',
                body: JSON.stringify({ firebase_uid: currentUser.uid }),
            });

            const projectToMove = isCurrentlyPublished
                ? publishedProjects.find(p => p.project_id === projectId)
                : draftProjects.find(p => p.project_id === projectId);

            if (projectToMove) {
                if (isCurrentlyPublished) {
                    setPublishedProjects(prev => prev.filter(p => p.project_id !== projectId));
                    setDraftProjects(prev => [projectToMove, ...prev]);
                } else {
                    setDraftProjects(prev => prev.filter(p => p.project_id !== projectId));
                    setPublishedProjects(prev => [projectToMove, ...prev]);
                }
            }
            alert(response.message);
        } catch (err) {
            console.error('Error toggling publication status:', err);
            alert('Failed to update project status.');
        } finally {
            setToggleLoading(null);
        }
    };

    const handleDeleteProject = async (projectId, projectName) => {
        if (!window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            setDeleteLoading(projectId);
            await createApiCall(`/projects/${projectId}?firebase_uid=${currentUser.uid}`, {
                method: 'DELETE',
            });

            setPublishedProjects(projects => projects.filter(project => project.project_id !== projectId));
            setDraftProjects(projects => projects.filter(project => project.project_id !== projectId));
            alert('Project deleted successfully');
        } catch (err) {
            console.error('Error deleting project:', err);
            alert('Failed to delete project');
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleEditProject = (projectId) => {
        navigate(`/annotate`, { state: { projectId } });
    };

    const handleGenerateThumbnail = async (projectId) => {
        try {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                if (!file.type.startsWith('image/')) {
                    alert('Please select an image file');
                    return;
                }
                
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image file too large. Please select a file under 5MB.');
                    return;
                }
                
                try {
                    const { uploadFileToFirebase } = await import('./createsteps helpers/CreateStepsUtils');
                    const project = [...publishedProjects, ...draftProjects].find(p => p.project_id === projectId);
                    const projectName = project?.name || 'Unknown Project';
                    
                    const uploadedThumbnailInfo = await uploadFileToFirebase(
                        file,
                        `users/${currentUser.uid}/${projectId}/thumbnails`,
                        currentUser
                    );
                    
                    if (uploadedThumbnailInfo) {
                        try {
                            const { getApiUrl } = await import('./createsteps helpers/CreateStepsUtils');
                            const response = await fetch(`${getApiUrl()}/projects/${projectId}/thumbnail`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    firebase_uid: currentUser.uid,
                                    thumbnail_path: uploadedThumbnailInfo.path
                                }),
                            });

                            if (!response.ok) {
                                const errorText = await response.text();
                                throw new Error(`Backend update failed: ${response.status} - ${errorText}`);
                            }
                            
                            const updateProjectList = (projects) => projects.map(p => 
                                p.project_id === projectId 
                                    ? { ...p, thumbnail_url: uploadedThumbnailInfo.url }
                                    : p
                            );
                            setPublishedProjects(updateProjectList);
                            setDraftProjects(updateProjectList);
                            
                            alert(`Thumbnail uploaded successfully for "${projectName}"!`);
                        } catch (backendError) {
                            console.error('Error updating backend with thumbnail:', backendError);
                            
                            const updateProjectList = (projects) => projects.map(p => 
                                p.project_id === projectId 
                                    ? { ...p, thumbnail_url: uploadedThumbnailInfo.url }
                                    : p
                            );
                            setPublishedProjects(updateProjectList);
                            setDraftProjects(updateProjectList);
                            
                            const errorMessage = backendError.message?.includes('steps') 
                                ? 'Failed to fetch existing project data. Thumbnail uploaded but database not updated.'
                                : 'Database update failed but thumbnail is uploaded. It will appear after next project finalization.';
                            
                            alert(`Thumbnail uploaded to storage! Note: ${errorMessage}`);
                        }
                    } else {
                        alert('Failed to upload thumbnail');
                    }
                } catch (error) {
                    console.error('Error uploading thumbnail:', error);
                    alert('Failed to upload thumbnail: ' + error.message);
                }
                
                document.body.removeChild(fileInput);
            };
            
            document.body.appendChild(fileInput);
            fileInput.click();
            
        } catch (error) {
            console.error('Error setting up thumbnail upload:', error);
            alert('Failed to set up thumbnail upload');
        }
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <div>Loading your projects...</div>
            </div>
        );
    }

    const projectsToDisplay = activeTab === 'published' ? publishedProjects : draftProjects;

    return (
        <div style={styles.container}>
            <style>{responsiveGridCSS}</style>
            <div style={styles.header}>
                <h1 style={styles.title}>My Projects</h1>
                <p style={styles.subtitle}>
                    Manage and view all your instructional projects
                </p>
                <button
                    style={styles.createButton}
                    onClick={() => navigate('/create')}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#E6B800'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#F1C232'}
                >
                    + Create New Project
                </button>
            </div>
            
            <div style={styles.tabsContainer}>
                <button
                    style={{ ...styles.tabButton, ...(activeTab === 'published' && styles.activeTabButton) }}
                    onClick={() => setActiveTab('published')}
                >
                    Published ({publishedProjects.length})
                </button>
                <button
                    style={{ ...styles.tabButton, ...(activeTab === 'drafts' && styles.activeTabButton) }}
                    onClick={() => setActiveTab('drafts')}
                >
                    Drafts ({draftProjects.length})
                </button>
            </div>

            {error && (
                <div style={styles.error}>
                    {error}
                </div>
            )}

            {projectsToDisplay.length === 0 && !loading ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyStateIcon}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{color: '#9ca3af'}}>
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"/>
                        </svg>
                    </div>
                    <div style={styles.emptyStateText}>No {activeTab === 'published' ? 'published' : 'draft'} projects yet.</div>
                    {activeTab === 'drafts' && <p>Create a new project or unpublish an existing one to see it here.</p>}
                </div>
            ) : (
                <div className="projects-grid">
                    {projectsToDisplay.map((project) => (
                        <ProjectCard
                            key={project.project_id}
                            project={project}
                            onEdit={handleEditProject}
                            onDelete={handleDeleteProject}
                            onGenerateThumbnail={handleGenerateThumbnail}
                            deleteLoading={deleteLoading}
                            formatDate={formatDate}
                            isPublished={activeTab === 'published'}
                            onTogglePublication={handleTogglePublication}
                            toggleLoading={toggleLoading}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyProjects;