/**
 * Ontology Highlighter - Highlights medical terms in the page
 * Uses the medical ontology to identify and highlight terms
 */
class OntologyHighlighter {
    constructor(ontology) {
        this.ontology = ontology;
        this.logger = new Logger('OntologyHighlighter');
        this.config = {
            enabled: true,
            highlightClass: 'if-highlighted-term',
            categoryClasses: {
                metal: 'if-metal',
                polymer: 'if-polymer',
                ceramic: 'if-ceramic',
                composite: 'if-composite',
                natural: 'if-natural',
                device: 'if-device'
            },
            excludeSelectors: [
                'script', 'style', 'noscript', 'iframe', 'object', 'embed',
                'input', 'textarea', 'select', 'button',
                '.if-popup', '.if-notification', '.if-tooltip', '.if-selection-menu'
            ],
            maxTermsPerPage: 500
        };
        this.highlightedTerms = new Map();
        this.styles = {
            loaded: false,
            cssRules: `
                .if-highlighted-term {
                    border-bottom: 1px dotted;
                    cursor: pointer;
                    position: relative;
                }
                
                .if-highlighted-term:hover {
                    background-color: rgba(0, 0, 0, 0.05);
                }
                
                .if-metal {
                    border-bottom-color: #2196f3;
                }
                
                .if-polymer {
                    border-bottom-color: #4caf50;
                }
                
                .if-ceramic {
                    border-bottom-color: #f44336;
                }
                
                .if-composite {
                    border-bottom-color: #9c27b0;
                }
                
                .if-natural {
                    border-bottom-color: #ff9800;
                }
                
                .if-device {
                    border-bottom-color: #795548;
                }
            `
        };
        this.observer = null;
    }

    // Initialize the highlighter
    init() {
        this.logger.debug('Initializing ontology highlighter');
        
        // Load styles
        this.loadStyles();
        
        // Process the page
        if (this.config.enabled) {
            this.processPage();
        }
        
        // Set up mutation observer
        this.setupObserver();
        
        this.logger.info('Ontology highlighter initialized');
    }

    // Load styles
    loadStyles() {
        if (this.styles.loaded) return;
        
        // Check if styles are already loaded
        if (document.getElementById('inline-feedback-highlighter-styles')) {
            this.styles.loaded = true;
            return;
        }
        
        // Create style element
        const style = document.createElement('style');
        style.id = 'inline-feedback-highlighter-styles';
        style.textContent = this.styles.cssRules;
        
        // Add to document
        document.head.appendChild(style);
        
        this.styles.loaded = true;
        this.logger.debug('Highlighter styles loaded');
    }

    // Process the page
    processPage() {
        this.logger.debug('Processing page for medical terms');
        
        // Reset highlighted terms
        this.highlightedTerms.clear();
        
        // Process body
        this.processNode(document.body);
        
        this.logger.info(`Page processed, found ${this.highlightedTerms.size} terms`);
    }

    // Process a node
    processNode(node) {
        if (!node || !this.config.enabled) return;
        
        // Check if we've reached the maximum number of terms
        if (this.highlightedTerms.size >= this.config.maxTermsPerPage) {
            this.logger.warn(`Maximum number of terms (${this.config.maxTermsPerPage}) reached, stopping processing`);
            return;
        }
        
        // Skip excluded elements
        if (this.isExcluded(node)) {
            return;
        }
        
        // Process text nodes
        if (node.nodeType === Node.TEXT_NODE) {
            this.processTextNode(node);
            return;
        }
        
        // Process element nodes
        if (node.nodeType === Node.ELEMENT_NODE) {
            // Skip if already processed
            if (node.getAttribute('data-if-processed') === 'true') {
                return;
            }
            
            // Process child nodes
            for (const child of Array.from(node.childNodes)) {
                this.processNode(child);
            }
            
            // Mark as processed
            node.setAttribute('data-if-processed', 'true');
        }
    }

