import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from './createsteps helpers/CreateStepsUtils';

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
        backgroundColor: '#000000',
        color: '#D9D9D9',
        fontFamily: "'Inter', sans-serif",
    },
    header: {
        textAlign: 'center',
        marginBottom: '3rem',
        padding: '2rem',
        backgroundColor: '#111111',
        borderRadius: '12px',
        border: '2px solid #F1C232',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#F1C232',
        marginBottom: '1rem',
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#D9D9D9',
        marginBottom: '1rem',
    },
    profileSection: {
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '2rem',
        marginBottom: '3rem',
        backgroundColor: '#111111',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #333',
    },
    profileImage: {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '3px solid #F1C232',
        margin: '0 auto',
        display: 'block',
    },
    profileInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    label: {
        fontWeight: '600',
        color: '#F1C232',
        minWidth: '120px',
    },
    value: {
        color: '#D9D9D9',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem',
    },
    statCard: {
        backgroundColor: '#111111',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #333',
        textAlign: 'center',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
    },
    statCardHover: {
        transform: 'translateY(-2px)',
        borderColor: '#F1C232',
        boxShadow: '0 4px 12px rgba(241,194,50,0.2)',
    },
    statNumber: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#F1C232',
        marginBottom: '0.5rem',
    },
    statLabel: {
        fontSize: '1rem',
        color: '#D9D9D9',
        marginBottom: '0.5rem',
    },
    statDescription: {
        fontSize: '0.875rem',
        color: '#999',
    },
    activitySection: {
        backgroundColor: '#111111',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #333',
        marginBottom: '2rem',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#F1C232',
        marginBottom: '1.5rem',
        borderBottom: '2px solid #333',
        paddingBottom: '0.5rem',
    },
    activityGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
    },
    activityCard: {
        backgroundColor: '#000000',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #444',
    },
    activityTitle: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#D9D9D9',
        marginBottom: '0.5rem',
    },
    activityMeta: {
        fontSize: '0.875rem',
        color: '#999',
        marginBottom: '0.5rem',
    },
    activityContent: {
        fontSize: '0.875rem',
        color: '#D9D9D9',
        fontStyle: 'italic',
    },
    searchHistory: {
        backgroundColor: '#000000',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid #444',
        marginBottom: '0.5rem',
    },
    searchTerm: {
        fontSize: '0.875rem',
        color: '#D9D9D9',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        fontSize: '1.125rem',
        color: '#D9D9D9',
    },
    error: {
        backgroundColor: '#2d0000',
        color: '#dc2626',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid #dc2626',
        marginBottom: '1rem',
    },
    emptyState: {
        textAlign: 'center',
        padding: '2rem',
        color: '#999',
        fontStyle: 'italic',
    },
};

