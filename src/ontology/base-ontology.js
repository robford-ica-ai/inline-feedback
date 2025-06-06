/**
 * Base Medical Ontology
 * Core foundation for medical term recognition and classification
 */

const BASE_ONTOLOGY = {
    // Core medical prefixes and suffixes for term recognition
    wordPatterns: {
        prefixes: [
            'anti', 'auto', 'bio', 'cardio', 'cerebro', 'chemo', 'cyto', 'derm', 'electro',
            'endo', 'epi', 'gastro', 'hemato', 'hepato', 'hyper', 'hypo', 'immuno',
            'inter', 'intra', 'macro', 'mega', 'micro', 'mono', 'multi', 'neuro',
            'ortho', 'osteo', 'para', 'patho', 'poly', 'post', 'pre', 'proto',
            'pseudo', 'psycho', 'retro', 'semi', 'sub', 'supra', 'trans', 'ultra'
        ],
        suffixes: [
            'algia', 'ation', 'cyte', 'ectomy', 'emia', 'genesis', 'gram', 'graph',
            'itis', 'logy', 'lysis', 'oma', 'osis', 'pathy', 'phobia', 'plasty',
            'scope', 'scopy', 'stomy', 'therapy', 'tomy', 'trophy'
        ],
        roots: [
            'angio', 'arthro', 'broncho', 'carcino', 'cranio', 'derma', 'fibro',
            'gastro', 'glyco', 'hema', 'hepato', 'histio', 'hydro', 'laparo',
            'leuko', 'lipo', 'lympho', 'myelo', 'nephro', 'neuro', 'onco',
            'osteo', 'phago', 'phlebo', 'pneumo', 'reno', 'rhino', 'sarco',
            'skeleto', 'thrombo', 'vaso'
        ]
    },

    // Medical measurement units
    units: {
        mass: ['mg', 'g', 'kg', 'μg', 'ng', 'pg'],
        volume: ['ml', 'L', 'μL', 'dL'],
        concentration: ['mg/ml', 'mg/L', 'μg/ml', 'mol/L', 'mmol/L', 'μmol/L'],
        pressure: ['mmHg', 'Pa', 'kPa', 'torr', 'atm'],
        temperature: ['°C', '°F', 'K'],
        time: ['sec', 'min', 'hr', 'day', 'week', 'month', 'year'],
        frequency: ['Hz', 'kHz', 'MHz', 'bpm'],
        electrical: ['V', 'mV', 'μV', 'A', 'mA', 'μA', 'Ω', 'kΩ']
    },

    // Standard abbreviations
    abbreviations: {
        // Anatomical
        'CNS': 'Central Nervous System',
        'PNS': 'Peripheral Nervous System',
        'CVS': 'Cardiovascular System',
        'GI': 'Gastrointestinal',
        'GU': 'Genitourinary',
        'MSK': 'Musculoskeletal',
        'HEENT': 'Head, Eyes, Ears, Nose, Throat',

        // Clinical
        'BP': 'Blood Pressure',
        'HR': 'Heart Rate',
        'RR': 'Respiratory Rate',
        'O2': 'Oxygen',
        'CO2': 'Carbon Dioxide',
        'ECG': 'Electrocardiogram',
        'EEG': 'Electroencephalogram',
        'MRI': 'Magnetic Resonance Imaging',
        'CT': 'Computed Tomography',
        'US': 'Ultrasound',
        'X-ray': 'Radiograph',

        // Laboratory
        'CBC': 'Complete Blood Count',
        'CMP': 'Comprehensive Metabolic Panel',
        'BUN': 'Blood Urea Nitrogen',
        'Cr': 'Creatinine',
        'BNP': 'B-type Natriuretic Peptide',
        'troponin': 'Cardiac Troponin',
        'CK': 'Creatine Kinase',
        'LDH': 'Lactate Dehydrogenase',
        'AST': 'Aspartate Aminotransferase',
        'ALT': 'Alanine Aminotransferase',
        'ALP': 'Alkaline Phosphatase',
        'PT': 'Prothrombin Time',
        'PTT': 'Partial Thromboplastin Time',
        'INR': 'International Normalized Ratio',

        // Medications
        'NSAID': 'Non-Steroidal Anti-Inflammatory Drug',
        'ACE': 'Angiotensin-Converting Enzyme',
        'ARB': 'Angiotensin Receptor Blocker',
        'PPI': 'Proton Pump Inhibitor',
        'SSRI': 'Selective Serotonin Reuptake Inhibitor',
        'SNRI': 'Serotonin-Norepinephrine Reuptake Inhibitor'
    },

    // Classification hierarchies
    classifications: {
        materialTypes: {
            metals: {
                name: 'Metals',
                subtypes: ['pure metals', 'alloys', 'intermetallics'],
                properties: ['biocompatibility', 'corrosion resistance', 'mechanical strength']
            },
            polymers: {
                name: 'Polymers',
                subtypes: ['thermoplastics', 'thermosets', 'elastomers', 'biodegradable'],
                properties: ['biocompatibility', 'flexibility', 'degradation rate']
            },
            ceramics: {
                name: 'Ceramics',
                subtypes: ['oxide ceramics', 'non-oxide ceramics', 'glass ceramics'],
                properties: ['bioactivity', 'wear resistance', 'chemical inertness']
            },
            composites: {
                name: 'Composites',
                subtypes: ['fiber-reinforced', 'particle-reinforced', 'natural composites'],
                properties: ['tailored properties', 'lightweight', 'multifunctionality']
            }
        },

        deviceTypes: {
            implants: {
                name: 'Implants',
                subtypes: ['orthopedic', 'cardiovascular', 'dental', 'neurological'],
                requirements: ['biocompatibility', 'durability', 'mechanical properties']
            },
            instruments: {
                name: 'Instruments',
                subtypes: ['surgical', 'diagnostic', 'therapeutic', 'monitoring'],
                requirements: ['sterility', 'precision', 'reliability']
            },
            disposables: {
                name: 'Disposables',
                subtypes: ['single-use', 'limited-use', 'biodegradable'],
                requirements: ['cost-effectiveness', 'safety', 'ease of use']
            }
        },

        biologicalSystems: {
            cardiovascular: {
                name: 'Cardiovascular System',
                components: ['heart', 'blood vessels', 'blood'],
                functions: ['circulation', 'oxygen transport', 'nutrient delivery']
            },
            nervous: {
                name: 'Nervous System',
                components: ['brain', 'spinal cord', 'nerves'],
                functions: ['signal transmission', 'coordination', 'sensory processing']
            },
            musculoskeletal: {
                name: 'Musculoskeletal System',
                components: ['bones', 'muscles', 'joints', 'connective tissue'],
                functions: ['support', 'movement', 'protection']
            },
            respiratory: {
                name: 'Respiratory System',
                components: ['lungs', 'airways', 'respiratory muscles'],
                functions: ['gas exchange', 'breathing', 'pH regulation']
            }
        }
    },

    // Term validation patterns
    validationPatterns: {
        // Chemical formulas
        chemicalFormula: /^[A-Z][a-z]?(\d+)?([A-Z][a-z]?(\d+)?)*$/,

        // Medical codes
        icdCode: /^[A-Z]\d{2}(\.\d{1,2})?$/,
        cptCode: /^\d{5}$/,

        // Measurement values
        measurement: /^\d+(\.\d+)?\s*(mg|g|kg|ml|L|mmHg|°C|°F|%|units?)$/i,

        // Dosage patterns
        dosage: /^\d+(\.\d+)?\s*(mg|g|μg|ng|units?|IU)(\/(kg|day|hr|dose))?$/i,

        // Time patterns
        timeInterval: /^\d+(\.\d+)?\s*(sec|min|hr|day|week|month|year)s?$/i
    },

    // Confidence scoring weights
    confidenceWeights: {
        exactMatch: 1.0,
        partialMatch: 0.8,
        contextMatch: 0.6,
        patternMatch: 0.4,
        semanticMatch: 0.3
    },

    // Common medical contexts
    contexts: {
        clinical: {
            name: 'Clinical Context',
            keywords: ['patient', 'diagnosis', 'treatment', 'therapy', 'medication', 'procedure'],
            weightMultiplier: 1.2
        },
        research: {
            name: 'Research Context',
            keywords: ['study', 'trial', 'analysis', 'investigation', 'experiment', 'data'],
            weightMultiplier: 1.0
        },
        technical: {
            name: 'Technical Context',
            keywords: ['specification', 'standard', 'protocol', 'method', 'technique', 'procedure'],
            weightMultiplier: 0.9
        },
        regulatory: {
            name: 'Regulatory Context',
            keywords: ['FDA', 'CE', 'ISO', 'regulation', 'compliance', 'approval'],
            weightMultiplier: 1.1
        }
    }
};

