/**
 * Medical Materials Ontology - Defines medical materials terminology
 * Extends the base ontology with specific medical materials terms
 */
class MedicalMaterialsOntology extends BaseOntology {
    constructor() {
        super();
        this.name = 'Medical Materials Ontology';
        this.version = '1.0.0';
    }

    // Load medical materials terms
    loadTerms() {
        // Metals
        this.addTerm('Titanium', 'metal', {
            description: 'A strong, lightweight, corrosion-resistant metal used in implants',
            properties: ['biocompatible', 'corrosion-resistant', 'non-magnetic']
        });
        
        this.addTerm('Stainless Steel 316L', 'metal', {
            description: 'A type of stainless steel used for implants and surgical instruments',
            properties: ['corrosion-resistant', 'affordable', 'durable']
        });
        
        this.addTerm('Cobalt Chromium', 'metal', {
            description: 'An alloy used in joint replacements due to its wear resistance',
            properties: ['wear-resistant', 'durable', 'biocompatible']
        });
        
        this.addTerm('Nitinol', 'metal', {
            description: 'A nickel-titanium alloy with shape memory properties',
            properties: ['shape-memory', 'superelastic', 'biocompatible']
        });
        
        // Polymers
        this.addTerm('PEEK', 'polymer', {
            description: 'Polyetheretherketone, a high-performance thermoplastic used in implants',
            properties: ['radiolucent', 'bone-like mechanical properties', 'biocompatible']
        });
        
        this.addTerm('PLGA', 'polymer', {
            description: 'Poly(lactic-co-glycolic acid), a biodegradable polymer used in drug delivery',
            properties: ['biodegradable', 'controllable degradation rate', 'biocompatible']
        });
        
        this.addTerm('UHMWPE', 'polymer', {
            description: 'Ultra-high-molecular-weight polyethylene used in joint replacements',
            properties: ['wear-resistant', 'low friction', 'biocompatible']
        });
        
        this.addTerm('PMMA', 'polymer', {
            description: 'Polymethyl methacrylate, used as bone cement',
            properties: ['bone cement', 'fixation', 'biocompatible']
        });
        
        // Ceramics
        this.addTerm('Hydroxyapatite', 'ceramic', {
            description: 'A calcium phosphate similar to the mineral component of bone',
            properties: ['bioactive', 'osteoconductive', 'biocompatible']
        });
        
        this.addTerm('Zirconia', 'ceramic', {
            description: 'Zirconium dioxide, used in dental applications',
            properties: ['high strength', 'wear-resistant', 'aesthetic']
        });
        
        this.addTerm('Alumina', 'ceramic', {
            description: 'Aluminum oxide, used in joint replacements',
            properties: ['wear-resistant', 'high hardness', 'biocompatible']
        });
        
        this.addTerm('Bioglass', 'ceramic', {
            description: 'A bioactive glass that bonds to bone',
            properties: ['bioactive', 'osteoconductive', 'biodegradable']
        });
        
        // Natural materials
        this.addTerm('Collagen', 'natural', {
            description: 'A protein found in connective tissues, used in scaffolds and wound healing',
            properties: ['biodegradable', 'bioactive', 'cell-adhesive']
        });
        
        this.addTerm('Chitosan', 'natural', {
            description: 'A polysaccharide derived from chitin, used in wound healing',
            properties: ['biodegradable', 'antimicrobial', 'biocompatible']
        });
        
        this.addTerm('Alginate', 'natural', {
            description: 'A polysaccharide derived from seaweed, used in wound dressings',
            properties: ['biodegradable', 'absorbent', 'biocompatible']
        });
        
        this.addTerm('Hyaluronic Acid', 'natural', {
            description: 'A glycosaminoglycan found in connective tissues, used in joint lubrication',
            properties: ['viscoelastic', 'hydrophilic', 'biocompatible']
        });
        
        // Composites
        this.addTerm('Carbon Fiber Reinforced Polymer', 'composite', {
            description: 'A composite material used in orthopedic implants',
            properties: ['high strength', 'lightweight', 'radiolucent']
        });
        
        this.addTerm('Hydroxyapatite-Coated Titanium', 'composite', {
            description: 'Titanium implants coated with hydroxyapatite to enhance osseointegration',
            properties: ['bioactive', 'osteoconductive', 'durable']
        });
    }

    // Get materials by property
    getMaterialsByProperty(property) {
        if (!property || typeof property !== 'string') {
            return [];
        }
        
        const normalizedProperty = property.toLowerCase().trim();
        const results = [];
        
        for (const termInfo of this.getAllTerms()) {
            if (termInfo.metadata && 
                termInfo.metadata.properties && 
                termInfo.metadata.properties.some(p => p.toLowerCase() === normalizedProperty)) {
                results.push(termInfo);
            }
        }
        
        return results;
    }

    // Get material properties
    getMaterialProperties(term) {
        const termInfo = this.getTerm(term);
        
        if (!termInfo || !termInfo.metadata || !termInfo.metadata.properties) {
            return [];
        }
        
        return termInfo.metadata.properties;
    }

    // Get material description
    getMaterialDescription(term) {
        const termInfo = this.getTerm(term);
        
        if (!termInfo || !termInfo.metadata || !termInfo.metadata.description) {
            return '';
        }
        
        return termInfo.metadata.description;
    }
}

// Make available globally
window.MedicalMaterialsOntology = MedicalMaterialsOntology;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MedicalMaterialsOntology;
}
