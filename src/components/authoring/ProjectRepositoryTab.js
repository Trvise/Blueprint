import React from 'react';
import RepositoryPanel from './RepositoryPanel';

const ProjectRepositoryTab = ({ onRepositoryUpdate }) => {
    return <RepositoryPanel contextType="project" onRepositoryUpdate={onRepositoryUpdate} />;
};

export default ProjectRepositoryTab;