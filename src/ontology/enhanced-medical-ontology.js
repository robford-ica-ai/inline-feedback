/**
 * Enhanced Medical Ontology - Provides medical ontology data
 * Contains information about biomaterials and medical devices
 */

// Create the Enhanced Medical Ontology
const EnhancedMedicalOntology = {
    // Biomaterials data
    biomaterials: [
        {
            id: 'titanium',
            name: 'Titanium',
            category: 'metal',
            synonyms: ['Ti', 'Titanium alloy', 'Ti-6Al-4V'],
            description: 'A strong, lightweight, corrosion-resistant metal commonly used in medical implants and devices.',
            properties: {
                density: '4.5 g/cm³',
                elasticModulus: '110 GPa',
                tensileStrength: '900 MPa',
                biocompatibility: 'Excellent',
                corrosionResistance: 'Excellent'
            },
            applications: [
                'Orthopedic implants',
                'Dental implants',
                'Cardiovascular devices',
                'Craniofacial reconstruction',
                'Spinal devices'
            ],
            standards: [
                'ASTM F67',
                'ASTM F136',
                'ISO 5832-2',
                'ISO 5832-3'
            ]
        },
        {
            id: 'peek',
            name: 'PEEK',
            category: 'polymer',
            synonyms: ['Polyetheretherketone', 'Polyether ether ketone'],
            description: 'A high-performance thermoplastic polymer with excellent mechanical properties and biocompatibility.',
            properties: {
                density: '1.3 g/cm³',
                elasticModulus: '3-4 GPa',
                tensileStrength: '90-100 MPa',
                biocompatibility: 'Excellent',
                thermalStability: 'Excellent'
            },
            applications: [
                'Spinal implants',
                'Orthopedic devices',
                'Dental implants',
                'Cranial implants',
                'Trauma fixation'
            ],
            standards: [
                'ASTM F2026',
                'ISO 10993'
            ]
        },
        {
            id: 'hydroxyapatite',
            name: 'Hydroxyapatite',
            category: 'ceramic',
            synonyms: ['HA', 'Calcium hydroxyapatite', 'Ca₁₀(PO₄)₆(OH)₂'],
            description: 'A naturally occurring mineral form of calcium apatite, similar to the mineral component of bone and teeth.',
            properties: {
                density: '3.16 g/cm³',
                compressiveStrength: '400-900 MPa',
                biocompatibility: 'Excellent',
                bioactivity: 'High',
                biodegradation: 'Slow'
            },
            applications: [
                'Bone graft substitutes',
                'Dental implants',
                'Coatings for metal implants',
                'Bone tissue engineering',
                'Drug delivery systems'
            ],
            standards: [
                'ASTM F1185',
                'ISO 13779'
            ]
        },
        {
            id: 'plga',
            name: 'PLGA',
            category: 'polymer',
            synonyms: ['Poly(lactic-co-glycolic acid)', 'Poly(lactide-co-glycolide)'],
            description: 'A biodegradable copolymer used in a variety of biomedical applications, particularly drug delivery and tissue engineering.',
            properties: {
                density: '1.3 g/cm³',
                glassTranTemp: '45-55°C',
                degradationTime: '1-6 months',
                biocompatibility: 'Good',
                biodegradation: 'Controllable'
            },
            applications: [
                'Drug delivery systems',
                'Tissue engineering scaffolds',
                'Sutures',
                'Stents',
                'Orthopedic fixation devices'
            ],
            standards: [
                'ASTM F1925',
                'ISO 10993'
            ]
        },
        {
            id: 'stainlessSteel316L',
            name: 'Stainless Steel 316L',
            category: 'metal',
            synonyms: ['SS316L', '316L SS', 'Surgical stainless steel'],
            description: 'A low-carbon variant of stainless steel with excellent corrosion resistance and biocompatibility.',
            properties: {
                density: '8.0 g/cm³',
                elasticModulus: '200 GPa',
                tensileStrength: '485-860 MPa',
                biocompatibility: 'Good',
                corrosionResistance: 'Very good'
            },
            applications: [
                'Orthopedic implants',
                'Cardiovascular stents',
                'Surgical instruments',
                'Trauma fixation devices',
                'Dental appliances'
            ],
            standards: [
                'ASTM F138',
                'ASTM F139',
                'ISO 5832-1'
            ]
        },
        {
            id: 'cobaltChromium',
            name: 'Cobalt Chromium',
            category: 'metal',
            synonyms: ['CoCr', 'Cobalt-chrome', 'Vitallium'],
            description: 'An alloy with high strength, wear resistance, and biocompatibility, commonly used in load-bearing implants.',
            properties: {
                density: '8.3-9.1 g/cm³',
                elasticModulus: '210-250 GPa',
                tensileStrength: '600-1795 MPa',
                biocompatibility: 'Good',
                wearResistance: 'Excellent'
            },
            applications: [
                'Joint replacements',
                'Dental prosthetics',
                'Cardiovascular stents',
                'Spinal devices',
                'Orthopedic implants'
            ],
            standards: [
                'ASTM F75',
                'ASTM F90',
                'ASTM F562',
                'ISO 5832-4',
                'ISO 5832-5',
                'ISO 5832-12'
            ]
        },
        {
            id: 'zirconia',
            name: 'Zirconia',
            category: 'ceramic',
            synonyms: ['ZrO₂', 'Zirconium dioxide', 'Zirconium oxide'],
            description: 'A ceramic material with high strength, fracture toughness, and biocompatibility, used in dental and orthopedic applications.',
            properties: {
                density: '6.05 g/cm³',
                compressiveStrength: '2000 MPa',
                fractureToughness: '5-10 MPa·m½',
                biocompatibility: 'Excellent',
                wearResistance: 'Excellent'
            },
            applications: [
                'Dental implants',
                'Dental crowns and bridges',
                'Femoral heads in hip replacements',
                'Orthopedic implants',
                'Cutting instruments'
            ],
            standards: [
                'ISO 13356',
                'ASTM F1873'
            ]
        },
        {
            id: 'collagen',
            name: 'Collagen',
            category: 'natural',
            synonyms: ['Type I collagen', 'Collagen matrix'],
            description: 'A natural protein that is the main component of connective tissues, widely used in tissue engineering and regenerative medicine.',
            properties: {
                source: 'Bovine, porcine, or human',
                degradationTime: 'Variable (days to months)',
                biocompatibility: 'Excellent',
                immunogenicity: 'Low to moderate',
                cellAdhesion: 'Excellent'
            },
            applications: [
                'Wound dressings',
                'Tissue engineering scaffolds',
                'Soft tissue augmentation',
                'Drug delivery systems',
                'Hemostatic agents'
            ],
            standards: [
                'ASTM F2212',
                'ISO 10993'
            ]
        },
        {
            id: 'chitosan',
            name: 'Chitosan',
            category: 'natural',
            synonyms: ['Poly-D-glucosamine', 'Deacetylated chitin'],
            description: 'A linear polysaccharide derived from chitin, with antimicrobial and wound-healing properties.',
            properties: {
                source: 'Crustacean shells',
                degradationTime: 'Weeks to months',
                biocompatibility: 'Good',
                antimicrobial: 'Yes',
                biodegradation: 'Enzymatic'
            },
            applications: [
                'Wound dressings',
                'Drug delivery systems',
                'Tissue engineering scaffolds',
                'Hemostatic agents',
                'Antimicrobial coatings'
            ],
            standards: [
                'ASTM F2103',
                'ISO 10993'
            ]
        },
        {
            id: 'carbonFiberReinforced',
            name: 'Carbon Fiber Reinforced Polymer',
            category: 'composite',
            synonyms: ['CFRP', 'Carbon composite', 'Carbon fiber composite'],
            description: 'A strong, lightweight composite material consisting of carbon fibers embedded in a polymer matrix.',
            properties: {
                density: '1.5-2.0 g/cm³',
                elasticModulus: '70-200 GPa',
                tensileStrength: '600-3000 MPa',
                biocompatibility: 'Good',
                fatigueResistance: 'Excellent'
            },
            applications: [
                'Orthopedic implants',
                'Prosthetic limbs',
                'Spinal devices',
                'External fixation devices',
                'Imaging-compatible devices'
            ],
            standards: [
                'ISO 10993',
                'ASTM D3039',
                'ASTM D4762'
            ]
        }
    ],
    
    // Medical devices data
    medicalDevices: [
        {
            id: 'hipImplant',
            name: 'Hip Implant',
            category: 'orthopedic',
            materials: ['titanium', 'cobaltChromium', 'polyethylene', 'ceramics'],
            description: 'A prosthetic device used to replace a damaged hip joint, typically consisting of a femoral stem, femoral head, and acetabular cup.',
            applications: [
                'Total hip replacement',
                'Hip resurfacing',
                'Partial hip replacement'
            ],
            standards: [
                'ISO 7206',
                'ASTM F2068',
                'ASTM F2033'
            ]
        },
        {
            id: 'dentalImplant',
            name: 'Dental Implant',
            category: 'dental',
            materials: ['titanium', 'zirconia', 'titaniumAlloy'],
            description: 'A surgical component that interfaces with the bone of the jaw or skull to support dental prostheses.',
            applications: [
                'Single tooth replacement',
                'Multiple tooth replacement',
                'Full arch reconstruction',
                'Overdenture support'
            ],
            standards: [
                'ISO 14801',
                'ASTM F67',
                'ASTM F136'
            ]
        },
        {
            id: 'coronaryStent',
            name: 'Coronary Stent',
            category: 'cardiovascular',
            materials: ['stainlessSteel316L', 'cobaltChromium', 'platinum', 'plga'],
            description: 'A tube-shaped device placed in coronary arteries to keep them open and prevent restenosis after angioplasty.',
            applications: [
                'Treatment of coronary artery disease',
                'Prevention of restenosis',
                'Drug delivery to vessel walls'
            ],
            standards: [
                'ISO 25539-2',
                'ASTM F2129',
                'ASTM F2081'
            ]
        },
        {
            id: 'spinalCage',
            name: 'Spinal Cage',
            category: 'orthopedic',
            materials: ['peek', 'titanium', 'carbonFiberReinforced'],
            description: 'An implant used in spinal fusion procedures to maintain foraminal height and decompression.',
            applications: [
                'Spinal fusion',
                'Degenerative disc disease treatment',
                'Spondylolisthesis treatment',
                'Spinal stenosis treatment'
            ],
            standards: [
                'ASTM F2077',
                'ASTM F2267',
                'ISO 10993'
            ]
        },
        {
            id: 'kneeImplant',
            name: 'Knee Implant',
            category: 'orthopedic',
            materials: ['cobaltChromium', 'titanium', 'polyethylene', 'ceramics'],
            description: 'A prosthetic device used to replace a damaged knee joint, typically consisting of femoral, tibial, and patellar components.',
            applications: [
                'Total knee replacement',
                'Partial knee replacement',
                'Revision knee surgery'
            ],
            standards: [
                'ISO 14243',
                'ASTM F1223',
                'ASTM F2083'
            ]
        }
    ],
    
    // Get all biomaterials
    getBiomaterials: function() {
        return this.biomaterials;
    },
    
    // Get biomaterial by ID
    getBiomaterial: function(id) {
        return this.biomaterials.find(material => material.id === id);
    },
    
    // Get biomaterials by category
    getBiomaterialsByCategory: function(category) {
        return this.biomaterials.filter(material => material.category === category);
    },
    
    // Find material by name or synonym
    findMaterial: function(name) {
        if (!name) return null;
        
        const lowerName = name.toLowerCase();
        
        return this.biomaterials.find(material => {
            // Check name
            if (material.name.toLowerCase() === lowerName) {
                return true;
            }
            
            // Check synonyms
            if (material.synonyms && material.synonyms.some(synonym => synonym.toLowerCase() === lowerName)) {
                return true;
            }
            
            return false;
        });
    },
    
    // Get all medical devices
    getMedicalDevices: function() {
        return this.medicalDevices;
    },
    
    // Get medical device by ID
    getMedicalDevice: function(id) {
        return this.medicalDevices.find(device => device.id === id);
    },
    
    // Get medical devices by category
    getMedicalDevicesByCategory: function(category) {
        return this.medicalDevices.filter(device => device.category === category);
    },
    
    // Get medical devices by material
    getMedicalDevicesByMaterial: function(materialId) {
        return this.medicalDevices.filter(device => device.materials.includes(materialId));
    }
};

// Make available globally
window.EnhancedMedicalOntology = EnhancedMedicalOntology;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedMedicalOntology;
}
