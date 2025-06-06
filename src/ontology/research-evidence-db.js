/**
 * Research Evidence Database
 * Manages PMID references, study classifications, and evidence quality
 * Based on ProjectDebbie's Gold Standard Set (1230+ studies)
 */

class ResearchEvidenceDatabase {
    constructor() {
        this.version = '1.0.0';
        this.goldStandardCount = 1230;
        this.lastUpdated = '2024-06-05';
        this.sources = [
            'PubMed',
            'MedlineRanker',
            'ProjectDebbie Gold Standard Set',
            'EU Horizon 2020 Research Database'
        ];
    }

    // Study classifications from ProjectDebbie
    getStudyTypes() {
        return {
            clinical: {
                name: 'Clinical Studies',
                description: 'Human clinical trials and observational studies',
                evidenceLevel: 'high',
                totalCount: 1092,
                sourceFile: 'clinical_gs_1092.txt'
            },
            laboratory: {
                name: 'Laboratory Studies',
                description: 'In vitro and in vivo preclinical studies',
                evidenceLevel: 'medium',
                totalCount: 1213,
                sourceFile: 'laboratory_gs_1213.txt'
            },
            original: {
                name: 'Original Gold Standard',
                description: 'Original validated research dataset',
                evidenceLevel: 'mixed',
                totalCount: 1230,
                sourceFile: 'gs_original_1230.txt'
            }
        };
    }

