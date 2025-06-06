/**
 * Load Debug Tools - Loads the extension's debug tools for testing
 * This script is used to load and initialize the extension components in a test environment
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Inline Feedback Debug Tools...');
    
    // Load required scripts
    loadScript('src/content/logger.js')
        .then(() => loadScript('console-debug.js'))
        .then(() => loadScript('src/ontology/base-ontology.js'))
        .then(() => loadScript('src/ontology/medical-materials.js'))
        .then(() => loadScript('src/ontology/medical-devices.js'))
        .then(() => loadScript('src/ontology/enhanced-medical-ontology.js'))
        .then(() => loadScript('src/content/ui-feedback.js'))
        .then(() => loadScript('src/content/ontology-highlighter.js'))
        .then(() => loadScript('src/content/selection-handler.js'))
        .then(() => {
            // Initialize extension components
            initializeExtension();
        })
        .catch(error => {
            console.error('Error loading debug tools:', error);
        });
});

// Load script function
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

// Initialize extension components
function initializeExtension() {
    // Create extension object
    window.InlineFeedbackExtension = {
        components: new Map(),
        
        // Process selection
        processSelection(action, text, context) {
            console.log(`Processing selection: ${action} for "${text}"`, context);
        }
    };
    
    const extension = window.InlineFeedbackExtension;
    
    // Create and initialize components
    const uiFeedback = new UIFeedback(extension);
    extension.components.set('uiFeedback', uiFeedback);
    uiFeedback.init();
    
    const ontologyHighlighter = new OntologyHighlighter(extension);
    extension.components.set('ontologyHighlighter', ontologyHighlighter);
    ontologyHighlighter.init();
    
    const selectionHandler = new SelectionHandler(extension);
    extension.components.set('selectionHandler', selectionHandler);
    selectionHandler.init();
    
    // Log initialized components
    console.log('Components initialized:', extension.components);
    
    // Process page
    ontologyHighlighter.processPage();
    
    console.log('Inline Feedback Debug Tools initialized');
}
