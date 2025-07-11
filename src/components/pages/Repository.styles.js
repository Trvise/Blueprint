// Repository component styles
export const repositoryStyles = {
  // Main layout
  container: "min-h-screen bg-black p-6",
  maxWidth: "max-w-7xl mx-auto",
  
  // Header
  header: {
    container: "mb-8",
    title: "text-3xl font-bold text-white mb-2",
    subtitle: "text-gray-300"
  },
  
  // Repository tabs
  tabs: {
    container: "bg-gray-900 rounded-lg shadow-sm mb-6 border border-gray-700",
    tabsWrapper: "flex border-b border-gray-700",
    tab: {
      base: "px-6 py-4 font-medium transition-colors",
      active: "text-blue-400 border-b-2 border-blue-400 bg-gray-800",
      inactive: "text-gray-300 hover:text-white"
    },
    content: "p-6"
  },
  
  // Search and controls
  controls: {
    container: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6",
    searchWrapper: "relative flex-1 max-w-md",
    searchIcon: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
    searchInput: "w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400",
    addButton: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
  },
  
  // Error display
  error: {
    container: "bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6",
    title: "font-medium",
    message: "text-sm mt-1",
    details: "text-sm mt-2",
    code: "bg-red-800 px-1 rounded text-red-200",
    retryButton: "mt-3 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
  },
  
  // Loading
  loading: {
    container: "flex justify-center items-center py-12",
    spinner: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400",
    text: "ml-3 text-gray-300"
  },
  
  // Items grid
  grid: {
    container: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
    card: {
      base: "bg-gray-800 border border-gray-600 rounded-lg p-4 hover:shadow-lg hover:bg-gray-700 transition-all",
      image: "w-full h-32 object-cover rounded-lg mb-3",
      title: "font-semibold text-white mb-2",
      specification: "text-sm text-gray-300 mb-2",
      purchaseLink: "text-blue-400 text-sm hover:underline block mb-2",
      actionsContainer: "flex justify-end space-x-2 pt-2 border-t border-gray-600",
      actionButton: "text-gray-400 p-1 transition-colors",
      editButton: "hover:text-blue-400",
      deleteButton: "hover:text-red-400"
    }
  },
  
  // Empty state
  emptyState: {
    container: "col-span-full text-center py-12 text-gray-400",
    icon: "mx-auto text-gray-500",
    iconContainer: "mb-4",
    title: "text-lg font-medium mb-2 text-gray-300",
    message: "mb-4 text-gray-400",
    button: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
  },
  
  // Modal base
  modal: {
    overlay: "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4",
    container: "bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto",
    header: "flex justify-between items-center mb-4",
    title: "text-lg font-semibold text-white",
    closeButton: "text-gray-400 hover:text-gray-200",
    content: "space-y-4",
    footer: "flex justify-end space-x-3 mt-6"
  },
  
  // Form elements
  form: {
    label: "block text-sm font-medium text-gray-300 mb-1",
    input: "w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400",
    textarea: "w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400",
    fileInputWrapper: "flex items-center space-x-3",
    fileInputHidden: "hidden",
    fileInputLabel: "flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 text-gray-300",
    fileName: "text-sm text-gray-300",
    helpText: "text-xs text-gray-400 mt-1",
    imagePreview: "w-full h-32 object-cover rounded-lg border border-gray-600"
  },
  
  // Buttons
  buttons: {
    cancel: "px-4 py-2 text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700",
    primary: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
    danger: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700",
    spinner: "animate-spin rounded-full h-4 w-4 border-b-2 border-white"
  }
}; 