    // Sample research database with actual biocompatibility study structure
    getResearchDatabase() {
        return {
            // TITANIUM STUDIES
            '12345678': {
                pmid: '12345678',
                title: 'Long-term Outcomes of Titanium Dental Implants: A 10-Year Follow-up Study',
                authors: ['Smith JA', 'Johnson B', 'Wilson C'],
                journal: 'Journal of Oral Implantology',
                year: 2023,
                studyType: 'clinical',
                evidenceLevel: 'high',

                studyDesign: {
                    type: 'prospective cohort',
                    duration: '10 years',
                    sampleSize: 487,
                    followUpRate: '94.2%'
                },

                materials: ['titanium', 'Ti-6Al-4V'],
                applications: ['dental implants'],

                outcomes: {
                    successRate: '97.3%',
                    survivalRate: '95.8%',
                    complications: [
                        { event: 'peri-implantitis', rate: '3.2%' },
                        { event: 'implant loosening', rate: '1.8%' },
                        { event: 'allergic reaction', rate: '0.2%' }
                    ]
                },

                biocompatibilityFindings: {
                    osseointegration: 'excellent',
                    inflammatoryResponse: 'minimal',
                    boneDensity: 'maintained',
                    tissueReaction: 'favorable'
                },

                conclusions: 'Titanium dental implants demonstrate excellent long-term biocompatibility with high success rates',
                limitationsDisclaimed: ['single-center study', 'homogeneous population'],

                classification: {
                    debCategory: 'biomaterials',
                    materialProperty: 'biocompatibility',
                    medicalApplication: 'dental_restoration',
                    biologicalProcess: 'osseointegration'
                }
            },

            '23456789': {
                pmid: '23456789',
                title: 'Biocompatibility Assessment of Titanium Alloys in Orthopedic Applications',
                authors: ['Anderson KL', 'Brown M', 'Davis R'],
                journal: 'Biomaterials Science',
                year: 2022,
                studyType: 'laboratory',
                evidenceLevel: 'medium',

                studyDesign: {
                    type: 'in vitro cytotoxicity',
                    duration: '28 days',
                    cellLines: ['MC3T3-E1', 'U2OS'],
                    methodology: 'ISO 10993-5'
                },

                materials: ['titanium', 'Ti-6Al-4V', 'Ti-6Al-7Nb'],
                applications: ['orthopedic implants'],

                outcomes: {
                    cellViability: '>95%',
                    cytotoxicity: 'none detected',
                    genotoxicity: 'negative',
                    sensitization: 'negative'
                },

                biocompatibilityFindings: {
                    cellAdhesion: 'excellent',
                    proliferation: 'normal',
                    differentiation: 'enhanced',
                    inflammatory_markers: 'within normal range'
                },

                conclusions: 'Titanium alloys demonstrate excellent biocompatibility in standard testing protocols',

                classification: {
                    debCategory: 'biomaterials',
                    materialProperty: 'cytotoxicity',
                    testMethod: 'iso_10993',
                    biologicalProcess: 'cellular_response'
                }
            },

            // PEEK STUDIES
            '45678901': {
                pmid: '45678901',
                title: 'PEEK vs Titanium in Spinal Fusion: A Randomized Controlled Trial',
                authors: ['Thompson PJ', 'Garcia L', 'Lee H'],
                journal: 'Spine Journal',
                year: 2023,
                studyType: 'clinical',
                evidenceLevel: 'high',

                studyDesign: {
                    type: 'randomized controlled trial',
                    duration: '24 months',
                    sampleSize: 240,
                    groups: ['PEEK cage (n=120)', 'titanium cage (n=120)']
                },

                materials: ['peek', 'titanium'],
                applications: ['spinal fusion'],

                outcomes: {
                    fusionRate: {
                        peek: '89.2%',
                        titanium: '92.1%'
                    },
                    complicationRate: {
                        peek: '8.3%',
                        titanium: '6.7%'
                    },
                    radiographicAssessment: 'equivalent outcomes'
                },

                biocompatibilityFindings: {
                    tissueResponse: 'favorable for both materials',
                    inflammatory_response: 'minimal for both',
                    stress_shielding: 'reduced with PEEK',
                    artifact_on_imaging: 'less with PEEK'
                },

                conclusions: 'Both PEEK and titanium demonstrate good biocompatibility with comparable clinical outcomes',

                classification: {
                    debCategory: 'comparative_study',
                    materialProperty: 'mechanical_properties',
                    medicalApplication: 'spinal_fusion',
                    biologicalProcess: 'bone_healing'
                }
            },

            // NITINOL STUDIES
            '67890123': {
                pmid: '67890123',
                title: 'Nitinol Stent Biocompatibility: Endothelial Response and Thrombogenicity',
                authors: ['Martinez CD', 'Wong K', 'Roberts S'],
                journal: 'Circulation Research',
                year: 2022,
                studyType: 'laboratory',
                evidenceLevel: 'medium',

                studyDesign: {
                    type: 'in vitro endothelial culture',
                    duration: '14 days',
                    cellType: 'human umbilical vein endothelial cells',
                    conditions: ['static', 'flow conditions']
                },

                materials: ['nitinol', '316L stainless steel'],
                applications: ['cardiovascular stents'],

                outcomes: {
                    endothelialization: 'complete at 7 days',
                    thrombogenicity: 'low',
                    nickel_release: 'within acceptable limits',
                    cell_viability: '98.3%'
                },

                biocompatibilityFindings: {
                    endothelial_adhesion: 'excellent',
                    proliferation: 'normal',
                    inflammatory_markers: 'minimal elevation',
                    platelet_activation: 'low'
                },

                conclusions: 'Nitinol demonstrates excellent endothelial biocompatibility for cardiovascular applications',

                classification: {
                    debCategory: 'biomaterials',
                    materialProperty: 'hemocompatibility',
                    medicalApplication: 'cardiovascular_device',
                    biologicalProcess: 'endothelialization'
                }
            }
        };
    }

    // Get studies by material
    getStudiesByMaterial(materialId) {
        const database = this.getResearchDatabase();
        return Object.values(database).filter(study =>
            study.materials.includes(materialId)
        );
    }

    // Get studies by application
    getStudiesByApplication(application) {
        const database = this.getResearchDatabase();
        return Object.values(database).filter(study =>
            study.applications.includes(application)
        );
    }

    // Get study details by PMID
    getStudyByPMID(pmid) {
        const database = this.getResearchDatabase();
        return database[pmid] || null;
    }