    // Process a text node
    processTextNode(node) {
        if (!node || !node.textContent || node.textContent.trim() === '') return;
        
        const text = node.textContent;
        const terms = this.findMedicalTerms(text);
        
        if (terms.length === 0) return;
        
        // Create a document fragment
        const fragment = document.createDocumentFragment();
        
        // Keep track of the last index
        let lastIndex = 0;
        
        // Process each term
        for (const term of terms) {
            // Add text before the term
            if (term.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex, term.index)));
            }
            
            // Create highlighted element
            const span = document.createElement('span');
            span.className = `${this.config.highlightClass} ${this.getCategoryClass(term.category)}`;
            span.textContent = term.text;
            span.setAttribute('data-if-term-id', term.id);
            span.setAttribute('data-if-term-category', term.category);
            span.setAttribute('title', `${term.name} (${term.category})`);
            
            // Add click event
            span.addEventListener('click', (event) => {
                this.handleTermClick(event, term);
            });
            
            // Add to fragment
            fragment.appendChild(span);
            
            // Update last index
            lastIndex = term.index + term.text.length;
            
            // Add to highlighted terms
            this.highlightedTerms.set(term.id, {
                id: term.id,
                name: term.name,
                text: term.text,
                category: term.category,
                element: span
            });
        }
        
        // Add remaining text
        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }
        
        // Replace the text node with the fragment
        if (node.parentNode) {
            node.parentNode.replaceChild(fragment, node);
        }
    }

    // Find medical terms in text
    findMedicalTerms(text) {
        if (!text || !this.ontology) return [];
        
        const terms = [];
        
        // Get all biomaterials
        const biomaterials = this.ontology.getBiomaterials();
        
        if (!biomaterials) return [];
        
        // Check each material
        for (const material of biomaterials) {
            // Skip if no name
            if (!material.name) continue;
            
            // Create regex for the material name
            const regex = new RegExp(`\\b${material.name}\\b`, 'gi');
            
            // Find all matches
            let match;
            while ((match = regex.exec(text)) !== null) {
                terms.push({
                    id: material.id,
                    name: material.name,
                    text: match[0],
                    index: match.index,
                    category: material.category
                });
            }
            
            // Check synonyms
            if (material.synonyms && material.synonyms.length > 0) {
                for (const synonym of material.synonyms) {
                    // Skip if no synonym
                    if (!synonym) continue;
                    
                    // Create regex for the synonym
                    const synonymRegex = new RegExp(`\\b${synonym}\\b`, 'gi');
                    
                    // Find all matches
                    let synonymMatch;
                    while ((synonymMatch = synonymRegex.exec(text)) !== null) {
                        terms.push({
                            id: material.id,
                            name: material.name,
                            text: synonymMatch[0],
                            index: synonymMatch.index,
                            category: material.category
                        });
                    }
                }
            }
        }
        
        // Sort by index
        terms.sort((a, b) => a.index - b.index);
        
        // Remove overlapping terms
        const filteredTerms = [];
        let lastEnd = -1;
        
        for (const term of terms) {
            const end = term.index + term.text.length;
            
            if (term.index >= lastEnd) {
                filteredTerms.push(term);
                lastEnd = end;
            }
        }
        
        return filteredTerms;
    }

    // Handle term click
    handleTermClick(event, term) {
        this.logger.debug(`Term clicked: ${term.name} (${term.category})`);
        
        // Get UI feedback component
        const uiFeedback = this.extension?.components.get('uiFeedback');
        
        if (!uiFeedback) {
            this.logger.warn('UI Feedback component not available');
            return;
        }
        
        // Show tooltip
        uiFeedback.showTooltip(event.target, `${term.name} (${term.category})`, 'info', 2000);
        
        // Process selection
        if (this.extension && typeof this.extension.processSelection === 'function') {
            this.extension.processSelection('medical-explain', term.name, {
                termId: term.id,
                termCategory: term.category,
                element: event.target
            });
        }
    }

    // Get category class
    getCategoryClass(category) {
        return this.config.categoryClasses[category] || '';
    }

    // Check if node is excluded
    isExcluded(node) {
        if (!node) return true;
        
        // Check node type
        if (node.nodeType !== Node.TEXT_NODE && node.nodeType !== Node.ELEMENT_NODE) {
            return true;
        }
        
        // Check if it's a text node with a parent that is excluded
        if (node.nodeType === Node.TEXT_NODE && node.parentNode) {
            return this.isExcluded(node.parentNode);
        }
        
        // Check if it's an element that is excluded
        if (node.nodeType === Node.ELEMENT_NODE) {
            // Check tag name
            const tagName = node.tagName.toLowerCase();
            
            if (this.config.excludeSelectors.includes(tagName)) {
                return true;
            }
            
            // Check class names
            for (const selector of this.config.excludeSelectors) {
                if (selector.startsWith('.') && node.classList.contains(selector.substring(1))) {
                    return true;
                }
            }
            
            // Check if it's a highlighted term
            if (node.classList.contains(this.config.highlightClass)) {
                return true;
            }
        }
        
        return false;
    }

    // Set up mutation observer
    setupObserver() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                // Process added nodes
                if (mutation.type === 'childList') {
                    for (const node of Array.from(mutation.addedNodes)) {
                        this.processNode(node);
                    }
                }
            }
        });
        
        // Start observing
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        this.logger.debug('Mutation observer set up');
    }

    // Enable highlighting
    enable() {
        this.config.enabled = true;
        this.processPage();
        this.logger.info('Highlighting enabled');
    }

    // Disable highlighting
    disable() {
        this.config.enabled = false;
        this.logger.info('Highlighting disabled');
    }

    // Get highlight stats
    getHighlightStats() {
        const stats = {
            total: this.highlightedTerms.size,
            byCategory: {}
        };
        
        // Count by category
        for (const term of this.highlightedTerms.values()) {
            if (!stats.byCategory[term.category]) {
                stats.byCategory[term.category] = 0;
            }
            
            stats.byCategory[term.category]++;
        }
        
        return stats;
    }

    // Get highlighted terms
    getHighlightedTerms() {
        return Array.from(this.highlightedTerms.values());
    }

    // Get highlighted terms in element
    getHighlightedTermsInElement(element) {
        if (!element) return [];
        
        const terms = [];
        
        // Find all highlighted terms in the element
        const highlightedElements = element.querySelectorAll(`.${this.config.highlightClass}`);
        
        for (const highlightedElement of highlightedElements) {
            const termId = highlightedElement.getAttribute('data-if-term-id');
            
            if (termId && this.highlightedTerms.has(termId)) {
                terms.push(this.highlightedTerms.get(termId));
            }
        }
        
        return terms;
    }
}

// Make available globally
window.OntologyHighlighter = OntologyHighlighter;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OntologyHighlighter;
}
