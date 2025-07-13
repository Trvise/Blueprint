import React from 'react';
import { formatFileSize } from './shared/styles';

const ProjectOverviewTab = ({
    projectSteps,
    formatTime,
    projectBuyList,
    onEditStep,
    onDeleteStep,
    styles
}) => {
    const totalSteps = projectSteps.length;
    const totalAnnotations = projectSteps.reduce((sum, step) => sum + (step.annotations?.length || 0), 0);
    const totalTools = projectSteps.reduce((sum, step) => sum + (step.tools?.length || 0), 0);
    const totalMaterials = projectSteps.reduce((sum, step) => sum + (step.materials?.length || 0), 0);
    const totalFiles = projectSteps.reduce((sum, step) => sum + (step.supplementary_files?.length || 0), 0);

    // Update overviewStyles for improved readability
    const overviewStyles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#000000',
            minHeight: '100vh',
        },
        header: {
            textAlign: 'center',
            marginBottom: '40px',
            padding: '30px',
            backgroundColor: '#111111',
            borderRadius: '12px',
            border: '2px solid #F1C232',
        },
        title: {
            fontSize: '2.7rem',
            fontWeight: 'bold',
            color: '#F1C232',
            marginBottom: '14px',
            letterSpacing: '0.01em',
            textShadow: '0 2px 8px #000',
        },
        subtitle: {
            fontSize: '1.18rem',
            color: '#F5F5F5',
            marginBottom: '26px',
            lineHeight: 1.7,
            fontWeight: 500,
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px',
        },
        statCard: {
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid #000000',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s ease',
        },
        statCardHover: {
            transform: 'translateY(-2px)',
        },
        statNumber: {
            fontSize: '2.7rem',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#F1C232',
            textShadow: '0 2px 8px #000',
        },
        statLabel: {
            fontSize: '1.08rem',
            fontWeight: '600',
            color: '#F5F5F5',
            letterSpacing: '0.01em',
        },
        stepsSection: {
            marginBottom: '40px',
        },
        sectionTitle: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#F1C232',
            marginBottom: '24px',
            padding: '18px 24px',
            backgroundColor: '#18181b',
            borderRadius: '10px',
            border: '1.5px solid #F1C232',
            letterSpacing: '0.01em',
            textShadow: '0 2px 8px #000',
        },
        stepCard: {
            marginBottom: '25px',
            backgroundColor: '#111111',
            borderRadius: '12px',
            border: '2px solid #D9D9D9',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
        },
        stepCardHover: {
            borderColor: '#F1C232',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(241, 194, 50, 0.2)',
        },
        stepHeader: {
            padding: '20px',
            backgroundColor: '#000000',
            borderBottom: '1px solid #D9D9D9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        stepTitle: {
            fontSize: '1.35rem',
            fontWeight: 'bold',
            color: '#F1C232',
            marginBottom: '10px',
            letterSpacing: '0.01em',
            textShadow: '0 2px 8px #000',
        },
        stepVideo: {
            fontSize: '0.9rem',
            color: '#D9D9D9',
            marginBottom: '8px',
        },
        stepTime: {
            fontSize: '0.85rem',
            color: '#D9D9D9',
            backgroundColor: '#0000FF',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'inline-block',
        },
        editButton: {
            backgroundColor: '#F1C232',
            color: '#000000',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s ease',
        },
        editButtonHover: {
            backgroundColor: '#D4AF37',
            transform: 'scale(1.05)',
        },
        stepContent: {
            padding: '20px',
        },
        stepDescription: {
            fontSize: '1.08rem',
            color: '#F5F5F5',
            marginBottom: '22px',
            lineHeight: 1.7,
            fontWeight: 500,
            letterSpacing: '0.01em',
        },
        notesContainer: {
            display: 'flex',
            gap: '15px',
            marginBottom: '20px',
            flexWrap: 'wrap',
        },
        noteCard: {
            flex: '1',
            minWidth: '250px',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #000000',
        },
        cautionNote: {
            backgroundColor: '#F1C232',
            color: '#000000',
        },
        bestPracticeNote: {
            backgroundColor: '#0000FF',
            color: '#D9D9D9',
        },
        noteTitle: {
            fontSize: '0.9rem',
            fontWeight: 'bold',
            marginBottom: '8px',
        },
        noteContent: {
            fontSize: '0.85rem',
            lineHeight: '1.5',
        },
        detailsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '15px',
            marginTop: '20px',
        },
        detailCard: {
            backgroundColor: '#000000',
            borderRadius: '8px',
            border: '1px solid #D9D9D9',
            overflow: 'hidden',
        },
        detailHeader: {
            padding: '12px 15px',
            backgroundColor: '#111111',
            borderBottom: '1px solid #D9D9D9',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        detailTitle: {
            fontSize: '1.08rem',
            fontWeight: '700',
            color: '#F1C232',
            letterSpacing: '0.01em',
            textShadow: '0 2px 8px #000',
        },
        detailCount: {
            fontSize: '0.95rem',
            color: '#0000FF',
            backgroundColor: '#F1C232',
            padding: '3px 10px',
            borderRadius: '6px',
            fontWeight: 700,
            marginLeft: '8px',
        },
        detailContent: {
            padding: '15px',
            maxHeight: '200px',
            overflowY: 'auto',
        },
        detailList: {
            listStyle: 'none',
            padding: '0',
            margin: '0',
        },
        detailItem: {
            padding: '8px 0',
            borderBottom: '1px solid #222222',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        detailItemLast: {
            borderBottom: 'none',
        },
        itemImage: {
            width: '80px',
            height: '80px',
            borderRadius: '8px',
            border: '2px solid #D9D9D9',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#111111',
            flexShrink: '0',
            marginRight: '18px',
        },
        itemText: {
            fontSize: '1.01rem',
            color: '#F5F5F5',
            flex: '1',
            lineHeight: 1.6,
            fontWeight: 500,
        },
        itemName: {
            fontWeight: '900',
            color: '#F1C232',
            fontSize: '1.35rem',
            letterSpacing: '0.01em',
            textShadow: '0 2px 8px #000',
            marginBottom: '2px',
        },
        itemSpec: {
            fontSize: '0.97rem',
            color: '#BDBDBD',
            marginTop: '4px',
            fontWeight: 400,
        },
        itemQuantity: {
            fontSize: '1.18rem',
            color: '#fff',
            fontWeight: '700',
            marginTop: '6px',
            letterSpacing: '0.01em',
        },
        buyListSection: {
            marginTop: '40px',
            padding: '25px',
            backgroundColor: '#111111',
            borderRadius: '12px',
            border: '2px solid #F1C232',
        },
        buyListTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#F1C232',
            marginBottom: '20px',
            textAlign: 'center',
        },
        buyListGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '15px',
        },
        buyListItem: {
            padding: '15px',
            backgroundColor: '#000000',
            borderRadius: '8px',
            border: '1px solid #D9D9D9',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        buyListImage: {
            width: '80px',
            height: '80px',
            borderRadius: '8px',
            border: '2px solid #D9D9D9',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#111111',
            flexShrink: '0',
            marginRight: '18px',
        },
        buyListContent: {
            flex: '1',
        },
        buyListName: {
            fontSize: '1.35rem',
            fontWeight: '900',
            color: '#F1C232',
            marginBottom: '2px',
            letterSpacing: '0.01em',
            textShadow: '0 2px 8px #000',
        },
        buyListSpec: {
            fontSize: '0.97rem',
            color: '#BDBDBD',
            marginBottom: '2px',
            fontWeight: 400,
        },
        buyListQuantity: {
            fontSize: '1.18rem',
            color: '#fff',
            fontWeight: '700',
            marginTop: '6px',
            letterSpacing: '0.01em',
        },
        emptyState: {
            textAlign: 'center',
            padding: '60px 20px',
            color: '#D9D9D9',
        },
        emptyIcon: {
            fontSize: '4rem',
            color: '#666666',
            marginBottom: '20px',
        },
        emptyText: {
            fontSize: '1.2rem',
            marginBottom: '10px',
        },
        emptySubtext: {
            fontSize: '0.9rem',
            color: '#999999',
        },
    };

    return (
        <div style={overviewStyles.container}>
            {/* Header Section */}
            <div style={overviewStyles.header}>
                <h1 style={overviewStyles.title}>Project Overview</h1>
                <p style={overviewStyles.subtitle}>
                    Comprehensive overview of your project steps and resources
                </p>
                
                {/* Statistics Grid */}
                <div style={overviewStyles.statsGrid}>
                    <div style={{
                        ...overviewStyles.statCard,
                        backgroundColor: '#0000FF',
                        color: '#D9D9D9'
                    }}>
                        <div style={overviewStyles.statNumber}>{totalSteps}</div>
                        <div style={overviewStyles.statLabel}>Total Steps</div>
                        </div>
                        <div style={{
                        ...overviewStyles.statCard,
                            backgroundColor: '#F1C232',
                        color: '#000000'
                    }}>
                        <div style={overviewStyles.statNumber}>{totalAnnotations}</div>
                        <div style={overviewStyles.statLabel}>Annotations</div>
                        </div>
                        <div style={{
                        ...overviewStyles.statCard,
                            backgroundColor: '#D9D9D9',
                        color: '#000000'
                    }}>
                        <div style={overviewStyles.statNumber}>{totalTools}</div>
                        <div style={overviewStyles.statLabel}>Tools</div>
                        </div>
                        <div style={{
                        ...overviewStyles.statCard,
                            backgroundColor: '#000000',
                        color: '#D9D9D9',
                        border: '2px solid #D9D9D9'
                    }}>
                        <div style={overviewStyles.statNumber}>{totalMaterials}</div>
                        <div style={overviewStyles.statLabel}>Materials</div>
                            </div>
                    <div style={{
                        ...overviewStyles.statCard,
                        backgroundColor: '#111111',
                        color: '#D9D9D9',
                        border: '2px solid #D9D9D9'
                    }}>
                        <div style={overviewStyles.statNumber}>{totalFiles}</div>
                        <div style={overviewStyles.statLabel}>Files</div>
                    </div>
                </div>
            </div>

            {/* Steps Section */}
            <div style={overviewStyles.stepsSection}>
                <h2 style={overviewStyles.sectionTitle}>
                    Project Steps ({totalSteps})
                </h2>
                
                {projectSteps.length === 0 ? (
                    <div style={overviewStyles.emptyState}>
                        <div style={overviewStyles.emptyIcon}>📝</div>
                        <div style={overviewStyles.emptyText}>No steps defined yet</div>
                        <div style={overviewStyles.emptySubtext}>
                            Start by adding steps to your project
                        </div>
                    </div>
                ) : (
                    projectSteps.map((step, index) => (
                            <div 
                                key={step.id || index} 
                            style={overviewStyles.stepCard}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#F1C232';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(241, 194, 50, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#D9D9D9';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                            }}
                        >
                            {/* Step Header */}
                            <div style={overviewStyles.stepHeader}>
                                    <div style={{flex: 1}}>
                                    <h3 style={overviewStyles.stepTitle}>
                                        Step {index + 1}: {step.name}
                            </h3>
                                    <div style={overviewStyles.stepVideo}>
                                        Video {step.associated_video_index + 1}
                                </div>
                                    <div style={overviewStyles.stepTime}>
                                        {formatTime(step.video_start_time_ms / 1000)} - {formatTime(step.video_end_time_ms / 1000)}
                                        </div>
                                    </div>
                                    
                                <div style={{display: 'flex', gap: '10px'}}>
                                    {onEditStep && (
                                        <button
                                            onClick={() => onEditStep(step, index)}
                                            style={overviewStyles.editButton}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#D4AF37';
                                                e.target.style.transform = 'scale(1.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = '#F1C232';
                                                e.target.style.transform = 'scale(1)';
                                            }}
                                        >
                                            Edit Step
                                        </button>
                                    )}
                                    
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Are you sure you want to delete "Step ${index + 1}: ${step.name}"? This action cannot be undone.`)) {
                                                // We need to pass the delete function from the parent component
                                                if (onDeleteStep) {
                                                    onDeleteStep(index);
                                                }
                                            }
                                        }}
                                        style={{
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '8px 16px',
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#dc2626';
                                            e.target.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = '#ef4444';
                                            e.target.style.transform = 'scale(1)';
                                        }}
                                    >
                                        Delete Step
                                    </button>
                                </div>
                            </div>

                            {/* Step Content */}
                            <div style={overviewStyles.stepContent}>
                                <p style={overviewStyles.stepDescription}>
                                    {step.description}
                                </p>

                                {/* Notes Section */}
                                {(step.cautionary_notes || step.best_practice_notes) && (
                                    <div style={overviewStyles.notesContainer}>
                                        {step.cautionary_notes && (
                                            <div style={{
                                                ...overviewStyles.noteCard,
                                                ...overviewStyles.cautionNote
                                            }}>
                                                <div style={overviewStyles.noteTitle}>⚠️ Caution</div>
                                                <div style={overviewStyles.noteContent}>
                                                    {step.cautionary_notes}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {step.best_practice_notes && (
                                            <div style={{
                                                ...overviewStyles.noteCard,
                                                ...overviewStyles.bestPracticeNote
                                            }}>
                                                <div style={overviewStyles.noteTitle}>💡 Best Practice</div>
                                                <div style={overviewStyles.noteContent}>
                                                    {step.best_practice_notes}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Details Grid */}
                                <div style={overviewStyles.detailsGrid}>
                                    {/* Annotations */}
                                    {step.annotations?.length > 0 && (
                                        <div style={overviewStyles.detailCard}>
                                            <div style={overviewStyles.detailHeader}>
                                                <span style={overviewStyles.detailTitle}>Annotations</span>
                                                <span style={overviewStyles.detailCount}>{step.annotations.length}</span>
                                            </div>
                                            <div style={overviewStyles.detailContent}>
                                                <ul style={overviewStyles.detailList}>
                                                {step.annotations.map((ann, annIndex) => {
                                                    const annotationText = ann.component_name || ann.data?.text || 'Untitled annotation';
                                                    const annotationTimestamp = ann.frame_timestamp_ms || ann.data?.frame_timestamp_ms;
                                                    const annotationId = ann.annotation_id || ann.data?.id;
                                                    
                                                    return (
                                                            <li 
                                                                key={annotationId || `annotation-${annIndex}`}
                                                                style={{
                                                                    ...overviewStyles.detailItem,
                                                                    ...(annIndex === step.annotations.length - 1 ? overviewStyles.detailItemLast : {})
                                                                }}
                                                            >
                                                                <div style={overviewStyles.itemText}>
                                                                    <div style={overviewStyles.itemName}>{annotationText}</div>
                                                                    <div style={overviewStyles.itemSpec}>
                                                                        {formatTime(annotationTimestamp / 1000)}
                                                                    </div>
                                                                </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Tools */}
                                    {step.tools?.length > 0 && (
                                        <div style={overviewStyles.detailCard}>
                                            <div style={overviewStyles.detailHeader}>
                                                <span style={overviewStyles.detailTitle}>Tools</span>
                                                <span style={overviewStyles.detailCount}>{step.tools.length}</span>
                                            </div>
                                            <div style={overviewStyles.detailContent}>
                                                <ul style={overviewStyles.detailList}>
                                                    {step.tools.map((toolData, toolIndex) => {
                                                        // Handle both old format (direct tool object) and new format (nested with quantity)
                                                        const tool = toolData.tool || toolData;
                                                        const quantity = toolData.quantity || 1;
                                                        
                                                        return (
                                                            <li 
                                                                key={tool.id || tool.tool_id || `tool-${toolIndex}`}
                                                                style={{
                                                                    ...overviewStyles.detailItem,
                                                                    ...(toolIndex === step.tools.length - 1 ? overviewStyles.detailItemLast : {})
                                                                }}
                                                            >
                                                                {(tool.image_url || tool.image_path || tool.hasExistingImage || tool.image_file?.file_url) && (
                                                                    <div style={overviewStyles.itemImage}>
                                                                        <img 
                                                                            src={tool.image_url || tool.image_file?.file_url} 
                                                                    alt={tool.name}
                                                                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                                <div style={{
                                                                    display: 'none',
                                                                    fontSize: '10px',
                                                                            color: '#666',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            width: '100%',
                                                                            height: '100%'
                                                                        }}>🔧</div>
                                                            </div>
                                                        )}
                                                                <div style={overviewStyles.itemText}>
                                                                    <div style={overviewStyles.itemName}>
                                                                        {tool.name}
                                                                    </div>
                                                                    <div style={overviewStyles.itemQuantity}>
                                                                        Quantity: {quantity}
                                                                    </div>
                                                                    {tool.specification && (
                                                                        <div style={overviewStyles.itemSpec}>{tool.specification}</div>
                                                                    )}
                                                                </div>
                                            </li>
                                                        );
                                                    })}
                                    </ul>
                                            </div>
                                        </div>
                            )}
                                    
                                    {/* Materials */}
                            {step.materials?.length > 0 && (
                                        <div style={overviewStyles.detailCard}>
                                            <div style={overviewStyles.detailHeader}>
                                                <span style={overviewStyles.detailTitle}>Materials</span>
                                                <span style={overviewStyles.detailCount}>{step.materials.length}</span>
                                            </div>
                                            <div style={overviewStyles.detailContent}>
                                                <ul style={overviewStyles.detailList}>
                                                    {step.materials.map((materialData, matIndex) => {
                                                        // Handle both old format (direct material object) and new format (nested with quantity)
                                                        const material = materialData.material || materialData;
                                                        const quantity = materialData.quantity || 1;
                                                        
                                                        return (
                                                            <li 
                                                                key={material.id || material.material_id || `material-${matIndex}`}
                                                                style={{
                                                                    ...overviewStyles.detailItem,
                                                                    ...(matIndex === step.materials.length - 1 ? overviewStyles.detailItemLast : {})
                                                                }}
                                                            >
                                                                {(material.image_url || material.image_path || material.hasExistingImage || material.image_file?.file_url) && (
                                                                    <div style={overviewStyles.itemImage}>
                                                                        <img 
                                                                            src={material.image_url || material.image_file?.file_url} 
                                                                    alt={material.name}
                                                                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                                <div style={{
                                                                    display: 'none',
                                                                    fontSize: '10px',
                                                                            color: '#666',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            width: '100%',
                                                                            height: '100%'
                                                                        }}>📦</div>
                                                            </div>
                                                        )}
                                                                <div style={overviewStyles.itemText}>
                                                                    <div style={overviewStyles.itemName}>
                                                                        {material.name}
                                                                    </div>
                                                                    <div style={overviewStyles.itemQuantity}>
                                                                        Quantity: {quantity}
                                                                    </div>
                                                                    {material.specification && (
                                                                        <div style={overviewStyles.itemSpec}>{material.specification}</div>
                                                                    )}
                                                                </div>
                                            </li>
                                                        );
                                                    })}
                                    </ul>
                                            </div>
                                        </div>
                            )}
                                    
                                    {/* Files */}
                            {step.supplementary_files?.length > 0 && (
                                <div style={overviewStyles.detailCard}>
                                    <div style={overviewStyles.detailHeader}>
                                        <span style={overviewStyles.detailTitle}>Files</span>
                                        <span style={overviewStyles.detailCount}>{step.supplementary_files.length}</span>
                                    </div>
                                    <div style={overviewStyles.detailContent}>
                                        <ul style={overviewStyles.detailList}>
                                            {step.supplementary_files.map((file, fileIndex) => {
                                                const fileUrl = file.file?.file_url || file.file_url;
                                                const fileName = file.display_name || file.displayName || 'File';
                                                const isImage = fileUrl && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileUrl);
                                                return (
                                                    <li
                                                        key={file.id || `file-${fileIndex}`}
                                                        style={{
                                                            ...overviewStyles.detailItem,
                                                            ...(fileIndex === step.supplementary_files.length - 1 ? overviewStyles.detailItemLast : {})
                                                        }}
                                                    >
                                                        {isImage && fileUrl ? (
                                                            <div style={overviewStyles.itemImage}>
                                                                <img
                                                                    src={fileUrl}
                                                                    alt={fileName}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                                                    onError={e => { e.target.style.display = 'none'; }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div style={overviewStyles.itemImage}>
                                                                <div style={{
                                                                    fontSize: '2rem',
                                                                    color: '#F1C232',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: '100%',
                                                                    height: '100%'
                                                                }}>📄</div>
                                                            </div>
                                                        )}
                                                        <div style={overviewStyles.itemText}>
                                                            <div style={overviewStyles.itemName}>{fileName}</div>
                                                            {fileUrl && !isImage && (
                                                                <a
                                                                    href={fileUrl}
                                                                    download={fileName}
                                                                    style={{
                                                                        display: 'inline-block',
                                                                        marginTop: '6px',
                                                                        color: '#0000FF',
                                                                        background: '#18181b',
                                                                        border: '1.5px solid #F1C232',
                                                                        borderRadius: '6px',
                                                                        padding: '6px 16px',
                                                                        fontWeight: 600,
                                                                        textDecoration: 'none',
                                                                        fontSize: '1rem',
                                                                        transition: 'background 0.2s, color 0.2s',
                                                                    }}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    Download
                                                                </a>
                                                            )}
                                                            {file.file && (
                                                                <div style={overviewStyles.itemSpec}>
                                                                    {formatFileSize(file.file.file_size_bytes)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                    </div>
                                </div>
                            )}
                                    
                                    {/* Validation */}
                                    {step.validation_metric?.question && (
                                        <div style={overviewStyles.detailCard}>
                                            <div style={overviewStyles.detailHeader}>
                                                <span style={overviewStyles.detailTitle}>Validation</span>
                                            </div>
                                            <div style={overviewStyles.detailContent}>
                                                <div style={overviewStyles.itemText}>
                                                    <div style={overviewStyles.itemName}>Question:</div>
                                                    <div style={overviewStyles.itemSpec}>{step.validation_metric.question}</div>
                                                    <div style={{...overviewStyles.itemName, marginTop: '8px'}}>Expected Answer:</div>
                                                    <div style={overviewStyles.itemSpec}>{step.validation_metric.expected_answer}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Result Image */}
                                    {step.result_image_file_info && (
                                        <div style={overviewStyles.detailCard}>
                                            <div style={overviewStyles.detailHeader}>
                                                <span style={overviewStyles.detailTitle}>Result Image</span>
                                            </div>
                                            <div style={overviewStyles.detailContent}>
                                                {step.result_image_file_info.file_url || step.result_image_file_info.image_url ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                                        <img
                                                            src={step.result_image_file_info.file_url || step.result_image_file_info.image_url}
                                                            alt="Result"
                                                            style={{
                                                                width: '200px',
                                                                height: '200px',
                                                                objectFit: 'contain',
                                                                borderRadius: '12px',
                                                                border: '2px solid #F1C232',
                                                                background: '#18181b',
                                                                boxShadow: '0 2px 12px #0008',
                                                            }}
                                                            onError={e => { e.target.style.display = 'none'; }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div style={overviewStyles.itemText}>
                                                        <div style={overviewStyles.itemSpec}>No image available.</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                    </div>
                    ))
                )}
                </div>

            {/* Buy List Section */}
            {projectBuyList && projectBuyList.length > 0 && (
                <div style={overviewStyles.buyListSection}>
                    <h3 style={overviewStyles.buyListTitle}>
                        🛒 Shopping List ({projectBuyList.length} items)
                    </h3>
                    <div style={overviewStyles.buyListGrid}>
                        {projectBuyList.map((item, index) => {
                            
                            return (
                            <div 
                                key={item.id || index}
                                    style={overviewStyles.buyListItem}
                                >
                                {(item.image_url || item.image_path || item.hasExistingImage) && (
                                    <div style={overviewStyles.buyListImage}>
                                        <img 
                                            src={item.image_url} 
                                            alt={item.name}
                                            style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div style={{
                                            display: 'none',
                                            fontSize: '16px',
                                            color: '#666',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '100%',
                                            height: '100%'
                                        }}>🛒</div>
                                    </div>
                                )}
                                <div style={overviewStyles.buyListContent}>
                                    <div style={overviewStyles.buyListName}>{item.name}</div>
                                    {item.specification && (
                                        <div style={overviewStyles.buyListSpec}>{item.specification}</div>
                                    )}
                                    <div style={overviewStyles.buyListQuantity}>
                                        Quantity: {item.quantity}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    </div>
                </div>
            )}
    </div>
);
};

export default ProjectOverviewTab; 