/**
 * Base ontology utilities
 */
class BaseOntologyUtils {
    /**
     * Check if a term matches medical patterns
     * @param {string} term - Term to check
     * @returns {Object} Match information
     */
    static matchesMedicalPattern(term) {
        const termLower = term.toLowerCase();
        const results = {
            isLikelyMedical: false,
            matchedPatterns: [],
            confidence: 0
        };

        // Check prefixes
        for (const prefix of BASE_ONTOLOGY.wordPatterns.prefixes) {
            if (termLower.startsWith(prefix)) {
                results.matchedPatterns.push({ type: 'prefix', value: prefix });
                results.confidence += 0.3;
            }
        }

        // Check suffixes
        for (const suffix of BASE_ONTOLOGY.wordPatterns.suffixes) {
            if (termLower.endsWith(suffix)) {
                results.matchedPatterns.push({ type: 'suffix', value: suffix });
                results.confidence += 0.4;
            }
        }

        // Check roots
        for (const root of BASE_ONTOLOGY.wordPatterns.roots) {
            if (termLower.includes(root)) {
                results.matchedPatterns.push({ type: 'root', value: root });
                results.confidence += 0.5;
            }
        }

        // Check abbreviations
        if (BASE_ONTOLOGY.abbreviations[term]) {
            results.matchedPatterns.push({ type: 'abbreviation', value: term });
            results.confidence += 0.8;
        }

        // Check validation patterns
        for (const [patternName, pattern] of Object.entries(BASE_ONTOLOGY.validationPatterns)) {
            if (pattern.test(term)) {
                results.matchedPatterns.push({ type: 'pattern', value: patternName });
                results.confidence += 0.6;
            }
        }

        results.isLikelyMedical = results.confidence > 0.3;
        return results;
    }

