/**
 * Medical Materials Ontology
 * Comprehensive database of biomedical materials with properties, applications, and regulatory info
 */

window.MedicalMaterialsOntology = {
  materials: {
    'titanium': {
      regex: /\b(titanium|Ti(?:\s*[-–]\s*6Al[-–]4V)?|Ti-6Al-4V|grade\s*[1-5]\s*titanium)\b/gi,
      category: 'metal',
      synonyms: ['Ti', 'titanium alloy', 'Ti-6Al-4V', 'Grade 2 titanium', 'Grade 5 titanium'],
      properties: {
        density: '4.51 g/cm³',
        meltingPoint: '1668°C',
        tensileStrength: '950 MPa',
        elasticModulus: '114 GPa',
        biocompatibility: 'excellent',
        corrosionResistance: 'excellent',
        magneticProperties: 'non-magnetic'
      },
      medicalUses: [
        'dental implants',
        'hip joint replacements',
        'knee joint replacements',
        'bone plates and screws',
        'spinal rods and cages',
        'pacemaker cases',
        'surgical instruments'
      ],
      advantages: [
        'Low density (lightweight)',
        'High strength-to-weight ratio',
        'Excellent biocompatibility',
        'MRI compatible',
        'Osseointegration capability'
      ],
      limitations: [
        'High cost',
        'Difficult to machine',
        'Potential for wear particle generation',
        'Stress shielding in long bones'
      ],
      fdaClass: 'Class II/III',
      astmStandards: ['ASTM F67', 'ASTM F136', 'ASTM F1472'],
      isoStandards: ['ISO 5832-2', 'ISO 5832-3']
    },

    'peek': {
      regex: /\b(PEEK|polyetheretherketone|poly\s*ether\s*ether\s*ketone)\b/gi,
      category: 'polymer',
      synonyms: ['polyetheretherketone', 'PEKK'],
      properties: {
        density: '1.32 g/cm³',
        meltingPoint: '343°C',
        tensileStrength: '90-100 MPa',
        elasticModulus: '3.6 GPa',
        biocompatibility: 'excellent',
        radiolucency: 'yes',
        chemicalResistance: 'excellent'
      },
      medicalUses: [
        'spinal fusion cages',
        'cranial implants',
        'dental implants',
        'orthopedic trauma plates',
        'cardiovascular stents'
      ],
      advantages: [
        'Radiolucent (transparent to X-rays)',
        'Elastic modulus similar to bone',
        'Chemical inertness',
        'Steam sterilizable',
        'Non-magnetic'
      ],
      limitations: [
        'Lower strength than metals',
        'Potential for wear',
        'Limited long-term data',
        'Higher cost than some polymers'
      ],
      fdaClass: 'Class II',
      astmStandards: ['ASTM F2026'],
      isoStandards: ['ISO 19642']
    },

    'nitinol': {
      regex: /\b(nitinol|NiTi|nickel[\s-]titanium|shape[\s-]memory\s+alloy)\b/gi,
      category: 'shape-memory alloy',
      synonyms: ['NiTi', 'nickel-titanium', 'memory metal'],
      properties: {
        composition: '~55% Ni, ~45% Ti',
        density: '6.45 g/cm³',
        transformationTemperature: '0-100°C (tunable)',
        superelasticity: 'yes',
        shapeMemory: 'yes',
        biocompatibility: 'good (Ni sensitivity concerns)',
        corrosionResistance: 'good'
      },
      medicalUses: [
        'cardiovascular stents',
        'guidewires',
        'orthodontic archwires',
        'surgical instruments',
        'bone staples',
        'compression implants'
      ],
      advantages: [
        'Superelastic behavior',
        'Shape memory effect',
        'High fatigue resistance',
        'Kink resistance',
        'Biocompatible oxide layer'
      ],
      limitations: [
        'Nickel sensitivity concerns',
        'Complex processing requirements',
        'High cost',
        'Temperature-dependent properties'
      ],
      fdaClass: 'Class II/III',
      astmStandards: ['ASTM F2063', 'ASTM F2516'],
      warnings: ['Potential nickel hypersensitivity reactions']
    },

    'cobalt_chrome': {
      regex: /\b(cobalt[\s-]chrome|Co[\s-]Cr|CoCrMo|stellite)\b/gi,
      category: 'metal',
      synonyms: ['Co-Cr', 'CoCrMo', 'cobalt-chromium-molybdenum', 'Stellite'],
      properties: {
        density: '8.3 g/cm³',
        meltingPoint: '1350-1400°C',
        tensileStrength: '900+ MPa',
        elasticModulus: '240 GPa',
        biocompatibility: 'good',
        wearResistance: 'excellent',
        corrosionResistance: 'excellent'
      },
      medicalUses: [
        'hip and knee joint replacements',
        'dental crowns and bridges',
        'heart valve components',
        'orthopedic implants',
        'surgical instruments'
      ],
      advantages: [
        'Excellent wear resistance',
        'High strength',
        'Good corrosion resistance',
        'Proven long-term performance'
      ],
      limitations: [
        'High elastic modulus',
        'Potential for metal ion release',
        'Difficult to machine',
        'High density'
      ],
      fdaClass: 'Class II/III',
      astmStandards: ['ASTM F75', 'ASTM F799', 'ASTM F1537']
    },

    'stainless_steel': {
      regex: /\b(stainless\s+steel|316L|316LVM|surgical\s+steel)\b/gi,
      category: 'metal',
      synonyms: ['316L', '316LVM', 'surgical steel', 'austenitic stainless steel'],
      properties: {
        density: '8.0 g/cm³',
        meltingPoint: '1400-1450°C',
        tensileStrength: '550-750 MPa',
        elasticModulus: '200 GPa',
        biocompatibility: 'good (short-term)',
        corrosionResistance: 'good',
        magneticProperties: 'weakly magnetic'
      },
      medicalUses: [
        'surgical instruments',
        'orthodontic appliances',
        'temporary implants',
        'bone plates and screws',
        'dental tools'
      ],
      advantages: [
        'Lower cost',
        'Easy to machine',
        'Good mechanical properties',
        'Established manufacturing'
      ],
      limitations: [
        'Potential for corrosion in vivo',
        'Not suitable for permanent implants',
        'Magnetic properties (MRI issues)',
        'Nickel content (allergy concerns)'
      ],
      fdaClass: 'Class II',
      astmStandards: ['ASTM F138', 'ASTM F139'],
      warnings: ['Not recommended for permanent implantation']
    },

    'uhmwpe': {
      regex: /\b(UHMWPE|ultra[\s-]high\s+molecular\s+weight\s+polyethylene|crosslinked\s+polyethylene)\b/gi,
      category: 'polymer',
      synonyms: ['ultra-high molecular weight polyethylene', 'crosslinked PE', 'XLPE'],
      properties: {
        density: '0.93-0.95 g/cm³',
        meltingPoint: '130-136°C',
        tensileStrength: '40-50 MPa',
        elasticModulus: '0.8-1.5 GPa',
        biocompatibility: 'excellent',
        wearResistance: 'good',
        chemicalResistance: 'excellent'
      },
      medicalUses: [
        'joint replacement bearings',
        'acetabular cup liners',
        'tibial inserts',
        'spinal disc replacements'
      ],
      advantages: [
        'Excellent biocompatibility',
        'Low friction coefficient',
        'Chemical inertness',
        'Self-lubricating',
        'Lightweight'
      ],
      limitations: [
        'Wear particle generation',
        'Oxidation susceptibility',
        'Lower strength than metals',
        'Creep under load'
      ],
      fdaClass: 'Class II',
      astmStandards: ['ASTM F648', 'ASTM F2026']
    },

    'hydroxyapatite': {
      regex: /\b(hydroxyapatite|HA|Ca10\(PO4\)6\(OH\)2|tricalcium\s+phosphate|TCP)\b/gi,
      category: 'ceramic',
      synonyms: ['HA', 'HAP', 'calcium phosphate ceramic', 'TCP'],
      properties: {
        density: '3.16 g/cm³',
        meltingPoint: '1650°C',
        compressiveStrength: '100-900 MPa',
        elasticModulus: '80-120 GPa',
        biocompatibility: 'excellent',
        bioactivity: 'osteoconductive',
        resorbability: 'partial'
      },
      medicalUses: [
        'bone graft substitutes',
        'dental implant coatings',
        'spinal fusion',
        'bone void fillers',
        'periodontal regeneration'
      ],
      advantages: [
        'Chemically similar to bone mineral',
        'Osteoconductive properties',
        'Excellent biocompatibility',
        'Promotes bone ingrowth'
      ],
      limitations: [
        'Brittle nature',
        'Low tensile strength',
        'Variable resorption rates',
        'Processing challenges'
      ],
      fdaClass: 'Class II/III',
      astmStandards: ['ASTM F1185', 'ASTM F2024']
    }
  },

  // Helper methods
  findMaterial(text) {
    for (const [key, material] of Object.entries(this.materials)) {
      if (material.regex.test(text)) {
        return { key, ...material };
      }
    }
    return null;
  },

  getAllRegexPatterns() {
    return Object.values(this.materials).map(m => m.regex);
  },

  searchByCategory(category) {
    return Object.entries(this.materials)
      .filter(([_, material]) => material.category === category)
      .map(([key, material]) => ({ key, ...material }));
  },

  searchByUse(medicalUse) {
    return Object.entries(this.materials)
      .filter(([_, material]) => 
        material.medicalUses.some(use => 
          use.toLowerCase().includes(medicalUse.toLowerCase())
        )
      )
      .map(([key, material]) => ({ key, ...material }));
  },

  getCategories() {
    return [...new Set(Object.values(this.materials).map(m => m.category))];
  },

  getMaterialsByStandard(standard) {
    return Object.entries(this.materials)
      .filter(([_, material]) => 
        material.astmStandards?.includes(standard) ||
        material.isoStandards?.includes(standard)
      )
      .map(([key, material]) => ({ key, ...material }));
  }
}; 