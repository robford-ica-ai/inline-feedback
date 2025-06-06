/**
 * Inline Feedback - Main Content Script
 * Orchestrates all extension functionality in PDF and web pages
 */

class InlineFeedbackExtension {
    constructor() {
        this.initialized = false;
        this.components = new Map();
        this.config = null;
        this.logger = new Logger('InlineFeedback');
    }

    async init() {
        if (this.initialized) return;

        try {
            // Check if we should activate on this page
            if (!this.shouldActivate()) {
                this.logger.debug('Page not suitable for activation');
                return;
            }

            this.logger.info('Initializing Inline Feedback Extension...');

            // Load configuration
            this.config = await this.loadConfig();

            // Initialize core components
            await this.initializeComponents();

            // Set up event listeners
            this.setupEventListeners();

            // Start ontology highlighting
            if (this.config.ontologyEnabled) {
                this.components.get('ontologyHighlighter').highlightDocument();
            }

            // Show activation indicator
            this.showActivationMessage();

            this.initialized = true;
            this.logger.info('Extension initialized successfully');

        } catch (error) {
            this.logger.error('Failed to initialize extension:', error);
            throw new ExtensionError('Initialization failed', error);
        }
    }

    shouldActivate() {
    // Activate on PDF pages
        if (this.isPDFPage()) return true;

        // Activate on pages with substantial text content
        const textLength = document.body?.textContent?.trim().length || 0;
        if (textLength > 500) return true;

        // Skip on certain pages
        const skipDomains = ['chrome://', 'chrome-extension://', 'moz-extension://'];
        if (skipDomains.some(domain => window.location.href.startsWith(domain))) {
            return false;
        }

        return false;
    }

    isPDFPage() {
        return (
            document.contentType === 'application/pdf' ||
      window.location.href.endsWith('.pdf') ||
      document.querySelector('embed[type="application/pdf"]') !== null ||
      document.querySelector('#viewerContainer') !== null // PDF.js
        );
    }

    async loadConfig() {
        try {
            const stored = await chrome.storage.local.get(['config']);
            const config = stored.config || {};

            return {
                claudeApiKey: config.claudeApiKey || null,
                model: config.model || 'claude-3-sonnet-20240229',
                autoTranslate: config.autoTranslate || false,
                ontologyEnabled: config.ontologyEnabled !== false, // default true
                debugMode: config.debugMode || false
            };
        } catch (error) {
            this.logger.error('Failed to load config:', error);
            return {};
        }
    }

    async initializeComponents() {
        // Define available components
        const componentFactories = {
            'uiFeedback': () => typeof UIFeedback !== 'undefined' ? new UIFeedback() : null,
            'ontologyHighlighter': () => typeof OntologyHighlighter !== 'undefined' ? 
                new OntologyHighlighter(window.MedicalMaterialsOntology || window.EnhancedMedicalOntology) : null,
            'selectionHandler': () => typeof SelectionHandler !== 'undefined' ? new SelectionHandler(this) : null
        };

        // Only initialize PDF extractor on PDF pages
        if (this.isPDFPage() && typeof PDFExtractor !== 'undefined') {
            componentFactories['pdfExtractor'] = () => new PDFExtractor();
        }

        // Initialize components with robust error handling
        for (const [name, factory] of Object.entries(componentFactories)) {
            try {
                const component = factory();
                if (!component) {
                    this.logger.warn(`Component ${name} not available, skipping...`);
                    continue;
                }

                if (component.init) {
                    await component.init();
                }
                this.components.set(name, component);
                this.logger.debug(`Component ${name} initialized successfully`);
            } catch (error) {
                this.logger.error(`Failed to initialize ${name}:`, error);
                // Don't throw - continue with other components
                continue;
            }
        }

        // Ensure we have at least some basic functionality
        if (this.components.size === 0) {
            this.logger.warn('No components initialized, extension will have limited functionality');
        }
    }

