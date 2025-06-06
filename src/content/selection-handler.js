/**
 * Selection Handler - Manages text selection events and contextual actions
 */
class SelectionHandler {
    constructor(extensionInstance) {
        this.extension = extensionInstance;
        this.logger = new Logger('SelectionHandler');
        this.activeSelection = null;
        this.selectionTimeout = null;
        this.menuVisible = false;
        this.config = {
            minSelectionLength: 2,
            maxSelectionLength: 500,
            showMenuDelay: 300,
            hideMenuDelay: 3000
        };
    }

    async init() {
        this.logger.debug('Initializing selection handler');

        // Set up selection event listeners
        this.setupSelectionListeners();

        // Set up custom event listeners
        this.setupCustomEventListeners();

        this.logger.info('Selection handler initialized');
    }

    setupSelectionListeners() {
    // Mouse selection events
        document.addEventListener('mouseup', this.handleMouseSelection.bind(this));
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));

        // Keyboard selection events
        document.addEventListener('keyup', this.handleKeyboardSelection.bind(this));

        // Selection change events
        document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));

        // Context menu prevention (we'll show our own)
        document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    }

    setupCustomEventListeners() {
    // Listen for custom action events from UI components
        document.addEventListener('inlineFeedbackAction', this.handleCustomAction.bind(this));

        // Listen for selection clear events
        document.addEventListener('click', this.handleDocumentClick.bind(this));
    }

    handleMouseSelection(e) {
    // Small delay to ensure selection is finalized
        setTimeout(() => {
            this.processCurrentSelection(e);
        }, 10);
    }

    handleMouseDown(e) {
    // Hide existing menus when starting new selection
        if (this.menuVisible) {
            this.hideSelectionMenu();
        }
    }

    handleKeyboardSelection(e) {
    // Handle keyboard shortcuts for selection
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.shiftKey) {
            setTimeout(() => {
                this.processCurrentSelection(e);
            }, 10);
        }
    }

    handleSelectionChange() {
    // Clear existing timeout
        if (this.selectionTimeout) {
            clearTimeout(this.selectionTimeout);
        }

        // Set new timeout for processing selection
        this.selectionTimeout = setTimeout(() => {
            this.processCurrentSelection();
        }, this.config.showMenuDelay);
    }

    handleContextMenu(e) {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText && this.isValidSelection(selectedText)) {
            // Prevent default context menu and show our own
            e.preventDefault();
            this.showSelectionMenu(selection, selectedText, e);
            return false;
        }
    }

    handleDocumentClick(e) {
    // Hide selection menu if clicking outside
        if (this.menuVisible && !e.target.closest('.if-selection-menu')) {
            this.hideSelectionMenu();
        }
    }

    handleCustomAction(e) {
        const { action, text } = e.detail;
        this.logger.debug(`Handling custom action: ${action} for text: ${text.substring(0, 50)}...`);

        // Delegate to extension for processing
        if (this.extension && this.extension.processSelection) {
            this.extension.processSelection(action, text);
        }
    }

    processCurrentSelection(event = null) {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        // Clear existing menu if no valid selection
        if (!selectedText || !this.isValidSelection(selectedText)) {
            this.hideSelectionMenu();
            this.activeSelection = null;
            return;
        }

        // Store current selection
        this.activeSelection = {
            selection: selection,
            text: selectedText,
            timestamp: Date.now(),
            event: event
        };

        // Show selection menu after delay
        if (!this.menuVisible) {
            this.showSelectionMenu(selection, selectedText, event);
        }
    }

    isValidSelection(text) {
        if (!text) return false;

        // Check length constraints
        if (text.length < this.config.minSelectionLength ||
        text.length > this.config.maxSelectionLength) {
            return false;
        }

        // Skip single words that are too common
        const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        if (text.split(' ').length === 1 && commonWords.includes(text.toLowerCase())) {
            return false;
        }

        // Skip whitespace-only selections
        if (!/\S/.test(text)) {
            return false;
        }

        return true;
    }

    showSelectionMenu(selection, text, event = null) {
        if (this.menuVisible) return;

        const uiFeedback = this.extension.components?.get('uiFeedback');
        if (!uiFeedback) {
            this.logger.warn('UIFeedback component not available');
            return;
        }

        // Determine menu actions based on content type
        const actions = this.getContextualActions(text);

        // Show the menu
        const menu = uiFeedback.showSelectionMenu(selection, text, actions);
        this.menuVisible = true;

        // Auto-hide after delay
        setTimeout(() => {
            this.hideSelectionMenu();
        }, this.config.hideMenuDelay);

        this.logger.debug(`Showing selection menu for: ${text.substring(0, 30)}...`);
    }

    hideSelectionMenu() {
        if (!this.menuVisible) return;

        // Remove any active selection menus
        const menus = document.querySelectorAll('.if-selection-menu');
        menus.forEach(menu => {
            menu.classList.remove('show');
            setTimeout(() => {
                if (menu.parentNode) {
                    menu.parentNode.removeChild(menu);
                }
            }, 150);
        });

        this.menuVisible = false;
    }

    getContextualActions(text) {
        const actions = [];

        // Always available actions
        actions.push({
            icon: '💡',
            text: 'Explain',
            action: 'explain',
            description: 'Get AI explanation of this text'
        });

        // Translation action (prioritize if Japanese detected)
        if (this.isJapaneseText(text)) {
            actions.unshift({
                icon: '🌐',
                text: 'Translate',
                action: 'translate',
                description: 'Translate to English'
            });
        } else {
            actions.push({
                icon: '🌐',
                text: 'Translate',
                action: 'translate',
                description: 'Translate to another language'
            });
        }

        // Medical material detection
        if (this.isMedicalTerm(text)) {
            actions.unshift({
                icon: '🏥',
                text: 'Medical Info',
                action: 'medical-explain',
                description: 'Get medical material information'
            });
        }

        // Technical term detection
        if (this.isTechnicalTerm(text)) {
            actions.push({
                icon: '🔬',
                text: 'Technical',
                action: 'technical-explain',
                description: 'Get technical explanation'
            });
        }

        // Longer text actions
        if (text.length > 100) {
            actions.push({
                icon: '📝',
                text: 'Summarize',
                action: 'summarize',
                description: 'Create a summary'
            });
        }

        // Always include copy action
        actions.push({
            icon: '📋',
            text: 'Copy',
            action: 'copy',
            description: 'Copy to clipboard',
            handler: (text) => {
                navigator.clipboard.writeText(text);
                const uiFeedback = this.extension.components?.get('uiFeedback');
                if (uiFeedback) {
                    uiFeedback.showTooltip(
                        document.querySelector('.if-selection-menu'),
                        'Copied!',
                        'success'
                    );
                }
            }
        });

        return actions;
    }

    isJapaneseText(text) {
    // Check for Japanese characters (Hiragana, Katakana, Kanji)
        const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
        return japaneseRegex.test(text);
    }

    isMedicalTerm(text) {
    // Check against medical materials ontology
        const medicalTerms = [
            'titanium', 'PEEK', 'nitinol', 'cobalt-chrome', 'stainless steel',
            'hydroxyapatite', 'UHMWPE', 'polyethylene', 'implant', 'biocompatible',
            'osseointegration', 'FDA', 'ISO', 'ASTM', 'biocompatibility'
        ];

        const lowerText = text.toLowerCase();
        return medicalTerms.some(term => lowerText.includes(term.toLowerCase()));
    }

    isTechnicalTerm(text) {
    // Check for technical indicators
        const technicalIndicators = [
            'temperature', 'pressure', 'modulus', 'strength', 'density',
            'coefficient', 'analysis', 'measurement', 'specification', 'standard',
            'protocol', 'procedure', 'methodology'
        ];

        const lowerText = text.toLowerCase();
        return technicalIndicators.some(term => lowerText.includes(term));
    }

    // Public API methods
    getCurrentSelection() {
        return this.activeSelection;
    }

    selectText(element, startOffset = 0, endOffset = null) {
        try {
            const range = document.createRange();
            const textNode = element.firstChild || element;

            range.setStart(textNode, startOffset);
            range.setEnd(textNode, endOffset || textNode.textContent.length);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            return selection;
        } catch (error) {
            this.logger.error('Failed to select text:', error);
            return null;
        }
    }

    highlightSelection(className = 'if-highlight') {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return null;

        try {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.className = className;

            range.surroundContents(span);
            selection.removeAllRanges();

            return span;
        } catch (error) {
            this.logger.debug('Could not highlight selection:', error);
            return null;
        }
    }

    getSelectionContext(contextWords = 5) {
        if (!this.activeSelection) return null;

        try {
            const selection = this.activeSelection.selection;
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;

            // Get text content of parent element
            const parentElement = container.nodeType === Node.TEXT_NODE ?
                container.parentElement : container;

            const fullText = parentElement.textContent;
            const selectedText = this.activeSelection.text;
            const selectionIndex = fullText.indexOf(selectedText);

            if (selectionIndex === -1) return null;

            // Extract words around selection
            const words = fullText.split(/\s+/);
            const selectedWords = selectedText.split(/\s+/);
            const startWordIndex = words.findIndex(word =>
                selectedWords[0] && word.includes(selectedWords[0])
            );

            if (startWordIndex === -1) return null;

            const contextStart = Math.max(0, startWordIndex - contextWords);
            const contextEnd = Math.min(words.length, startWordIndex + selectedWords.length + contextWords);

            return {
                before: words.slice(contextStart, startWordIndex).join(' '),
                selected: selectedText,
                after: words.slice(startWordIndex + selectedWords.length, contextEnd).join(' '),
                full: words.slice(contextStart, contextEnd).join(' ')
            };

        } catch (error) {
            this.logger.debug('Failed to get selection context:', error);
            return null;
        }
    }

    clearSelection() {
        window.getSelection().removeAllRanges();
        this.activeSelection = null;
        this.hideSelectionMenu();
    }

    // Event handling utilities
    isDoubleClick(event) {
        return event && event.detail === 2;
    }

    isRightClick(event) {
        return event && event.button === 2;
    }

    getSelectionStats() {
        return {
            hasActiveSelection: !!this.activeSelection,
            menuVisible: this.menuVisible,
            lastSelectionTime: this.activeSelection?.timestamp,
            selectionLength: this.activeSelection?.text?.length || 0
        };
    }
}

// Make available globally
window.SelectionHandler = SelectionHandler;
