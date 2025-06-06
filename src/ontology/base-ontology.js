/**
 * Base Ontology - Provides the foundation for all ontology classes
 * Defines the base structure and methods for ontology handling
 */
class BaseOntology {
    constructor() {
        this.terms = new Map();
        this.categories = new Map();
        this.initialized = false;
    }

    // Initialize the ontology
    init() {
        if (this.initialized) {
            return this;
        }
        
        this.loadTerms();
        this.initialized = true;
        
        return this;
    }

    // Load terms - to be implemented by subclasses
    loadTerms() {
        // This method should be overridden by subclasses
        console.warn('BaseOntology.loadTerms() called - this method should be overridden by subclasses');
    }

    // Add a term to the ontology
    addTerm(term, category, metadata = {}) {
        if (!term || typeof term !== 'string') {
            console.error('Invalid term:', term);
            return false;
        }
        
        // Normalize term
        const normalizedTerm = this.normalizeTerm(term);
        
        // Add term to the ontology
        this.terms.set(normalizedTerm, {
            term: term,
            category: category || 'unknown',
            metadata: metadata
        });
        
        // Add term to category
        if (category) {
            if (!this.categories.has(category)) {
                this.categories.set(category, new Set());
            }
            
            this.categories.get(category).add(normalizedTerm);
        }
        
        return true;
    }

    // Check if term exists in the ontology
    hasTerm(term) {
        if (!term || typeof term !== 'string') {
            return false;
        }
        
        // Normalize term
        const normalizedTerm = this.normalizeTerm(term);
        
        return this.terms.has(normalizedTerm);
    }

    // Get term information
    getTerm(term) {
        if (!term || typeof term !== 'string') {
            return null;
        }
        
        // Normalize term
        const normalizedTerm = this.normalizeTerm(term);
        
        return this.terms.get(normalizedTerm) || null;
    }

    // Get all terms
    getAllTerms() {
        return Array.from(this.terms.values());
    }

    // Get terms by category
    getTermsByCategory(category) {
        if (!category || !this.categories.has(category)) {
            return [];
        }
        
        const termIds = Array.from(this.categories.get(category));
        
        return termIds.map(id => this.terms.get(id)).filter(Boolean);
    }

    // Get all categories
    getAllCategories() {
        return Array.from(this.categories.keys());
    }

    // Normalize term for consistent lookup
    normalizeTerm(term) {
        return term.toLowerCase().trim();
    }

    // Search for terms matching a pattern
    searchTerms(pattern) {
        if (!pattern || typeof pattern !== 'string') {
            return [];
        }
        
        const normalizedPattern = this.normalizeTerm(pattern);
        const results = [];
        
        for (const [key, value] of this.terms.entries()) {
            if (key.includes(normalizedPattern)) {
                results.push(value);
            }
        }
        
        return results;
    }

    // Get term count
    getTermCount() {
        return this.terms.size;
    }

    // Get category count
    getCategoryCount() {
        return this.categories.size;
    }

    // Clear all terms
    clearTerms() {
        this.terms.clear();
        this.categories.clear();
    }

    // Export ontology to JSON
    toJSON() {
        return {
            terms: Array.from(this.terms.entries()),
            categories: Array.from(this.categories.entries()).map(([category, terms]) => {
                return [category, Array.from(terms)];
            })
        };
    }

    // Import ontology from JSON
    fromJSON(json) {
        if (!json || !json.terms || !json.categories) {
            console.error('Invalid JSON for ontology import');
            return false;
        }
        
        // Clear existing terms
        this.clearTerms();
        
        // Import terms
        for (const [key, value] of json.terms) {
            this.terms.set(key, value);
        }
        
        // Import categories
        for (const [category, terms] of json.categories) {
            this.categories.set(category, new Set(terms));
        }
        
        return true;
    }
}

// Make available globally
window.BaseOntology = BaseOntology;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseOntology;
}