    setupEventListeners() {
    // Listen for messages from background script
        chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));

        // Selection handling
        document.addEventListener('mouseup', this.handleSelection.bind(this));

        // Auto-translation on hover (if enabled)
        if (this.config.autoTranslate) {
            this.setupHoverTranslation();
        }
    }

    handleMessage(request, sender, sendResponse) {
        switch (request.action) {
        case 'process-selection':
            this.processSelection(request.type, request.text);
            break;
        case 'keyboard-command':
            this.handleKeyboardCommand(request.command);
            break;
        default:
            this.logger.warn('Unknown message action:', request.action);
        }
    }

    handleKeyboard(e) {
    // Cmd/Ctrl + Shift + T = Quick translate
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            this.quickTranslateSelection();
        }

        // Cmd/Ctrl + Shift + E = Explain
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            this.explainSelection();
        }
    }

    handleSelection(e) {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text.length > 0 && text.length < 500) {
            const selectionHandler = this.components.get('selectionHandler');
            if (selectionHandler && selectionHandler.showSelectionMenu) {
                try {
                    selectionHandler.showSelectionMenu(selection, text);
                } catch (error) {
                    this.logger.debug('Selection handler failed:', error);
                    // Fallback: basic context menu
                    this.showBasicSelectionMenu(selection, text);
                }
            } else {
                // Fallback: basic context menu
                this.showBasicSelectionMenu(selection, text);
            }
        }
    }

    showBasicSelectionMenu(selection, text) {
        // Simple fallback context menu
        const menu = document.createElement('div');
        menu.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: -apple-system, system-ui, sans-serif;
            font-size: 14px;
        `;
        
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        menu.style.top = (rect.bottom + window.scrollY + 5) + 'px';
        menu.style.left = (rect.left + window.scrollX) + 'px';

        const translateBtn = document.createElement('button');
        translateBtn.textContent = 'Translate';
        translateBtn.style.cssText = 'margin: 2px; padding: 4px 8px; border: none; background: #007cba; color: white; border-radius: 3px; cursor: pointer;';
        translateBtn.onclick = () => {
            this.processSelection('translate', text);
            menu.remove();
        };

        const explainBtn = document.createElement('button');
        explainBtn.textContent = 'Explain';
        explainBtn.style.cssText = 'margin: 2px; padding: 4px 8px; border: none; background: #28a745; color: white; border-radius: 3px; cursor: pointer;';
        explainBtn.onclick = () => {
            this.processSelection('explain', text);
            menu.remove();
        };

        menu.appendChild(translateBtn);
        menu.appendChild(explainBtn);
        document.body.appendChild(menu);

        // Remove menu on click outside
        setTimeout(() => {
            document.addEventListener('click', () => menu.remove(), { once: true });
        }, 100);
    }

    setupHoverTranslation() {
        let hoverTimeout;

        document.addEventListener('mouseover', (e) => {
            clearTimeout(hoverTimeout);

            hoverTimeout = setTimeout(async () => {
                const text = e.target.textContent?.trim();
                if (!text || text.length > 100) return;

                // Check if text looks like Japanese
                if (this.isJapaneseText(text)) {
                    try {
                        const result = await this.processWithClaude('translate', text);
                        const uiFeedback = this.components.get('uiFeedback');
                        if (uiFeedback) {
                            uiFeedback.showTooltip(e.target, result.content, 'translation');
                        }
                    } catch (error) {
                        this.logger.debug('Hover translation failed:', error);
                    }
                }
            }, 500); // 500ms delay
        });

        document.addEventListener('mouseout', () => {
            clearTimeout(hoverTimeout);
        });
    }

    isJapaneseText(text) {
        const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
        return japaneseRegex.test(text);
    }

    async processWithClaude(action, text, context = {}) {
        try {
            const response = await chrome.runtime.sendMessage({
                action: action,
                text: text,
                context: context,
                url: window.location.href
            });

            if (response.error) {
                throw new Error(response.error);
            }

            return response;
        } catch (error) {
            this.logger.error(`Claude API error (${action}):`, error);
            throw error;
        }
    }

    quickTranslateSelection() {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text) {
            this.processSelection('translate', text);
        }
    }

    explainSelection() {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text) {
            this.processSelection('explain', text);
        }
    }

    async processSelection(action, text) {
        try {
            const uiFeedback = this.components.get('uiFeedback');
            let loader = null;
            
            if (uiFeedback && uiFeedback.showProcessingOverlay) {
                loader = uiFeedback.showProcessingOverlay(`${action}ing...`);
            } else {
                // Fallback loading indicator
                this.showSimpleLoader(`${action}ing...`);
            }

            const response = await this.processWithClaude(action, text);

            if (loader) {
                loader.remove();
            } else {
                this.hideSimpleLoader();
            }

            // Show result
            if (uiFeedback && uiFeedback.showPopup) {
                uiFeedback.showPopup({
                    title: this.getTitleForAction(action),
                    subtitle: this.getSubtitleForAction(action),
                    content: response.content,
                    originalText: text,
                    type: action,
                    showOptions: true,
                    onAccept: (options) => {
                        this.handleActionResult(action, text, response.content, options);
                    }
                });
            } else {
                // Fallback: simple alert or console output
                this.showSimpleResult(action, response.content);
            }

        } catch (error) {
            this.logger.error(`Failed to process ${action}:`, error);
            this.hideSimpleLoader();
            
            const uiFeedback = this.components.get('uiFeedback');
            if (uiFeedback && uiFeedback.showPopup) {
                uiFeedback.showPopup({
                    title: 'Error',
                    content: `Failed to ${action}: ${error.message}`,
                    type: 'error'
                });
            } else {
                // Fallback error display
                alert(`Error: Failed to ${action} - ${error.message}`);
            }
        }
    }

    showSimpleLoader(message) {
        const loader = document.createElement('div');
        loader.id = 'inline-feedback-loader';
        loader.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            font-family: -apple-system, system-ui, sans-serif;
            font-size: 14px;
        `;
        loader.textContent = message;
        document.body.appendChild(loader);
    }

    hideSimpleLoader() {
        const loader = document.getElementById('inline-feedback-loader');
        if (loader) loader.remove();
    }

    showSimpleResult(action, content) {
        const result = document.createElement('div');
        result.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #007cba;
            border-radius: 8px;
            padding: 20px;
            max-width: 500px;
            max-height: 400px;
            overflow-y: auto;
            z-index: 10000;
            font-family: -apple-system, system-ui, sans-serif;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;

        const title = document.createElement('h3');
        title.textContent = this.getTitleForAction(action);
        title.style.cssText = 'margin: 0 0 10px 0; color: #333;';

        const contentDiv = document.createElement('div');
        contentDiv.textContent = content;
        contentDiv.style.cssText = 'margin: 10px 0; line-height: 1.4; color: #555;';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = 'margin-top: 15px; padding: 8px 16px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;';
        closeBtn.onclick = () => result.remove();

        result.appendChild(title);
        result.appendChild(contentDiv);
        result.appendChild(closeBtn);
        document.body.appendChild(result);

        // Auto-close after 10 seconds
        setTimeout(() => result.remove(), 10000);
    }

    getTitleForAction(action) {
        const titles = {
            translate: 'Translation Available',
            explain: 'Explanation',
            summarize: 'Summary',
            correct: 'Suggested Correction'
        };
        return titles[action] || 'Claude Response';
    }

    getSubtitleForAction(action) {
        const subtitles = {
            translate: 'Claude has translated this text',
            explain: 'Claude can help explain this concept',
            summarize: 'Claude has summarized this content',
            correct: 'Claude found a potential improvement'
        };
        return subtitles[action] || '';
    }

    handleActionResult(action, originalText, result, options) {
    // Store in local history if requested
        if (options.addToNotes) {
            this.saveToHistory(action, originalText, result);
        }

        // Copy to clipboard if it's a translation
        if (action === 'translate') {
            navigator.clipboard.writeText(result);
        }

        this.logger.info(`${action} completed for text: ${originalText.substring(0, 50)}...`);
    }

    async saveToHistory(action, originalText, result) {
        try {
            const history = await chrome.storage.local.get(['history']) || { history: [] };
            history.history.unshift({
                action,
                originalText,
                result,
                timestamp: Date.now(),
                url: window.location.href
            });

            // Keep only last 100 items
            history.history = history.history.slice(0, 100);

            await chrome.storage.local.set({ history: history.history });
        } catch (error) {
            this.logger.error('Failed to save to history:', error);
        }
    }

    showActivationMessage() {
        const notification = document.createElement('div');
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #4CAF50;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 14px;
      font-family: -apple-system, system-ui, sans-serif;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s;
    `;
        notification.textContent = '✓ Inline Feedback Active';

        document.body.appendChild(notification);
        setTimeout(() => notification.style.opacity = '1', 10);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Utility classes
class Logger {
    constructor(component) {
        this.component = component;
    }

    debug(message, ...args) {
        if (window.inlineFeedbackConfig?.debugMode) {
            console.debug(`[${this.component}]`, message, ...args);
        }
    }

    info(message, ...args) {
        console.log(`[${this.component}]`, message, ...args);
    }

    warn(message, ...args) {
        console.warn(`[${this.component}]`, message, ...args);
    }

    error(message, ...args) {
        console.error(`[${this.component}]`, message, ...args);
    }
}

class ExtensionError extends Error {
    constructor(message, cause = null) {
        super(message);
        this.name = 'ExtensionError';
        this.cause = cause;
    }
}

class ComponentError extends ExtensionError {
    constructor(message, cause = null) {
        super(message, cause);
        this.name = 'ComponentError';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

async function init() {
    try {
        const extension = new InlineFeedbackExtension();
        await extension.init();

        // Make available globally for debugging
        window.inlineFeedbackExtension = extension;
    } catch (error) {
        console.error('Failed to initialize Inline Feedback Extension:', error);
    }
}
