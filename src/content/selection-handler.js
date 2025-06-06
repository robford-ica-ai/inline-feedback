/**
 * Selection Handler - Handles text selection and provides menu actions
 * Detects user selections and shows appropriate actions
 */
class SelectionHandler {
    constructor(extension) {
        this.extension = extension;
        this.logger = new Logger('SelectionHandler');
        this.uiFeedback = null;
        this.ontologyHighlighter = null;
        this.currentSelection = null;
        this.menuActions = [
            {
                action: 'medical-explain',
                text: 'Explain Medical Term',
                icon: 'ℹ️'
            },
            {
                action: 'medical-search',
                text: 'Search Medical Database',
                icon: '🔍'
            },
            {
                action: 'medical-save',
                text: 'Save to Research Notes',
                icon: '📝'
            }
        ];
    }

    // Initialize the selection handler
    init() {
        this.logger.debug('Initializing selection handler');
        
        // Get UI feedback component
        if (this.extension && this.extension.components) {
            this.uiFeedback = this.extension.components.get('uiFeedback');
            this.ontologyHighlighter = this.extension.components.get('ontologyHighlighter');
        }
        
        // Add event listeners
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('inlineFeedbackAction', this.handleAction.bind(this));
        
        this.logger.info('Selection handler initialized');
    }

    // Handle mouse up event
    handleMouseUp(event) {
        // Get selection
        const selection = window.getSelection();
        
        // Check if selection exists and is not empty
        if (selection && !selection.isCollapsed) {
            this.handleSelection(selection, event);
        }
    }

    // Handle key down event
    handleKeyDown(event) {
        // Check if escape key is pressed
        if (event.key === 'Escape') {
            // Clear selection
            window.getSelection().removeAllRanges();
            
            // Hide UI elements
            if (this.uiFeedback) {
                this.uiFeedback.hideAllUIElements();
            }
        }
    }

    // Handle selection
    handleSelection(selection, event) {
        // Get selected text
        const text = selection.toString().trim();
        
        // Check if text is not empty
        if (!text) return;
        
        // Store current selection
        this.currentSelection = {
            selection: selection,
            text: text,
            event: event
        };
        
        // Check if text is a medical term
        if (this.ontologyHighlighter && this.ontologyHighlighter.isMedicalTerm(text)) {
            // Show selection menu
            this.showSelectionMenu(selection, text);
        } else {
            // Check if text length is appropriate for showing menu
            if (text.length > 2 && text.length < 100) {
                // Show selection menu with limited actions
                this.showSelectionMenu(selection, text, this.getGeneralActions());
            }
        }
    }

    // Show selection menu
    showSelectionMenu(selection, text, actions = null) {
        // Check if UI feedback is available
        if (!this.uiFeedback) {
            this.logger.warn('UI feedback not available');
            return;
        }
        
        // Use provided actions or default menu actions
        const menuActions = actions || this.menuActions;
        
        // Show selection menu
        this.uiFeedback.showSelectionMenu(selection, text, menuActions);
    }

    // Handle action
    handleAction(event) {
        // Get action details
        const { action, text } = event.detail;
        
        this.logger.debug(`Handling action: ${action} for text: ${text}`);
        
        // Process action
        if (this.extension && this.extension.processSelection) {
            this.extension.processSelection(action, text, {
                selection: this.currentSelection,
                timestamp: new Date()
            });
        } else {
            this.logger.warn('Extension not available for processing selection');
        }
    }

    // Get menu actions
    getMenuActions() {
        return this.menuActions;
    }

    // Get general actions (for non-medical terms)
    getGeneralActions() {
        return [
            {
                action: 'general-search',
                text: 'Search',
                icon: '🔍'
            },
            {
                action: 'general-save',
                text: 'Save to Notes',
                icon: '📝'
            }
        ];
    }

    // Check if text is selected
    isTextSelected() {
        const selection = window.getSelection();
        return selection && !selection.isCollapsed;
    }

    // Get selected text
    getSelectedText() {
        if (this.isTextSelected()) {
            return window.getSelection().toString().trim();
        }
        return '';
    }

    // Select text in element
    selectText(element) {
        if (!element) return;
        
        const selection = window.getSelection();
        const range = document.createRange();
        
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Trigger selection handler
        this.handleSelection(selection);
    }
}

// Make available globally
window.SelectionHandler = SelectionHandler;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SelectionHandler;
}
