/**
 * Medical Devices Ontology
 * Database of medical devices, implants, and surgical instruments
 */

const MEDICAL_DEVICES = {
    // Cardiovascular Devices
    cardiovascular: {
        stents: {
            name: "Stents",
            description: "Tubular supports placed inside blood vessels",
            types: ["Drug-eluting stents", "Bare metal stents", "Bioresorbable stents"],
            materials: ["316L stainless steel", "Cobalt-chromium", "Platinum-chromium", "PLLA"],
            applications: ["Coronary artery disease", "Peripheral artery disease"],
            fdaClass: "Class III",
            regulations: ["FDA 510(k)", "CE marking", "ISO 25539"],
            risks: ["Thrombosis", "Restenosis", "Stent fracture"]
        },
        pacemakers: {
            name: "Cardiac Pacemakers",
            description: "Electronic devices that regulate heart rhythm",
            types: ["Single chamber", "Dual chamber", "Biventricular"],
            materials: ["Titanium", "Lithium battery", "Polyurethane leads"],
            applications: ["Bradycardia", "Heart block", "Heart failure"],
            fdaClass: "Class III",
            regulations: ["FDA PMA", "ISO 14708-2"],
            risks: ["Lead displacement", "Infection", "Battery depletion"]
        },
        heartValves: {
            name: "Heart Valves",
            description: "Artificial valves that replace damaged heart valves",
            types: ["Mechanical valves", "Bioprosthetic valves", "Transcatheter valves"],
            materials: ["Pyrolytic carbon", "Bovine pericardium", "Porcine valve"],
            applications: ["Aortic stenosis", "Mitral regurgitation"],
            fdaClass: "Class III",
            regulations: ["FDA PMA", "ISO 5840"],
            risks: ["Thromboembolism", "Structural deterioration", "Paravalvular leak"]
        }
    },

    // Orthopedic Devices
    orthopedic: {
        hipImplants: {
            name: "Hip Implants",
            description: "Artificial joints for hip replacement",
            types: ["Total hip replacement", "Partial hip replacement", "Hip resurfacing"],
            materials: ["Titanium alloy", "Cobalt-chromium", "UHMWPE", "Ceramic"],
            applications: ["Osteoarthritis", "Hip fractures", "Avascular necrosis"],
            fdaClass: "Class III",
            regulations: ["FDA 510(k)", "ISO 21534"],
            risks: ["Dislocation", "Loosening", "Wear debris", "Metallosis"]
        },
        kneeImplants: {
            name: "Knee Implants",
            description: "Artificial joints for knee replacement",
            types: ["Total knee replacement", "Partial knee replacement", "Unicompartmental"],
            materials: ["Cobalt-chromium", "Titanium", "UHMWPE", "Ceramic"],
            applications: ["Osteoarthritis", "Rheumatoid arthritis", "Knee trauma"],
            fdaClass: "Class III",
            regulations: ["FDA 510(k)", "ISO 21534"],
            risks: ["Infection", "Loosening", "Stiffness", "Wear"]
        },
        spinalImplants: {
            name: "Spinal Implants",
            description: "Devices for spinal fusion and stabilization",
            types: ["Pedicle screws", "Spinal rods", "Interbody cages", "Artificial discs"],
            materials: ["Titanium alloy", "PEEK", "Tantalum", "Allograft bone"],
            applications: ["Degenerative disc disease", "Spinal stenosis", "Scoliosis"],
            fdaClass: "Class II/III",
            regulations: ["FDA 510(k)", "ISO 12189"],
            risks: ["Non-union", "Adjacent segment disease", "Hardware failure"]
        }
    },

    // Neurological Devices
    neurological: {
        neurostimulators: {
            name: "Neurostimulators",
            description: "Devices that deliver electrical stimulation to nerves",
            types: ["Deep brain stimulator", "Spinal cord stimulator", "Vagus nerve stimulator"],
            materials: ["Titanium", "Platinum-iridium electrodes", "Silicone"],
            applications: ["Parkinson's disease", "Chronic pain", "Epilepsy"],
            fdaClass: "Class III",
            regulations: ["FDA PMA", "ISO 14708-3"],
            risks: ["Infection", "Lead migration", "Device malfunction"]
        },
        cochlearImplants: {
            name: "Cochlear Implants",
            description: "Electronic devices that provide hearing sensation",
            types: ["Single-channel", "Multi-channel", "Hybrid implants"],
            materials: ["Titanium", "Platinum electrodes", "Silicone"],
            applications: ["Sensorineural hearing loss", "Congenital deafness"],
            fdaClass: "Class III",
            regulations: ["FDA PMA", "IEC 60601"],
            risks: ["Meningitis", "Facial nerve damage", "Device failure"]
        }
    },

    // Ophthalmic Devices
    ophthalmic: {
        intraocularLenses: {
            name: "Intraocular Lenses (IOLs)",
            description: "Artificial lenses implanted in the eye",
            types: ["Monofocal", "Multifocal", "Toric", "Accommodating"],
            materials: ["PMMA", "Silicone", "Acrylic", "Hydrophobic acrylic"],
            applications: ["Cataract surgery", "Refractive lens exchange"],
            fdaClass: "Class III",
            regulations: ["FDA 510(k)", "ISO 11979"],
            risks: ["PCO", "Dislocation", "Glare", "Halos"]
        },
        glaucomaDevices: {
            name: "Glaucoma Drainage Devices",
            description: "Implants to reduce intraocular pressure",
            types: ["Ahmed valve", "Baerveldt implant", "MIGS devices"],
            materials: ["Silicone", "Polypropylene", "Gold", "Titanium"],
            applications: ["Glaucoma", "Ocular hypertension"],
            fdaClass: "Class III",
            regulations: ["FDA 510(k)", "ISO 26872"],
            risks: ["Hypotony", "Diplopia", "Erosion", "Blockage"]
        }
    },

    // Dental Devices
    dental: {
        dentalImplants: {
            name: "Dental Implants",
            description: "Artificial tooth roots for replacing missing teeth",
            types: ["Endosteal", "Subperiosteal", "Zygomatic"],
            materials: ["Titanium", "Titanium alloy", "Zirconia"],
            applications: ["Single tooth replacement", "Multiple tooth replacement", "Full arch restoration"],
            fdaClass: "Class II",
            regulations: ["FDA 510(k)", "ISO 14801"],
            risks: ["Osseointegration failure", "Infection", "Nerve damage"]
        },
        orthodonticAppliances: {
            name: "Orthodontic Appliances",
            description: "Devices used to correct teeth and jaw alignment",
            types: ["Metal braces", "Ceramic braces", "Clear aligners", "Retainers"],
            materials: ["Stainless steel", "Titanium", "Ceramic", "Thermoplastic"],
            applications: ["Malocclusion", "Crowding", "Spacing", "Bite correction"],
            fdaClass: "Class II",
            regulations: ["FDA 510(k)", "ISO 15841"],
            risks: ["Root resorption", "Enamel decalcification", "Allergic reaction"]
        }
    },

    // General Surgery Devices
    generalSurgery: {
        surgicalMesh: {
            name: "Surgical Mesh",
            description: "Medical implants used to provide support to weakened tissue",
            types: ["Polypropylene mesh", "PTFE mesh", "Biologic mesh", "Composite mesh"],
            materials: ["Polypropylene", "PTFE", "Collagen", "Silk"],
            applications: ["Hernia repair", "Pelvic organ prolapse", "Chest wall reconstruction"],
            fdaClass: "Class II",
            regulations: ["FDA 510(k)", "ISO 13485"],
            risks: ["Infection", "Mesh erosion", "Chronic pain", "Adhesions"]
        },
        surgicalStaples: {
            name: "Surgical Staples",
            description: "Medical fasteners used for wound closure",
            types: ["Skin staples", "Internal staples", "Circular staplers"],
            materials: ["Titanium", "Stainless steel", "Absorbable polymers"],
            applications: ["Wound closure", "Anastomosis", "Tissue approximation"],
            fdaClass: "Class II",
            regulations: ["FDA 510(k)", "ISO 17664"],
            risks: ["Dehiscence", "Infection", "Allergic reaction"]
        }
    }
};