    /**
     * Normalize medical term
     * @param {string} term - Term to normalize
     * @returns {string} Normalized term
     */
    static normalizeTerm(term) {
        return term
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
            .replace(/\s+/g, ' '); // Normalize whitespace
    }

    /**
     * Extract medical units from text
     * @param {string} text - Text to analyze
     * @returns {Array} Found units
     */
    static extractUnits(text) {
        const units = [];
        const allUnits = Object.values(BASE_ONTOLOGY.units).flat();

        for (const unit of allUnits) {
            const regex = new RegExp(`\\b\\d+(\\.\\d+)?\\s*${unit}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) {
                units.push(...matches);
            }
        }

        return units;
    }

    /**
     * Determine context of surrounding text
     * @param {string} text - Text to analyze
     * @returns {Object} Context analysis
     */
    static analyzeContext(text) {
        const textLower = text.toLowerCase();
        const contextScores = {};

        for (const [contextName, context] of Object.entries(BASE_ONTOLOGY.contexts)) {
            let score = 0;
            for (const keyword of context.keywords) {
                if (textLower.includes(keyword)) {
                    score += 1;
                }
            }
            contextScores[contextName] = score * context.weightMultiplier;
        }

        const maxScore = Math.max(...Object.values(contextScores));
        const primaryContext = Object.keys(contextScores).find(
            key => contextScores[key] === maxScore
        );

        return {
            primaryContext,
            scores: contextScores,
            confidence: maxScore / BASE_ONTOLOGY.contexts[primaryContext]?.keywords.length || 0
        };
    }

    /**
     * Get classification hierarchy for a term
     * @param {string} term - Term to classify
     * @param {string} category - Classification category
     * @returns {Object|null} Classification info
     */
    static getClassification(term, category) {
        const classifications = BASE_ONTOLOGY.classifications[category];
        if (!classifications) return null;

        const termLower = term.toLowerCase();
        for (const [key, classification] of Object.entries(classifications)) {
            if (termLower.includes(key) ||
                classification.subtypes?.some(subtype => termLower.includes(subtype))) {
                return {
                    category,
                    type: key,
                    ...classification
                };
            }
        }

        return null;
    }
}

// Export for global access
if (typeof window !== 'undefined') {
    window.BaseOntology = {
        data: BASE_ONTOLOGY,
        utils: BaseOntologyUtils
    };
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BASE_ONTOLOGY,
        BaseOntologyUtils
    };
}
