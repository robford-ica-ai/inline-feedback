/**
 * Medical Devices Ontology - Defines medical devices terminology
 * Extends the base ontology with specific medical devices terms
 */
class MedicalDevicesOntology extends BaseOntology {
    constructor() {
        super();
        this.name = 'Medical Devices Ontology';
        this.version = '1.0.0';
    }

    // Load medical devices terms
    loadTerms() {
        // Implants
        this.addTerm('Hip Implant', 'orthopedic-implant', {
            description: 'A prosthetic device used to replace a damaged hip joint',
            materials: ['Titanium', 'Cobalt Chromium', 'UHMWPE'],
            applications: ['total hip replacement', 'hip resurfacing']
        });
        
        this.addTerm('Knee Implant', 'orthopedic-implant', {
            description: 'A prosthetic device used to replace a damaged knee joint',
            materials: ['Titanium', 'Cobalt Chromium', 'UHMWPE'],
            applications: ['total knee replacement', 'partial knee replacement']
        });
        
        this.addTerm('Dental Implant', 'dental-implant', {
            description: 'A surgical component that interfaces with the bone to support dental prosthesis',
            materials: ['Titanium', 'Zirconia'],
            applications: ['tooth replacement', 'dental prosthesis support']
        });
        
        this.addTerm('Spinal Implant', 'orthopedic-implant', {
            description: 'A device used to treat spinal disorders or injuries',
            materials: ['Titanium', 'PEEK', 'Carbon Fiber Reinforced Polymer'],
            applications: ['spinal fusion', 'disc replacement', 'spinal stabilization']
        });
        
        // Cardiovascular devices
        this.addTerm('Stent', 'cardiovascular-device', {
            description: 'A tube placed in a blood vessel or duct to maintain patency',
            materials: ['Nitinol', 'Stainless Steel 316L', 'PLGA'],
            applications: ['coronary artery disease', 'peripheral artery disease']
        });
        
        this.addTerm('Heart Valve', 'cardiovascular-device', {
            description: 'A device that regulates blood flow through the heart',
            materials: ['Carbon', 'Titanium', 'Bovine Tissue', 'Porcine Tissue'],
            applications: ['valve replacement', 'valve repair']
        });
        
        this.addTerm('Pacemaker', 'cardiovascular-device', {
            description: 'A device that regulates the heart beat',
            materials: ['Titanium', 'Silicone', 'Polyurethane'],
            applications: ['bradycardia', 'heart block', 'heart failure']
        });
        
        this.addTerm('Vascular Graft', 'cardiovascular-device', {
            description: 'A surgical implant used to redirect blood flow',
            materials: ['PTFE', 'Dacron', 'Polyester'],
            applications: ['aneurysm repair', 'bypass surgery']
        });
        
        // Surgical instruments
        this.addTerm('Scalpel', 'surgical-instrument', {
            description: 'A small and extremely sharp knife used for surgery',
            materials: ['Stainless Steel 316L', 'Carbon Steel'],
            applications: ['incision', 'dissection']
        });
        
        this.addTerm('Forceps', 'surgical-instrument', {
            description: 'A hand-held, hinged instrument used to grasp or hold objects',
            materials: ['Stainless Steel 316L'],
            applications: ['tissue manipulation', 'object retrieval']
        });
        
        this.addTerm('Retractor', 'surgical-instrument', {
            description: 'A surgical instrument used to hold back tissue or organs',
            materials: ['Stainless Steel 316L', 'Titanium'],
            applications: ['exposure', 'access']
        });
        
        this.addTerm('Surgical Needle', 'surgical-instrument', {
            description: 'A needle used to suture tissue',
            materials: ['Stainless Steel 316L'],
            applications: ['suturing', 'tissue approximation']
        });
        
        // Diagnostic devices
        this.addTerm('MRI Scanner', 'diagnostic-device', {
            description: 'A medical imaging device that uses magnetic fields and radio waves',
            materials: ['Various'],
            applications: ['soft tissue imaging', 'neurological assessment', 'musculoskeletal assessment']
        });
        
        this.addTerm('CT Scanner', 'diagnostic-device', {
            description: 'A medical imaging device that uses X-rays to create detailed images',
            materials: ['Various'],
            applications: ['bone imaging', 'cancer detection', 'trauma assessment']
        });
        
        this.addTerm('Ultrasound', 'diagnostic-device', {
            description: 'A medical imaging device that uses sound waves',
            materials: ['Various'],
            applications: ['pregnancy monitoring', 'cardiovascular assessment', 'abdominal imaging']
        });
        
        this.addTerm('X-ray Machine', 'diagnostic-device', {
            description: 'A medical imaging device that uses X-rays to create images',
            materials: ['Various'],
            applications: ['bone imaging', 'chest imaging', 'dental imaging']
        });
    }

    // Get devices by material
    getDevicesByMaterial(material) {
        if (!material || typeof material !== 'string') {
            return [];
        }
        
        const normalizedMaterial = material.toLowerCase().trim();
        const results = [];
        
        for (const termInfo of this.getAllTerms()) {
            if (termInfo.metadata && 
                termInfo.metadata.materials && 
                termInfo.metadata.materials.some(m => m.toLowerCase() === normalizedMaterial)) {
                results.push(termInfo);
            }
        }
        
        return results;
    }

    // Get devices by application
    getDevicesByApplication(application) {
        if (!application || typeof application !== 'string') {
            return [];
        }
        
        const normalizedApplication = application.toLowerCase().trim();
        const results = [];
        
        for (const termInfo of this.getAllTerms()) {
            if (termInfo.metadata && 
                termInfo.metadata.applications && 
                termInfo.metadata.applications.some(a => a.toLowerCase().includes(normalizedApplication))) {
                results.push(termInfo);
            }
        }
        
        return results;
    }

    // Get device materials
    getDeviceMaterials(term) {
        const termInfo = this.getTerm(term);
        
        if (!termInfo || !termInfo.metadata || !termInfo.metadata.materials) {
            return [];
        }
        
        return termInfo.metadata.materials;
    }

    // Get device applications
    getDeviceApplications(term) {
        const termInfo = this.getTerm(term);
        
        if (!termInfo || !termInfo.metadata || !termInfo.metadata.applications) {
            return [];
        }
        
        return termInfo.metadata.applications;
    }

    // Get device description
    getDeviceDescription(term) {
        const termInfo = this.getTerm(term);
        
        if (!termInfo || !termInfo.metadata || !termInfo.metadata.description) {
            return '';
        }
        
        return termInfo.metadata.description;
    }
}

// Make available globally
window.MedicalDevicesOntology = MedicalDevicesOntology;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MedicalDevicesOntology;
}
