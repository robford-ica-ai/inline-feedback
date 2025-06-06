/**
 * Inline Feedback Extension - Main Content Script
 * Initializes and coordinates all extension components
 */
class InlineFeedbackExtension {
    constructor() {
        this.logger = new Logger('InlineFeedbackExtension');
        this.components = new Map();
        this.config = {
            enabled: true,
            highlightMedicalTerms: true,
            enableSelectionMenu: true,
            debugMode: false
        };
    }

    async init() {
        this.logger.info('Initializing Inline Feedback Extension');
        
        try {
            // Load configuration
            await this.loadConfig();
            
            // Initialize components
            await this.initializeComponents();
            
            // Set up message listeners
            this.setupMessageListeners();
            
            // Set global reference
            window.inlineFeedbackExtension = this;
            
            this.logger.info('Extension initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize extension:', error);
        }
    }

    async loadConfig() {
        this.logger.debug('Loading configuration');
        
        try {
            // Try to load from storage
            if (chrome.storage && chrome.storage.local) {
                return new Promise((resolve) => {
                    chrome.storage.local.get(['inlineFeedbackConfig'], (result) => {
                        if (result.inlineFeedbackConfig) {
                            this.config = { ...this.config, ...result.inlineFeedbackConfig };
                            this.logger.debug('Loaded configuration from storage');
                        } else {
                            this.logger.debug('No saved configuration found, using defaults');
                        }
                        
                        // Apply debug mode to logger
                        this.logger.setDebugMode(this.config.debugMode);
                        
                        resolve();
                    });
                });
            }
        } catch (error) {
            this.logger.warn('Failed to load configuration from storage:', error);
        }
        
        this.logger.debug('Using default configuration');
    }

    async saveConfig() {
        this.logger.debug('Saving configuration');
        
        try {
            if (chrome.storage && chrome.storage.local) {
                return new Promise((resolve) => {
                    chrome.storage.local.set({ inlineFeedbackConfig: this.config }, () => {
                        this.logger.debug('Configuration saved to storage');
                        resolve();
                    });
                });
            }
        } catch (error) {
            this.logger.warn('Failed to save configuration to storage:', error);
        }
    }

    async initializeComponents() {
        this.logger.debug('Initializing components');
        
        try {
            // Initialize UI Feedback system
            const uiFeedback = new UIFeedback();
            await uiFeedback.init();
            this.components.set('uiFeedback', uiFeedback);
            
            // Initialize Selection Handler
            const selectionHandler = new SelectionHandler(this);
            await selectionHandler.init();
            this.components.set('selectionHandler', selectionHandler);
            
            // Initialize Ontology Highlighter if enabled
            if (this.config.highlightMedicalTerms) {
                // Make sure ontology is loaded
                if (!window.EnhancedMedicalOntology) {
                    this.logger.debug('Loading medical ontology');
                    await this.loadOntology();
                }
                
                const ontologyHighlighter = new OntologyHighlighter(window.EnhancedMedicalOntology);
                await ontologyHighlighter.init();
                this.components.set('ontologyHighlighter', ontologyHighlighter);
                
                // Scan the document for medical terms
                ontologyHighlighter.highlightDocument();
            }
            
            this.logger.info('All components initialized');
        } catch (error) {
            this.logger.error('Failed to initialize components:', error);
            throw error;
        }
    }

    async loadOntology() {
        this.logger.debug('Loading medical ontology');
        
        try {
            // Check if already loaded
            if (window.EnhancedMedicalOntology) {
                this.logger.debug('Medical ontology already loaded');
                return;
            }
            
            // Try to load from extension resources
            const ontologyScript = document.createElement('script');
            ontologyScript.src = chrome.runtime.getURL('ontology/enhanced-medical-ontology.js');
            
            const evidenceScript = document.createElement('script');
            evidenceScript.src = chrome.runtime.getURL('ontology/research-evidence-db.js');
            
            // Wait for scripts to load
            await new Promise((resolve) => {
                let loaded = 0;
                const checkLoaded = () => {
                    loaded++;
                    if (loaded === 2) resolve();
                };
                
                ontologyScript.onload = checkLoaded;
                evidenceScript.onload = checkLoaded;
                
                document.head.appendChild(ontologyScript);
                document.head.appendChild(evidenceScript);
            });
            
            this.logger.info('Medical ontology loaded successfully');
        } catch (error) {
            this.logger.error('Failed to load medical ontology:', error);
            
            // Create a basic fallback ontology
            window.EnhancedMedicalOntology = {
                getBiomaterials: () => ({
                    titanium: {
                        name: 'Titanium',
                        category: 'metal',
                        regex: /\b(titanium|Ti-6Al-4V)\b/gi
                    },
                    peek: {
                        name: 'PEEK',
                        category: 'polymer',
                        regex: /\b(PEEK|polyetheretherketone)\b/gi
                    },
                    nitinol: {
                        name: 'Nitinol',
                        category: 'shape_memory_alloy',
                        regex: /\b(nitinol|NiTi)\b/gi
                    }
                })
            };
            
            this.logger.warn('Using fallback basic ontology');
        }
    }