const MyProfile = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [userStats, setUserStats] = useState({
        publishedProjects: 0,
        draftProjects: 0,
        totalTools: 0,
        totalMaterials: 0,
    });
    const [likedProjects, setLikedProjects] = useState([]);
    const [savedProjects, setSavedProjects] = useState([]);
    const [userComments, setUserComments] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [hoveredCard, setHoveredCard] = useState(null);

    const fetchProfileData = useCallback(async () => {
        if (!currentUser?.uid) return;

        try {
            setLoading(true);
            setError('');

            // Fetch all data in parallel
            const [
                profileResponse,
                projectsResponse,
                toolsResponse,
                materialsResponse,
                likedResponse,
                savedResponse,
                commentsResponse,
                searchHistoryResponse
            ] = await Promise.all([
                fetch(`${getApiUrl()}/users/${currentUser.uid}`),
                fetch(`${getApiUrl()}/users/${currentUser.uid}/projects`),
                fetch(`${getApiUrl()}/users/${currentUser.uid}/tools`),
                fetch(`${getApiUrl()}/users/${currentUser.uid}/materials`),
                fetch(`${getApiUrl()}/users/${currentUser.uid}/liked_projects`),
                fetch(`${getApiUrl()}/users/${currentUser.uid}/saved_projects`),
                fetch(`${getApiUrl()}/users/${currentUser.uid}/comments`),
                fetch(`${getApiUrl()}/users/${currentUser.uid}/search_history`)
            ]);

            // Process profile data
            if (profileResponse.ok) {
                const profile = await profileResponse.json();
                setProfileData(profile);
            }

            // Process projects data
            if (projectsResponse.ok) {
                const projects = await projectsResponse.json();
                setUserStats(prev => ({
                    ...prev,
                    publishedProjects: projects.published?.length || 0,
                    draftProjects: projects.unpublished?.length || 0,
                }));
            }

            // Process tools and materials
            if (toolsResponse.ok) {
                const tools = await toolsResponse.json();
                setUserStats(prev => ({ ...prev, totalTools: tools.length }));
            }

            if (materialsResponse.ok) {
                const materials = await materialsResponse.json();
                setUserStats(prev => ({ ...prev, totalMaterials: materials.length }));
            }

            // Process activity data
            if (likedResponse.ok) {
                const liked = await likedResponse.json();
                setLikedProjects(liked.slice(0, 5)); // Show only recent 5
            }

            if (savedResponse.ok) {
                const saved = await savedResponse.json();
                setSavedProjects(saved.slice(0, 5)); // Show only recent 5
            }

            if (commentsResponse.ok) {
                const comments = await commentsResponse.json();
                setUserComments(comments.slice(0, 5)); // Show only recent 5
            }

            if (searchHistoryResponse.ok) {
                const history = await searchHistoryResponse.json();
                setSearchHistory(history.slice(0, 10)); // Show only recent 10
            }

        } catch (err) {
            console.error('Error fetching profile data:', err);
            setError('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    }, [currentUser?.uid]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleNavigateToProjects = (filter) => {
        navigate('/my-projects', { state: { activeTab: filter } });
    };

    const handleNavigateToRepository = (type) => {
        navigate('/repository', { state: { activeRepo: type } });
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <div>Loading your profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>{error}</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>My Profile</h1>
                <p style={styles.subtitle}>Manage your account and view your activity</p>
            </div>

            {/* Profile Information */}
            {profileData && (
                <div style={styles.profileSection}>
                    <div>
                        <img
                            src={profileData.profile_photo_url || `https://api.dicebear.com/7.x/adventurer/png?seed=${profileData.email}&backgroundColor=b6e3f4&size=150`}
                            alt="Profile"
                            style={styles.profileImage}
                            onError={(e) => {
                                e.target.src = `https://api.dicebear.com/7.x/adventurer/png?seed=${profileData.email}&backgroundColor=b6e3f4&size=150`;
                            }}
                        />
                    </div>
                    <div style={styles.profileInfo}>
                        <div style={styles.infoRow}>
                            <span style={styles.label}>Username:</span>
                            <span style={styles.value}>{profileData.username}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.label}>Email:</span>
                            <span style={styles.value}>{profileData.email}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.label}>Affiliation:</span>
                            <span style={styles.value}>{profileData.affiliation || 'Not specified'}</span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.label}>Account Type:</span>
                            <span style={styles.value}>
                                {profileData.is_creator ? 'Creator Account' : 'Standard Account'}
                            </span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.label}>User ID:</span>
                            <span style={{ ...styles.value, fontSize: '0.8rem', color: '#999' }}>
                                {profileData.user_id}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistics */}
            <div style={styles.statsGrid}>
                <div 
                    style={{
                        ...styles.statCard,
                        ...(hoveredCard === 'published' ? styles.statCardHover : {})
                    }}
                    onMouseEnter={() => setHoveredCard('published')}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => handleNavigateToProjects('published')}
                >
                    <div style={styles.statNumber}>{userStats.publishedProjects}</div>
                    <div style={styles.statLabel}>Published Projects</div>
                    <div style={styles.statDescription}>Your public instructional content</div>
                </div>
                <div 
                    style={{
                        ...styles.statCard,
                        ...(hoveredCard === 'draft' ? styles.statCardHover : {})
                    }}
                    onMouseEnter={() => setHoveredCard('draft')}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => handleNavigateToProjects('draft')}
                >
                    <div style={styles.statNumber}>{userStats.draftProjects}</div>
                    <div style={styles.statLabel}>Draft Projects</div>
                    <div style={styles.statDescription}>Work in progress</div>
                </div>
                <div 
                    style={{
                        ...styles.statCard,
                        ...(hoveredCard === 'tools' ? styles.statCardHover : {})
                    }}
                    onMouseEnter={() => setHoveredCard('tools')}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => handleNavigateToRepository('tools')}
                >
                    <div style={styles.statNumber}>{userStats.totalTools}</div>
                    <div style={styles.statLabel}>Tools in Repository</div>
                    <div style={styles.statDescription}>Your saved tools</div>
                </div>
                <div 
                    style={{
                        ...styles.statCard,
                        ...(hoveredCard === 'materials' ? styles.statCardHover : {})
                    }}
                    onMouseEnter={() => setHoveredCard('materials')}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => handleNavigateToRepository('materials')}
                >
                    <div style={styles.statNumber}>{userStats.totalMaterials}</div>
                    <div style={styles.statLabel}>Materials in Repository</div>
                    <div style={styles.statDescription}>Your saved materials</div>
                </div>
            </div>

            {/* Recent Activity */}
            <div style={styles.activitySection}>
                <h2 style={styles.sectionTitle}>Recent Activity</h2>
                <div style={styles.activityGrid}>
                    {/* Liked Projects */}
                    <div>
                        <h3 style={{ ...styles.sectionTitle, fontSize: '1.2rem', marginBottom: '1rem' }}>
                            Recently Liked Projects
                        </h3>
                        {likedProjects.length > 0 ? (
                            likedProjects.map((project) => (
                                <div key={project.project_id} style={styles.activityCard}>
                                    <div style={styles.activityTitle}>{project.name}</div>
                                    <div style={styles.activityMeta}>
                                        by {project.creator.username} • {formatDate(project.created_at)}
                                    </div>
                                    <div style={styles.activityContent}>
                                        {project.description || 'No description'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={styles.emptyState}>No liked projects yet</div>
                        )}
                    </div>

                    {/* Saved Projects */}
                    <div>
                        <h3 style={{ ...styles.sectionTitle, fontSize: '1.2rem', marginBottom: '1rem' }}>
                            Recently Saved Projects
                        </h3>
                        {savedProjects.length > 0 ? (
                            savedProjects.map((project) => (
                                <div key={project.project_id} style={styles.activityCard}>
                                    <div style={styles.activityTitle}>{project.name}</div>
                                    <div style={styles.activityMeta}>
                                        by {project.creator.username} • {formatDate(project.created_at)}
                                    </div>
                                    <div style={styles.activityContent}>
                                        {project.description || 'No description'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={styles.emptyState}>No saved projects yet</div>
                        )}
                    </div>

                    {/* Recent Comments */}
                    <div>
                        <h3 style={{ ...styles.sectionTitle, fontSize: '1.2rem', marginBottom: '1rem' }}>
                            Recent Comments
                        </h3>
                        {userComments.length > 0 ? (
                            userComments.map((comment) => (
                                <div key={comment.comment_id} style={styles.activityCard}>
                                    <div style={styles.activityTitle}>On: {comment.project.name}</div>
                                    <div style={styles.activityMeta}>
                                        {formatDate(comment.created_at)}
                                    </div>
                                    <div style={styles.activityContent}>
                                        "{comment.comment_text}"
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={styles.emptyState}>No comments yet</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search History */}
            <div style={styles.activitySection}>
                <h2 style={styles.sectionTitle}>Recent Search History</h2>
                {searchHistory.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {searchHistory.map((searchTerm, index) => (
                            <div key={index} style={styles.searchHistory}>
                                <span style={styles.searchTerm}>{searchTerm}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={styles.emptyState}>No search history yet</div>
                )}
            </div>
        </div>
    );
};

export default MyProfile; 