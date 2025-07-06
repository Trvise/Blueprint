// Shared styles for authoring components
export const COLORS = {
    primary: '#3b82f6',
    secondary: '#64748b',
    danger: '#dc2626',
    dangerBg: '#fecaca',
    success: '#10b981',
    successBg: '#d1fae5',
    gray: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a'
    },
    text: {
        primary: '#374151',
        secondary: '#6b7280',
        muted: '#9ca3af'
    }
};

export const SPACING = {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px'
};

export const TYPOGRAPHY = {
    helpText: {
        fontSize: '0.8rem',
        color: COLORS.text.secondary,
        marginTop: SPACING.xs,
        fontStyle: 'italic'
    },
    sectionDescription: {
        fontSize: '0.9rem',
        color: COLORS.text.secondary,
        marginBottom: SPACING.lg
    },
    listTitle: {
        fontSize: '0.9rem',
        fontWeight: '500',
        marginBottom: SPACING.sm
    }
};

export const COMPONENTS = {
    emptyState: {
        marginTop: SPACING.lg,
        padding: SPACING.lg,
        backgroundColor: COLORS.gray[50],
        border: `1px dashed ${COLORS.gray[300]}`,
        borderRadius: '8px',
        textAlign: 'center'
    },
    emptyStateText: {
        margin: 0,
        color: COLORS.text.secondary,
        fontStyle: 'italic'
    },
    fileList: {
        border: `1px solid ${COLORS.gray[200]}`,
        borderRadius: '8px',
        backgroundColor: COLORS.gray[50]
    },
    fileListItem: {
        padding: `${SPACING.md} ${SPACING.lg}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    fileListItemTitle: {
        margin: 0,
        fontWeight: '500',
        color: COLORS.text.primary
    },
    fileListItemSubtext: {
        margin: `${SPACING.xs} 0 0 0`,
        fontSize: '0.8rem',
        color: COLORS.text.secondary
    },
    removeButton: {
        backgroundColor: COLORS.dangerBg,
        color: COLORS.danger,
        border: 'none',
        borderRadius: '4px',
        padding: `6px ${SPACING.md}`,
        fontSize: '0.8rem',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'background-color 0.2s',
        ':hover': {
            backgroundColor: '#fca5a5'
        }
    },
    timeDisplay: {
        padding: SPACING.md,
        backgroundColor: COLORS.gray[50],
        borderRadius: '8px',
        border: `1px solid ${COLORS.gray[200]}`
    },
    gridTwoColumns: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: SPACING.lg
    },
    flexColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: SPACING.xl
    }
};

export const LAYOUT = {
    sectionSpacing: SPACING.xl,
    cardPadding: SPACING.xl,
    inputSpacing: SPACING.sm
};

// Helper function to create consistent file size formatting
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Helper function for consistent item borders in lists
export const getListItemBorder = (index, totalItems) => ({
    borderBottom: index < totalItems - 1 ? `1px solid ${COLORS.gray[200]}` : 'none'
}); 