/**
 * Search medical devices by keyword
 * @param {string} keyword - Search term
 * @returns {Array} Matching devices
 */
function searchMedicalDevices(keyword) {
    const results = [];
    const searchTerm = keyword.toLowerCase();

    Object.keys(MEDICAL_DEVICES).forEach(category => {
        Object.keys(MEDICAL_DEVICES[category]).forEach(deviceKey => {
            const device = MEDICAL_DEVICES[category][deviceKey];
            
            // Search in name, description, types, materials, applications
            const searchableText = [
                device.name,
                device.description,
                ...(device.types || []),
                ...(device.materials || []),
                ...(device.applications || [])
            ].join(' ').toLowerCase();

            if (searchableText.includes(searchTerm)) {
                results.push({
                    category,
                    key: deviceKey,
                    ...device
                });
            }
        });
    });

    return results;
}

/**
 * Get device by category and key
 * @param {string} category - Device category
 * @param {string} key - Device key
 * @returns {Object|null} Device data
 */
function getDevice(category, key) {
    return MEDICAL_DEVICES[category]?.[key] || null;
}

/**
 * Get all devices in a category
 * @param {string} category - Device category
 * @returns {Object} All devices in category
 */
function getDevicesByCategory(category) {
    return MEDICAL_DEVICES[category] || {};
}

/**
 * Get regulatory information for a device
 * @param {string} category - Device category
 * @param {string} key - Device key
 * @returns {Object|null} Regulatory info
 */
function getDeviceRegulations(category, key) {
    const device = getDevice(category, key);
    if (!device) return null;

    return {
        fdaClass: device.fdaClass,
        regulations: device.regulations || [],
        risks: device.risks || []
    };
}

// Export for global access
if (typeof window !== 'undefined') {
    window.MedicalDevices = {
        data: MEDICAL_DEVICES,
        search: searchMedicalDevices,
        getDevice,
        getDevicesByCategory,
        getDeviceRegulations
    };
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MEDICAL_DEVICES,
        searchMedicalDevices,
        getDevice,
        getDevicesByCategory,
        getDeviceRegulations
    };
} 