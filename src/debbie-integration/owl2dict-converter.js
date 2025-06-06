/**
 * OWL2DICT Converter - Real DEB Ontology Integration
 * Converts ProjectDebbie's DEB ontology from OWL format to JavaScript dictionary
 * Based on https://github.com/ProjectDebbie/OWL2DICT
 */

class Owl2DictConverter {
    constructor() {
        this.version = '1.0.0';
        this.debOntologyUrl = 'https://raw.githubusercontent.com/ProjectDebbie/Ontology_DEB/master/DEB_ont.owl';
        this.source = 'ProjectDebbie DEB Ontology';
        this.cache = new Map();
        this.cacheTimeout = 3600000; // 1 hour for ontology data
    }

    /**
   * Load and convert DEB ontology from ProjectDebbie repository
   * @returns {Promise<Object>} Converted ontology in dictionary format
   */
    async loadDebOntology() {
        const cacheKey = 'deb_ontology_full';

        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            console.log('Loading DEB ontology from ProjectDebbie repository...');
            const owlContent = await this.fetchOwlFile();
            const convertedOntology = await this.convertOwlToDict(owlContent);

            // Cache the result
            this.cache.set(cacheKey, {
                data: convertedOntology,
                timestamp: Date.now()
            });

            return convertedOntology;

        } catch (error) {
            console.error('Failed to load DEB ontology:', error);
            return this.getFallbackOntology();
        }
    }

    /**
   * Fetch OWL file from ProjectDebbie repository
   */
    async fetchOwlFile() {
        try {
            const response = await fetch(this.debOntologyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/owl+xml, application/xml, text/xml',
                    'User-Agent': 'Inline-Feedback-Extension/1.0 (DEB-Ontology-Integration)'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch OWL file: ${response.status} ${response.statusText}`);
            }

            const owlContent = await response.text();
            console.log(`Loaded DEB ontology: ${Math.round(owlContent.length / 1024)}KB`);
            return owlContent;

        } catch (error) {
            console.error('Error fetching OWL file:', error);
            throw error;
        }
    }

    /**
   * Convert OWL content to dictionary format (simplified OWL2DICT functionality)
   */
    async convertOwlToDict(owlContent) {
        const ontologyDict = {
            metadata: {
                source: this.source,
                version: this.extractVersion(owlContent),
                loadTimestamp: new Date().toISOString(),
                classes: 0,
                properties: 0
            },
            classes: {},
            properties: {},
            individuals: {},
            hierarchies: {}
        };

        try {
            // Parse OWL XML content
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(owlContent, 'application/xml');

            // Check for parsing errors
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                throw new Error('OWL XML parsing failed');
            }

            // Extract classes
            const classes = this.extractClasses(xmlDoc);
            ontologyDict.classes = classes;
            ontologyDict.metadata.classes = Object.keys(classes).length;

            // Extract properties
            const properties = this.extractProperties(xmlDoc);
            ontologyDict.properties = properties;
            ontologyDict.metadata.properties = Object.keys(properties).length;

            // Extract individuals/instances
            const individuals = this.extractIndividuals(xmlDoc);
            ontologyDict.individuals = individuals;

            // Build class hierarchies
            const hierarchies = this.buildHierarchies(classes);
            ontologyDict.hierarchies = hierarchies;

            console.log(`Converted DEB ontology: ${ontologyDict.metadata.classes} classes, ${ontologyDict.metadata.properties} properties`);
            return ontologyDict;

        } catch (error) {
            console.error('Error converting OWL to dictionary:', error);
            throw error;
        }
    }

    /**
   * Extract classes from OWL document
   */
    extractClasses(xmlDoc) {
        const classes = {};
        const classElements = xmlDoc.querySelectorAll('owl\\:Class, Class');

        classElements.forEach(classEl => {
            const classUri = classEl.getAttribute('rdf:about') || classEl.getAttribute('rdf:ID');
            if (!classUri) return;

            const className = this.extractLocalName(classUri);
            const classInfo = {
                uri: classUri,
                name: className,
                label: this.extractLabel(classEl),
                comment: this.extractComment(classEl),
                synonyms: this.extractSynonyms(classEl),
                subClassOf: this.extractSubClassOf(classEl),
                properties: this.extractClassProperties(classEl),
                individuals: [],
                category: this.categorizeClass(className)
            };

            classes[className] = classInfo;
        });

        return classes;
    }

    /**
   * Extract properties from OWL document
   */
    extractProperties(xmlDoc) {
        const properties = {};

        // Object properties
        const objPropElements = xmlDoc.querySelectorAll('owl\\:ObjectProperty, ObjectProperty');
        objPropElements.forEach(propEl => {
            const propUri = propEl.getAttribute('rdf:about') || propEl.getAttribute('rdf:ID');
            if (!propUri) return;

            const propName = this.extractLocalName(propUri);
            properties[propName] = {
                uri: propUri,
                name: propName,
                type: 'ObjectProperty',
                label: this.extractLabel(propEl),
                comment: this.extractComment(propEl),
                domain: this.extractDomain(propEl),
                range: this.extractRange(propEl)
            };
        });

        // Data properties
        const dataPropElements = xmlDoc.querySelectorAll('owl\\:DatatypeProperty, DatatypeProperty');
        dataPropElements.forEach(propEl => {
            const propUri = propEl.getAttribute('rdf:about') || propEl.getAttribute('rdf:ID');
            if (!propUri) return;

            const propName = this.extractLocalName(propUri);
            properties[propName] = {
                uri: propUri,
                name: propName,
                type: 'DatatypeProperty',
                label: this.extractLabel(propEl),
                comment: this.extractComment(propEl),
                domain: this.extractDomain(propEl),
                range: this.extractRange(propEl)
            };
        });

        return properties;
    }

    /**
   * Extract individuals/instances from OWL document
   */
    extractIndividuals(xmlDoc) {
        const individuals = {};
        const namedIndividuals = xmlDoc.querySelectorAll('owl\\:NamedIndividual, NamedIndividual');

        namedIndividuals.forEach(indEl => {
            const indUri = indEl.getAttribute('rdf:about') || indEl.getAttribute('rdf:ID');
            if (!indUri) return;

            const indName = this.extractLocalName(indUri);
            individuals[indName] = {
                uri: indUri,
                name: indName,
                label: this.extractLabel(indEl),
                comment: this.extractComment(indEl),
                types: this.extractTypes(indEl),
                properties: this.extractInstanceProperties(indEl)
            };
        });

        return individuals;
    }

    /**
   * Build class hierarchies
   */
    buildHierarchies(classes) {
        const hierarchies = {
            roots: [],
            children: {},
            parents: {}
        };

        Object.values(classes).forEach(classInfo => {
            const className = classInfo.name;

            if (classInfo.subClassOf && classInfo.subClassOf.length > 0) {
                classInfo.subClassOf.forEach(parentClass => {
                    const parentName = this.extractLocalName(parentClass);

                    if (!hierarchies.children[parentName]) {
                        hierarchies.children[parentName] = [];
                    }
                    hierarchies.children[parentName].push(className);

                    if (!hierarchies.parents[className]) {
                        hierarchies.parents[className] = [];
                    }
                    hierarchies.parents[className].push(parentName);
                });
            } else {
                hierarchies.roots.push(className);
            }
        });

        return hierarchies;
    }

    /**
   * Extract label from element
   */
    extractLabel(element) {
        const labelEl = element.querySelector('rdfs\\:label, label');
        return labelEl ? labelEl.textContent.trim() : null;
    }

    /**
   * Extract comment from element
   */
    extractComment(element) {
        const commentEl = element.querySelector('rdfs\\:comment, comment');
        return commentEl ? commentEl.textContent.trim() : null;
    }

    /**
   * Extract synonyms from element
   */
    extractSynonyms(element) {
        const synonyms = [];
        const altLabels = element.querySelectorAll('skos\\:altLabel, altLabel');
        altLabels.forEach(altLabel => {
            synonyms.push(altLabel.textContent.trim());
        });
        return synonyms;
    }

    /**
   * Extract subClassOf relationships
   */
    extractSubClassOf(element) {
        const subClassOf = [];
        const subClassElements = element.querySelectorAll('rdfs\\:subClassOf, subClassOf');
        subClassElements.forEach(subEl => {
            const resource = subEl.getAttribute('rdf:resource');
            if (resource) {
                subClassOf.push(resource);
            }
        });
        return subClassOf;
    }

    /**
   * Extract class properties
   */
    extractClassProperties(element) {
        const properties = {};
        // Implementation would depend on specific property patterns in DEB ontology
        return properties;
    }

    /**
   * Extract domain from property element
   */
    extractDomain(element) {
        const domainEl = element.querySelector('rdfs\\:domain, domain');
        return domainEl ? domainEl.getAttribute('rdf:resource') : null;
    }

    /**
   * Extract range from property element
   */
    extractRange(element) {
        const rangeEl = element.querySelector('rdfs\\:range, range');
        return rangeEl ? rangeEl.getAttribute('rdf:resource') : null;
    }

    /**
   * Extract types from individual element
   */
    extractTypes(element) {
        const types = [];
        const typeElements = element.querySelectorAll('rdf\\:type, type');
        typeElements.forEach(typeEl => {
            const resource = typeEl.getAttribute('rdf:resource');
            if (resource) {
                types.push(resource);
            }
        });
        return types;
    }

    /**
   * Extract instance properties
   */
    extractInstanceProperties(element) {
        const properties = {};
        // Implementation would depend on specific property patterns
        return properties;
    }

    /**
   * Extract local name from URI
   */
    extractLocalName(uri) {
        if (!uri) return '';
        const parts = uri.split(/[#\/]/);
        return parts[parts.length - 1];
    }

    /**
   * Extract version from OWL content
   */
    extractVersion(owlContent) {
        const versionMatch = owlContent.match(/owl:versionInfo[^>]*>([^<]+)</i);
        return versionMatch ? versionMatch[1].trim() : 'unknown';
    }

    /**
   * Categorize class based on DEB ontology structure
   */
    categorizeClass(className) {
        const categories = {
            biomaterial: ['material', 'polymer', 'ceramic', 'metal', 'composite'],
            device: ['device', 'implant', 'scaffold', 'stent'],
            process: ['process', 'method', 'technique', 'procedure'],
            property: ['property', 'characteristic', 'feature'],
            effect: ['effect', 'response', 'reaction', 'outcome'],
            application: ['application', 'use', 'treatment', 'therapy']
        };

        const lowerClassName = className.toLowerCase();

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerClassName.includes(keyword))) {
                return category;
            }
        }

        return 'general';
    }

    /**
   * Get fallback ontology when real DEB ontology is unavailable
   */
    getFallbackOntology() {
        return {
            metadata: {
                source: 'fallback_basic_ontology',
                version: 'fallback',
                loadTimestamp: new Date().toISOString(),
                classes: 5,
                properties: 0
            },
            classes: {
                'Biomaterial': {
                    name: 'Biomaterial',
                    label: 'Biomaterial',
                    comment: 'Material suitable for biological applications',
                    category: 'biomaterial'
                },
                'MedicalDevice': {
                    name: 'MedicalDevice',
                    label: 'Medical Device',
                    comment: 'Device used for medical purposes',
                    category: 'device'
                },
                'BiologicalProcess': {
                    name: 'BiologicalProcess',
                    label: 'Biological Process',
                    comment: 'Process occurring in biological systems',
                    category: 'process'
                },
                'MaterialProperty': {
                    name: 'MaterialProperty',
                    label: 'Material Property',
                    comment: 'Property of a material',
                    category: 'property'
                },
                'BiologicalEffect': {
                    name: 'BiologicalEffect',
                    label: 'Biological Effect',
                    comment: 'Effect on biological systems',
                    category: 'effect'
                }
            },
            properties: {},
            individuals: {},
            hierarchies: {
                roots: ['Biomaterial', 'MedicalDevice', 'BiologicalProcess', 'MaterialProperty', 'BiologicalEffect'],
                children: {},
                parents: {}
            }
        };
    }

    /**
   * Search ontology classes by term
   */
    searchClasses(ontology, searchTerm) {
        const results = [];
        const term = searchTerm.toLowerCase();

        Object.values(ontology.classes).forEach(classInfo => {
            const matches = [];

            if (classInfo.name.toLowerCase().includes(term)) {
                matches.push('name');
            }
            if (classInfo.label && classInfo.label.toLowerCase().includes(term)) {
                matches.push('label');
            }
            if (classInfo.comment && classInfo.comment.toLowerCase().includes(term)) {
                matches.push('comment');
            }
            if (classInfo.synonyms && classInfo.synonyms.some(syn => syn.toLowerCase().includes(term))) {
                matches.push('synonym');
            }

            if (matches.length > 0) {
                results.push({
                    ...classInfo,
                    matchTypes: matches,
                    relevance: matches.length
                });
            }
        });

        return results.sort((a, b) => b.relevance - a.relevance);
    }

    /**
   * Get class hierarchy path
   */
    getClassPath(ontology, className) {
        const path = [];
        let current = className;

        while (current && ontology.hierarchies.parents[current]) {
            const parents = ontology.hierarchies.parents[current];
            if (parents.length > 0) {
                current = parents[0]; // Take first parent
                path.unshift(current);
            } else {
                break;
            }
        }

        path.push(className);
        return path;
    }

    /**
   * Clear cache
   */
    clearCache() {
        this.cache.clear();
    }

    /**
   * Get cache statistics
   */
    getCacheStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys())
        };
    }
}

// Global instance
window.Owl2DictConverter = new Owl2DictConverter();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Owl2DictConverter;
}