    setupMessageListeners() {
        this.logger.debug('Setting up message listeners');
        
        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.logger.debug('Received message:', message);
            
            if (message.action === 'getStatus') {
                sendResponse({
                    enabled: this.config.enabled,
                    components: Array.from(this.components.keys()),
                    highlightStats: this.getHighlightStats()
                });
            } else if (message.action === 'toggleHighlighting') {
                this.toggleHighlighting(message.enabled);
                sendResponse({ success: true });
            } else if (message.action === 'toggleDebugMode') {
                this.toggleDebugMode(message.enabled);
                sendResponse({ success: true });
            }
            
            return true; // Keep the message channel open for async response
        });
    }

    getHighlightStats() {
        const highlighter = this.components.get('ontologyHighlighter');
        if (!highlighter) return { enabled: false, count: 0 };
        
        return highlighter.getHighlightStats();
    }

    toggleHighlighting(enabled) {
        this.logger.info(`${enabled ? 'Enabling' : 'Disabling'} medical term highlighting`);
        
        this.config.highlightMedicalTerms = enabled;
        this.saveConfig();
        
        const highlighter = this.components.get('ontologyHighlighter');
        
        if (enabled && !highlighter) {
            // Re-initialize highlighter
            this.loadOntology().then(() => {
                const newHighlighter = new OntologyHighlighter(window.EnhancedMedicalOntology);
                newHighlighter.init().then(() => {
                    this.components.set('ontologyHighlighter', newHighlighter);
                    newHighlighter.highlightDocument();
                });
            });
        } else if (!enabled && highlighter) {
            // Remove highlights and destroy highlighter
            highlighter.removeHighlights();
            highlighter.destroy();
            this.components.delete('ontologyHighlighter');
        }
    }

    toggleDebugMode(enabled) {
        this.logger.info(`${enabled ? 'Enabling' : 'Disabling'} debug mode`);
        
        this.config.debugMode = enabled;
        this.saveConfig();
        
        // Update logger debug mode
        this.logger.setDebugMode(enabled);
        
        // Update component loggers
        for (const component of this.components.values()) {
            if (component.logger) {
                component.logger.setDebugMode(enabled);
            }
        }
    }

    processSelection(action, text) {
        this.logger.debug(`Processing selection action: ${action} for text: ${text.substring(0, 30)}...`);
        
        // Handle different actions
        switch (action) {
            case 'explain':
                this.explainText(text);
                break;
            case 'translate':
                this.translateText(text);
                break;
            case 'medical-explain':
                this.explainMedicalTerm(text);
                break;
            case 'technical-explain':
                this.explainTechnicalTerm(text);
                break;
            case 'summarize':
                this.summarizeText(text);
                break;
            default:
                this.logger.warn(`Unknown action: ${action}`);
        }
    }

    explainText(text) {
        this.logger.debug('Explaining text');
        
        // Send message to background script for processing
        chrome.runtime.sendMessage({
            action: 'processText',
            type: 'explain',
            text: text
        }, (response) => {
            if (response && response.success) {
                this.logger.debug('Explanation request sent successfully');
            } else {
                this.logger.warn('Failed to send explanation request');
            }
        });
    }

    translateText(text) {
        this.logger.debug('Translating text');
        
        // Send message to background script for processing
        chrome.runtime.sendMessage({
            action: 'processText',
            type: 'translate',
            text: text
        });
    }

    explainMedicalTerm(text) {
        this.logger.debug('Explaining medical term');
        
        // Try to find the term in the ontology
        let termInfo = null;
        
        if (window.EnhancedMedicalOntology) {
            termInfo = window.EnhancedMedicalOntology.findMaterial(text);
        }
        
        // Send message to background script for processing
        chrome.runtime.sendMessage({
            action: 'processText',
            type: 'medical-explain',
            text: text,
            context: {
                termInfo: termInfo
            }
        });
    }

    explainTechnicalTerm(text) {
        this.logger.debug('Explaining technical term');
        
        // Send message to background script for processing
        chrome.runtime.sendMessage({
            action: 'processText',
            type: 'technical-explain',
            text: text
        });
    }

    summarizeText(text) {
        this.logger.debug('Summarizing text');
        
        // Send message to background script for processing
        chrome.runtime.sendMessage({
            action: 'processText',
            type: 'summarize',
            text: text
        });
    }
}

// Initialize the extension when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create and initialize the extension
    const extension = new InlineFeedbackExtension();
    extension.init();
});

// Also initialize if document is already loaded (for dynamic injection)
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    const extension = new InlineFeedbackExtension();
    extension.init();
}
