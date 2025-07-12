// Repository component styles
export const repositoryStyles = {
  // Main layout
  container: "min-h-screen bg-black p-6",
  maxWidth: "max-w-7xl mx-auto",
  
  // Header
  header: {
    container: "mb-8",
    title: "text-3xl font-bold text-[#F1C232] mb-2",
    subtitle: "text-[#D9D9D9]"
  },
  
  // Repository tabs
  tabs: {
    container: "bg-black rounded-lg shadow-sm mb-6 border border-[#D9D9D9]",
    tabsWrapper: "flex border-b border-[#D9D9D9]",
    tab: {
      base: "px-6 py-4 font-medium transition-colors text-[#D9D9D9]",
      active: "text-[#000000] border-b-2 border-[#F1C232] bg-[#F1C232]",
      inactive: "text-[#D9D9D9] hover:text-[#F1C232]"
    },
    content: "p-6"
  },
  
  // Search and controls
  controls: {
    container: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6",
    searchWrapper: "relative flex-1 max-w-md",
    searchIcon: "absolute left-3 top-1/2 transform -translate-y-1/2 text-[#F1C232]",
    searchInput: "w-full pl-10 pr-4 py-2 bg-black border border-[#D9D9D9] rounded-lg focus:ring-2 focus:ring-[#0000FF] focus:border-[#0000FF] text-[#D9D9D9] placeholder-[#D9D9D9]",
    addButton: "bg-[#F1C232] text-black px-4 py-2 rounded-lg hover:bg-[#0000FF] hover:text-[#D9D9D9] transition-colors flex items-center gap-2 whitespace-nowrap"
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
    spinner: "animate-spin rounded-full h-8 w-8 border-b-2 border-[#F1C232]",
    text: "ml-3 text-[#D9D9D9]"
  },
  
  // Items grid
  grid: {
    container: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
    card: {
      base: "bg-black border border-[#D9D9D9] rounded-lg p-4 hover:shadow-lg hover:bg-[#222222] transition-all",
      image: "w-full h-32 object-cover rounded-lg mb-3",
      title: "font-semibold text-[#F1C232] mb-2",
      specification: "text-sm text-[#D9D9D9] mb-2",
      purchaseLink: "text-[#0000FF] text-sm hover:underline block mb-2",
      actionsContainer: "flex justify-end space-x-2 pt-2 border-t border-[#D9D9D9]",
      actionButton: "text-[#D9D9D9] p-1 transition-colors",
      editButton: "hover:text-[#0000FF]",
      deleteButton: "hover:text-red-400"
    }
  },
  
  // Empty state
  emptyState: {
    container: "col-span-full text-center py-12 text-[#D9D9D9]",
    icon: "mx-auto text-[#F1C232]",
    iconContainer: "mb-4",
    title: "text-lg font-medium mb-2 text-[#F1C232]",
    message: "mb-4 text-[#D9D9D9]",
    button: "bg-[#F1C232] text-black px-4 py-2 rounded-lg hover:bg-[#0000FF] hover:text-[#D9D9D9] transition-colors"
  },
  
  // Modal base
  modal: {
    overlay: "fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4",
    container: "bg-black border border-[#D9D9D9] rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto",
    header: "flex justify-between items-center mb-4",
    title: "text-lg font-semibold text-[#F1C232]",
    closeButton: "text-[#D9D9D9] hover:text-[#F1C232]",
    content: "space-y-4",
    footer: "flex justify-end space-x-3 mt-6"
  },
  
  // Form elements
  form: {
    label: "block text-sm font-medium text-[#D9D9D9] mb-1",
    input: "w-full bg-black border border-[#D9D9D9] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0000FF] focus:border-[#0000FF] text-[#D9D9D9] placeholder-[#D9D9D9]",
    textarea: "w-full bg-black border border-[#D9D9D9] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0000FF] focus:border-[#0000FF] text-[#D9D9D9] placeholder-[#D9D9D9]",
    fileInputWrapper: "flex items-center space-x-3",
    fileInputHidden: "hidden",
    fileInputLabel: "flex items-center gap-2 px-3 py-2 bg-black border border-[#D9D9D9] rounded-lg cursor-pointer hover:bg-[#222222] text-[#D9D9D9]",
    fileName: "text-sm text-[#D9D9D9]",
    helpText: "text-xs text-[#D9D9D9] mt-1",
    imagePreview: "w-full h-32 object-cover rounded-lg border border-[#D9D9D9]"
  },
  
  // Buttons
  buttons: {
    cancel: "px-4 py-2 text-[#D9D9D9] bg-black border border-[#D9D9D9] rounded-lg hover:bg-[#222222]",
    primary: "px-4 py-2 bg-[#F1C232] text-black rounded-lg hover:bg-[#0000FF] hover:text-[#D9D9D9] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
    danger: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700",
    spinner: "animate-spin rounded-full h-4 w-4 border-b-2 border-[#F1C232]"
  }
}; 