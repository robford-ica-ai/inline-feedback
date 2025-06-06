/**
 * Debug Extension - Main debugging functionality for the Chrome extension
 * Provides tools for testing and debugging the extension components
 */

// Debug Extension Class
class DebugExtension {
    constructor() {
        this.initialized = false;
        this.components = new Map();
        this.testData = {};
        this.logger = null;
    }

    // Initialize the debug extension
    init() {
        console.log('Initializing Debug Extension...');
        
        // Create logger
        if (window.Logger) {
            this.logger = new Logger('DebugExtension');
            this.logger.setDebugMode(true);
        } else {
            console.warn('Logger not available, using console directly');
        }
        
        // Register event listeners
        this.registerEventListeners();
        
        // Set initialized flag
        this.initialized = true;
        
        this.log('Debug Extension initialized');
        
        return this;
    }

    // Register event listeners
    registerEventListeners() {
        // Listen for debug commands
        window.addEventListener('message', this.handleMessage.bind(this));
        
        // Listen for keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    // Handle messages
    handleMessage(event) {
        // Check if message is for debug extension
        if (event.data && event.data.type === 'debug-command') {
            this.log('Received debug command:', event.data);
            
            // Process command
            this.processCommand(event.data.command, event.data.params);
        }
    }

    // Handle keyboard shortcuts
    handleKeyDown(event) {
        // Check for debug keyboard shortcuts
        if (event.ctrlKey && event.shiftKey) {
            switch (event.key) {
                case 'D': // Ctrl+Shift+D - Toggle debug panel
                    event.preventDefault();
                    this.toggleDebugPanel();
                    break;
                case 'L': // Ctrl+Shift+L - Clear console
                    event.preventDefault();
                    console.clear();
                    this.log('Console cleared');
                    break;
                case 'R': // Ctrl+Shift+R - Reload extension
                    event.preventDefault();
                    this.reloadExtension();
                    break;
            }
        }
    }

    // Process debug command
    processCommand(command, params = {}) {
        this.log(`Processing command: ${command}`, params);
        
        switch (command) {
            case 'toggle-debug-panel':
                this.toggleDebugPanel();
                break;
            case 'reload-extension':
                this.reloadExtension();
                break;
            case 'test-selection':
                this.testSelection(params.text);
                break;
            case 'test-highlight':
                this.testHighlight(params.terms);
                break;
            case 'test-notification':
                this.testNotification(params.message, params.type);
                break;
            case 'get-component-status':
                return this.getComponentStatus();
            default:
                this.log(`Unknown command: ${command}`);
                return { success: false, error: `Unknown command: ${command}` };
        }
        
        return { success: true };
    }

    // Toggle debug panel
    toggleDebugPanel() {
        this.log('Toggling debug panel');
        
        // Check if debug panel exists
        let debugPanel = document.getElementById('inline-feedback-debug-panel');
        
        if (debugPanel) {
            // Toggle visibility
            if (debugPanel.style.display === 'none') {
                debugPanel.style.display = 'block';
                this.log('Debug panel shown');
            } else {
                debugPanel.style.display = 'none';
                this.log('Debug panel hidden');
            }
        } else {
            // Create debug panel
            this.createDebugPanel();
        }
    }

    // Create debug panel
    createDebugPanel() {
        this.log('Creating debug panel');
        
        // Create panel element
        const panel = document.createElement('div');
        panel.id = 'inline-feedback-debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            height: 400px;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
            z-index: 9999;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        `;
        
        // Create panel header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 10px;
            background-color: #f1f3f5;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        // Create panel title
        const title = document.createElement('h3');
        title.textContent = 'Inline Feedback Debug';
        title.style.margin = '0';
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
        `;
        closeButton.onclick = () => {
            panel.style.display = 'none';
        };
        
        // Add title and close button to header
        header.appendChild(title);
        header.appendChild(closeButton);
        
        // Create panel content
        const content = document.createElement('div');
        content.style.cssText = `
            flex: 1;
            padding: 10px;
            overflow-y: auto;
        `;
        
        // Create panel footer
        const footer = document.createElement('div');
        footer.style.cssText = `
            padding: 10px;
            background-color: #f1f3f5;
            border-top: 1px solid #dee2e6;
            display: flex;
            justify-content: space-between;
        `;
        
        // Create action buttons
        const reloadButton = document.createElement('button');
        reloadButton.textContent = 'Reload';
        reloadButton.onclick = () => {
            this.reloadExtension();
        };
        
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear Console';
        clearButton.onclick = () => {
            console.clear();
            this.log('Console cleared');
        };
        
        // Add buttons to footer
        footer.appendChild(reloadButton);
        footer.appendChild(clearButton);
        
        // Add components to panel
        panel.appendChild(header);
        panel.appendChild(content);
        panel.appendChild(footer);
        
        // Add panel to document
        document.body.appendChild(panel);
        
        // Populate content
        this.updateDebugPanelContent(content);
        
        this.log('Debug panel created');
    }

    // Update debug panel content
    updateDebugPanelContent(contentElement) {
        // Clear content
        contentElement.innerHTML = '';
        
        // Add component status
        const statusSection = document.createElement('div');
        statusSection.innerHTML = '<h4>Component Status</h4>';
        
        const statusList = document.createElement('ul');
        
        // Get component status
        const status = this.getComponentStatus();
        
        for (const [name, isActive] of Object.entries(status.components)) {
            const item = document.createElement('li');
            item.textContent = `${name}: ${isActive ? '✅ Active' : '❌ Inactive'}`;
            statusList.appendChild(item);
        }
        
        statusSection.appendChild(statusList);
        contentElement.appendChild(statusSection);
        
        // Add test actions
        const actionsSection = document.createElement('div');
        actionsSection.innerHTML = '<h4>Test Actions</h4>';
        
        // Test selection
        const testSelectionDiv = document.createElement('div');
        testSelectionDiv.style.marginBottom = '10px';
        
        const testSelectionInput = document.createElement('input');
        testSelectionInput.type = 'text';
        testSelectionInput.placeholder = 'Enter text to test';
        testSelectionInput.style.width = '70%';
        
        const testSelectionButton = document.createElement('button');
        testSelectionButton.textContent = 'Test';
        testSelectionButton.style.marginLeft = '5px';
        testSelectionButton.onclick = () => {
            this.testSelection(testSelectionInput.value);
        };
        
        testSelectionDiv.appendChild(testSelectionInput);
        testSelectionDiv.appendChild(testSelectionButton);
        
        actionsSection.appendChild(testSelectionDiv);
        contentElement.appendChild(actionsSection);
    }

    // Reload extension
    reloadExtension() {
        this.log('Reloading extension');
        
        // Clear existing components
        this.components.clear();
        
        // Reload page
        window.location.reload();
    }

    // Test selection
    testSelection(text) {
        this.log(`Testing selection: "${text}"`);
        
        // Check if text is provided
        if (!text) {
            this.log('No text provided for testing');
            return { success: false, error: 'No text provided' };
        }
        
        // Get extension
        const extension = window.InlineFeedbackExtension;
        
        if (!extension) {
            this.log('Extension not available');
            return { success: false, error: 'Extension not available' };
        }
        
        // Process selection
        if (extension.processSelection) {
            extension.processSelection('test-selection', text, {
                timestamp: new Date()
            });
            
            this.log('Selection processed');
            return { success: true };
        } else {
            this.log('processSelection method not available');
            return { success: false, error: 'processSelection method not available' };
        }
    }

    // Test highlight
    testHighlight(terms) {
        this.log('Testing highlight', terms);
        
        // Check if terms are provided
        if (!terms || !Array.isArray(terms) || terms.length === 0) {
            this.log('No terms provided for testing');
            return { success: false, error: 'No terms provided' };
        }
        
        // Get extension
        const extension = window.InlineFeedbackExtension;
        
        if (!extension) {
            this.log('Extension not available');
            return { success: false, error: 'Extension not available' };
        }
        
        // Get ontology highlighter
        const highlighter = extension.components.get('ontologyHighlighter');
        
        if (!highlighter) {
            this.log('Ontology highlighter not available');
            return { success: false, error: 'Ontology highlighter not available' };
        }
        
        // Highlight terms
        highlighter.highlightTerms(terms);
        
        this.log('Terms highlighted');
        return { success: true };
    }

    // Test notification
    testNotification(message, type = 'info') {
        this.log(`Testing notification: "${message}" (${type})`);
        
        // Check if message is provided
        if (!message) {
            this.log('No message provided for testing');
            return { success: false, error: 'No message provided' };
        }
        
        // Get extension
        const extension = window.InlineFeedbackExtension;
        
        if (!extension) {
            this.log('Extension not available');
            return { success: false, error: 'Extension not available' };
        }
        
        // Get UI feedback
        const uiFeedback = extension.components.get('uiFeedback');
        
        if (!uiFeedback) {
            this.log('UI feedback not available');
            return { success: false, error: 'UI feedback not available' };
        }
        
        // Show notification
        uiFeedback.showNotification(message, type);
        
        this.log('Notification shown');
        return { success: true };
    }

    // Get component status
    getComponentStatus() {
        this.log('Getting component status');
        
        const status = {
            extension: false,
            components: {}
        };
        
        // Check if extension is available
        const extension = window.InlineFeedbackExtension;
        
        if (extension) {
            status.extension = true;
            
            // Check components
            if (extension.components) {
                for (const [name, component] of extension.components.entries()) {
                    status.components[name] = !!component;
                }
            }
        }
        
        this.log('Component status:', status);
        return status;
    }

    // Log message
    log(message, ...args) {
        if (this.logger) {
            this.logger.info(message, ...args);
        } else {
            console.log(`[DebugExtension] ${message}`, ...args);
        }
    }
}

// Initialize debug extension
window.debugExtension = new DebugExtension().init();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.debugExtension;
}
