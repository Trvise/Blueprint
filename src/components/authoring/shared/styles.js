// Shared styles for authoring components
export const COLORS = {
    // New primary highlight color (Blue)
    primary: '#0000FF',
    // Accent color for company importance (Gold)
    accent: '#F1C232',
    // Secondary is still blue shade for subtle accents (could also be accent)
    secondary: '#0000FF',
    // Danger / success colors remain unchanged
    danger: '#dc2626',
    dangerBg: '#fecaca',
    success: '#10b981',
    successBg: '#d1fae5',
    // Off-white / gray palette adjusted to new text color scheme
    gray: {
        50: '#000000', // Background now black
        100: '#111111',
        200: '#222222',
        300: '#333333',
        400: '#444444',
        500: '#555555',
        600: '#666666',
        700: '#777777',
        800: '#888888',
        900: '#999999'
    },
    text: {
        primary: '#D9D9D9',
        secondary: '#D9D9D9',
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