    // Evidence quality assessment
    assessEvidenceQuality(pmid) {
        const study = this.getStudyByPMID(pmid);
        if (!study) return null;

        let score = 0;
        const factors = [];

        // Study design scoring
        if (study.studyType === 'clinical') {
            score += 3;
            factors.push('Clinical study (+3)');
        } else {
            score += 1;
            factors.push('Laboratory study (+1)');
        }

        // Sample size scoring (for clinical studies)
        if (study.studyType === 'clinical' && study.studyDesign.sampleSize) {
            if (study.studyDesign.sampleSize >= 200) {
                score += 2;
                factors.push('Large sample size (+2)');
            } else if (study.studyDesign.sampleSize >= 50) {
                score += 1;
                factors.push('Adequate sample size (+1)');
            }
        }

        // Follow-up duration
        if (study.studyDesign.duration) {
            const duration = study.studyDesign.duration;
            if (duration.includes('year') && parseInt(duration) >= 5) {
                score += 2;
                factors.push('Long-term follow-up (+2)');
            } else if (duration.includes('month') && parseInt(duration) >= 12) {
                score += 1;
                factors.push('Adequate follow-up (+1)');
            }
        }

        // Journal impact factor (simplified scoring)
        const highImpactJournals = ['Nature', 'Science', 'NEJM', 'Lancet', 'Biomaterials'];
        if (highImpactJournals.some(journal => study.journal.includes(journal))) {
            score += 1;
            factors.push('High impact journal (+1)');
        }

        // Quality assessment
        let quality = 'low';
        if (score >= 6) quality = 'high';
        else if (score >= 4) quality = 'medium';

        return {
            pmid: pmid,
            qualityScore: score,
            qualityLevel: quality,
            factors: factors,
            recommendation: this.getRecommendation(quality)
        };
    }

    getRecommendation(qualityLevel) {
        const recommendations = {
            high: 'Strong evidence - suitable for clinical decision making',
            medium: 'Moderate evidence - consider with other sources',
            low: 'Limited evidence - interpret with caution'
        };
        return recommendations[qualityLevel];
    }

    // Generate evidence summary for material
    generateEvidenceSummary(materialId) {
        const studies = this.getStudiesByMaterial(materialId);
        if (studies.length === 0) return 'No studies found for this material';

        const clinical = studies.filter(s => s.studyType === 'clinical');
        const laboratory = studies.filter(s => s.studyType === 'laboratory');

        const totalPatients = clinical.reduce((sum, study) =>
            sum + (study.studyDesign.sampleSize || 0), 0);

        return {
            totalStudies: studies.length,
            clinicalStudies: clinical.length,
            laboratoryStudies: laboratory.length,
            totalPatients: totalPatients,
            evidenceLevels: {
                high: studies.filter(s => s.evidenceLevel === 'high').length,
                medium: studies.filter(s => s.evidenceLevel === 'medium').length,
                low: studies.filter(s => s.evidenceLevel === 'low').length
            },
            latestStudy: Math.max(...studies.map(s => s.year)),
            keyFindings: this.extractKeyFindings(studies)
        };
    }

    extractKeyFindings(studies) {
        const findings = {
            biocompatibility: [],
            complications: [],
            successRates: []
        };

        studies.forEach(study => {
            if (study.biocompatibilityFindings) {
                Object.entries(study.biocompatibilityFindings).forEach(([key, value]) => {
                    findings.biocompatibility.push(`${key}: ${value}`);
                });
            }

            if (study.outcomes.successRate) {
                findings.successRates.push(study.outcomes.successRate);
            }

            if (study.outcomes.complications) {
                study.outcomes.complications.forEach(comp => {
                    findings.complications.push(`${comp.event}: ${comp.rate}`);
                });
            }
        });

        return findings;
    }

    // Search studies by keywords
    searchStudies(keywords) {
        const database = this.getResearchDatabase();
        const results = [];
        const searchTerms = keywords.toLowerCase().split(' ');

        Object.values(database).forEach(study => {
            const searchText = `
        ${study.title} 
        ${study.materials.join(' ')} 
        ${study.applications.join(' ')}
        ${study.conclusions}
      `.toLowerCase();

            const matches = searchTerms.filter(term => searchText.includes(term));
            if (matches.length > 0) {
                results.push({
                    ...study,
                    relevance: matches.length / searchTerms.length
                });
            }
        });

        return results.sort((a, b) => b.relevance - a.relevance);
    }

    // Get study metadata for integration with ontology
    getStudyMetadata(pmid) {
        const study = this.getStudyByPMID(pmid);
        if (!study) return null;

        return {
            pmid: pmid,
            evidenceLevel: study.evidenceLevel,
            studyType: study.studyType,
            year: study.year,
            sampleSize: study.studyDesign.sampleSize,
            materials: study.materials,
            applications: study.applications,
            qualityAssessment: this.assessEvidenceQuality(pmid)
        };
    }
}

// Global instance
window.ResearchEvidenceDatabase = new ResearchEvidenceDatabase();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResearchEvidenceDatabase;
}
