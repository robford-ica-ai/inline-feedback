/**
 * ProjectDebbie Integration Coordinator
 * Main coordinator for real EU Horizon 2020 ProjectDebbie integration
 * Combines DEBBIE API, DEB Ontology, and Gold Standard research database
 */

class ProjectDebbieCoordinator {
    constructor() {
        this.version = '2.0.0';
        this.source = 'EU Horizon 2020 ProjectDebbie Integration';
        this.initialized = false;

        // Component instances
        this.debbieApi = null;
        this.owl2dict = null;
        this.goldStandardLoader = null;

        // Integration state
        this.debOntology = null;
        this.goldStandardDatabase = null;
        this.annotationCategories = null;

        // Clinical validation framework
        this.validationFramework = {
            evidenceLevels: ['high', 'medium', 'low'],
            minimumStudies: {
                high: 50,
                medium: 20,
                low: 5
            },
            clinicalRecommendations: new Map()
        };

        this.cache = new Map();
        this.cacheTimeout = 1800000; // 30 minutes
    }

    /**
   * Initialize ProjectDebbie integration system
   */
    async initialize() {
        if (this.initialized) {
            console.log('ProjectDebbie integration already initialized');
            return this.getSystemStatus();
        }

        console.log('🧬 Initializing ProjectDebbie Integration System...');

        try {
            // Initialize component instances
            this.debbieApi = window.DebbieApiClient || new DebbieApiClient();
            this.owl2dict = window.Owl2DictConverter || new Owl2DictConverter();
            this.goldStandardLoader = window.GoldStandardPmidLoader || new GoldStandardPmidLoader();

            // Load core datasets in parallel
            const initResults = await Promise.allSettled([
                this.loadDebOntology(),
                this.loadGoldStandardDatabase(),
                this.loadAnnotationCategories()
            ]);

            // Process initialization results
            const [ontologyResult, goldStandardResult, categoriesResult] = initResults;

            const initStatus = {
                ontology: ontologyResult.status === 'fulfilled',
                goldStandard: goldStandardResult.status === 'fulfilled',
                categories: categoriesResult.status === 'fulfilled',
                errors: []
            };

            // Log any initialization errors
            initResults.forEach((result, index) => {
                if (result.status === 'rejected') {
                    const componentNames = ['DEB Ontology', 'Gold Standard Database', 'Annotation Categories'];
                    initStatus.errors.push({
                        component: componentNames[index],
                        error: result.reason?.message || 'Unknown error'
                    });
                }
            });

            this.initialized = true;
            console.log('✅ ProjectDebbie integration initialized successfully');
            console.log(`📊 System Status:`, initStatus);

            return {
                success: true,
                status: initStatus,
                version: this.version,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Failed to initialize ProjectDebbie integration:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
   * Load DEB ontology using OWL2DICT converter
   */
    async loadDebOntology() {
        console.log('📖 Loading DEB ontology...');
        try {
            this.debOntology = await this.owl2dict.loadDebOntology();
            console.log(`✅ DEB ontology loaded: ${this.debOntology.metadata.classes} classes`);
            return this.debOntology;
        } catch (error) {
            console.error('❌ Failed to load DEB ontology:', error);
            throw error;
        }
    }

    /**
   * Load gold standard PMID database
   */
    async loadGoldStandardDatabase() {
        console.log('📚 Loading gold standard PMID database...');
        try {
            this.goldStandardDatabase = await this.goldStandardLoader.loadAllGoldStandardSets();
            console.log(`✅ Gold standard loaded: ${this.goldStandardDatabase.metadata.totalStudies} studies`);
            return this.goldStandardDatabase;
        } catch (error) {
            console.error('❌ Failed to load gold standard database:', error);
            throw error;
        }
    }

    /**
   * Load DEBBIE annotation categories
   */
    async loadAnnotationCategories() {
        console.log('🏷️ Loading annotation categories...');
        try {
            this.annotationCategories = this.debbieApi.getAnnotationCategories();
            console.log(`✅ Annotation categories loaded: ${Object.keys(this.annotationCategories).length} categories`);
            return this.annotationCategories;
        } catch (error) {
            console.error('❌ Failed to load annotation categories:', error);
            throw error;
        }
    }

    /**
   * Enhanced material search with full ProjectDebbie integration
   */
    async searchMaterial(term, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        const searchOptions = {
            includeOntology: true,
            includeDebbie: true,
            includeGoldStandard: true,
            clinicalValidation: true,
            ...options
        };

        console.log(`🔍 Searching ProjectDebbie for: ${term}`);

        try {
            const searchResults = await Promise.allSettled([
                searchOptions.includeDebbie ? this.searchDebbieDatabase(term) : null,
                searchOptions.includeOntology ? this.searchDebOntology(term) : null,
                searchOptions.includeGoldStandard ? this.searchGoldStandardPmids(term) : null
            ]);

            const [debbieResult, ontologyResult, goldStandardResult] = searchResults;

            const integratedResults = {
                term: term,
                timestamp: new Date().toISOString(),
                source: this.source,

                // Core search results
                debbie: debbieResult?.status === 'fulfilled' ? debbieResult.value : null,
                ontology: ontologyResult?.status === 'fulfilled' ? ontologyResult.value : null,
                goldStandard: goldStandardResult?.status === 'fulfilled' ? goldStandardResult.value : null,

                // Integration analysis
                integration: this.analyzeIntegratedResults(
                    debbieResult?.value,
                    ontologyResult?.value,
                    goldStandardResult?.value
                ),

                // Clinical validation
                validation: searchOptions.clinicalValidation ?
                    await this.performClinicalValidation(term, {
                        debbie: debbieResult?.value,
                        ontology: ontologyResult?.value,
                        goldStandard: goldStandardResult?.value
                    }) : null,

                // Evidence summary
                evidenceSummary: this.generateEvidenceSummary(term, {
                    debbie: debbieResult?.value,
                    ontology: ontologyResult?.value,
                    goldStandard: goldStandardResult?.value
                })
            };

            console.log(`✅ ProjectDebbie search completed for: ${term}`);
            return integratedResults;

        } catch (error) {
            console.error(`❌ ProjectDebbie search failed for: ${term}`, error);
            return this.getFallbackSearchResults(term, error);
        }
    }

    /**
   * Search DEBBIE live database
   */
    async searchDebbieDatabase(term) {
        return await this.debbieApi.searchWithEvidenceValidation(term);
    }

    /**
   * Search DEB ontology
   */
    async searchDebOntology(term) {
        if (!this.debOntology) return null;

        return {
            classes: this.owl2dict.searchClasses(this.debOntology, term),
            metadata: this.debOntology.metadata,
            searchTerm: term
        };
    }

    /**
   * Search gold standard PMIDs (placeholder for future PubMed integration)
   */
    async searchGoldStandardPmids(term) {
        if (!this.goldStandardDatabase) return null;

        // For now, return metadata about available PMIDs
        // Future enhancement: integrate with PubMed API to search abstracts
        return {
            term: term,
            availablePmids: this.goldStandardDatabase.combinedPmids.total,
            sets: Object.keys(this.goldStandardDatabase.sets),
            searchNote: 'Abstract search requires PubMed API integration',
            metadata: this.goldStandardDatabase.metadata
        };
    }

    /**
   * Analyze integrated results from all sources
   */
    analyzeIntegratedResults(debbieData, ontologyData, goldStandardData) {
        const analysis = {
            dataAvailability: {
                debbie: !!debbieData,
                ontology: !!ontologyData,
                goldStandard: !!goldStandardData
            },

            convergence: {
                score: 0,
                factors: []
            },

            confidence: 'unknown',
            recommendations: []
        };

        // Calculate convergence score
        let convergenceScore = 0;

        if (debbieData?.evidence?.researchActivity) {
            convergenceScore += 2;
            analysis.convergence.factors.push('DEBBIE research activity available');
        }

        if (ontologyData?.classes?.length > 0) {
            convergenceScore += 2;
            analysis.convergence.factors.push(`${ontologyData.classes.length} ontology matches`);
        }

        if (goldStandardData?.availablePmids > 0) {
            convergenceScore += 1;
            analysis.convergence.factors.push('Gold standard PMID database available');
        }

        analysis.convergence.score = convergenceScore;

        // Determine confidence level
        if (convergenceScore >= 4) analysis.confidence = 'high';
        else if (convergenceScore >= 2) analysis.confidence = 'medium';
        else analysis.confidence = 'low';

        // Generate recommendations
        if (analysis.confidence === 'high') {
            analysis.recommendations.push('Strong multi-source evidence - suitable for clinical reference');
        } else if (analysis.confidence === 'medium') {
            analysis.recommendations.push('Moderate evidence - consider additional sources');
        } else {
            analysis.recommendations.push('Limited evidence - interpret with caution');
        }

        return analysis;
    }

    /**
   * Perform clinical validation using ProjectDebbie data
   */
    async performClinicalValidation(term, searchData) {
        const validation = {
            term: term,
            timestamp: new Date().toISOString(),
            evidenceLevel: 'insufficient',
            clinicalRecommendation: 'further_research_needed',
            factors: [],
            warnings: [],
            supportingEvidence: []
        };

        try {
            // Analyze DEBBIE evidence
            if (searchData.debbie?.evidence) {
                const debbieEvidence = searchData.debbie.evidence;

                if (debbieEvidence.researchActivity === 'very_high' || debbieEvidence.researchActivity === 'high') {
                    validation.factors.push('High research activity in DEBBIE database');
                    validation.supportingEvidence.push({
                        source: 'DEBBIE',
                        type: 'research_activity',
                        value: debbieEvidence.researchActivity
                    });
                }

                if (debbieEvidence.associatedConcepts.length >= 10) {
                    validation.factors.push(`Strong conceptual associations (${debbieEvidence.associatedConcepts.length})`);
                }
            }

            // Analyze ontology coverage
            if (searchData.ontology?.classes) {
                const ontologyMatches = searchData.ontology.classes.length;
                if (ontologyMatches > 0) {
                    validation.factors.push(`DEB ontology coverage (${ontologyMatches} classes)`);
                    validation.supportingEvidence.push({
                        source: 'DEB_Ontology',
                        type: 'semantic_coverage',
                        value: ontologyMatches
                    });
                }
            }

            // Analyze gold standard availability
            if (searchData.goldStandard?.availablePmids) {
                validation.factors.push(`Gold standard database (${searchData.goldStandard.availablePmids} studies)`);
                validation.supportingEvidence.push({
                    source: 'Gold_Standard',
                    type: 'study_availability',
                    value: searchData.goldStandard.availablePmids
                });
            }

            // Determine evidence level
            const factorCount = validation.factors.length;
            if (factorCount >= 3) {
                validation.evidenceLevel = 'high';
                validation.clinicalRecommendation = 'suitable_for_reference';
            } else if (factorCount >= 2) {
                validation.evidenceLevel = 'medium';
                validation.clinicalRecommendation = 'use_with_additional_sources';
            } else if (factorCount >= 1) {
                validation.evidenceLevel = 'low';
                validation.clinicalRecommendation = 'limited_guidance_available';
            }

            // Add warnings based on data gaps
            if (!searchData.debbie) {
                validation.warnings.push('DEBBIE database unavailable');
            }
            if (!searchData.ontology?.classes?.length) {
                validation.warnings.push('Limited ontological coverage');
            }
            if (!searchData.goldStandard?.availablePmids) {
                validation.warnings.push('Gold standard database unavailable');
            }

            return validation;

        } catch (error) {
            console.error('Clinical validation failed:', error);
            validation.warnings.push(`Validation error: ${error.message}`);
            return validation;
        }
    }

    /**
   * Generate comprehensive evidence summary
   */
    generateEvidenceSummary(term, searchData) {
        const summary = {
            term: term,
            overallStrength: 'insufficient',
            dataQuality: 'unknown',
            researchMaturity: 'unknown',
            clinicalRelevance: 'unknown',

            sourceBreakdown: {
                debbie: this.summarizeDebbieEvidence(searchData.debbie),
                ontology: this.summarizeOntologyEvidence(searchData.ontology),
                goldStandard: this.summarizeGoldStandardEvidence(searchData.goldStandard)
            },

            keyFindings: [],
            researchGaps: [],
            nextSteps: []
        };

        // Aggregate evidence strength
        const strengthScores = [];
        Object.values(summary.sourceBreakdown).forEach(source => {
            if (source?.strength) {
                strengthScores.push(this.convertStrengthToNumber(source.strength));
            }
        });

        if (strengthScores.length > 0) {
            const avgStrength = strengthScores.reduce((a, b) => a + b, 0) / strengthScores.length;
            summary.overallStrength = this.convertNumberToStrength(avgStrength);
        }

        // Generate key findings
        if (searchData.debbie?.evidence?.researchActivity) {
            summary.keyFindings.push(`Research activity: ${searchData.debbie.evidence.researchActivity}`);
        }

        if (searchData.ontology?.classes?.length > 0) {
            summary.keyFindings.push(`Ontological coverage: ${searchData.ontology.classes.length} semantic matches`);
        }

        // Identify research gaps
        if (!searchData.debbie) {
            summary.researchGaps.push('Live research database access needed');
        }
        if (!searchData.goldStandard?.availablePmids) {
            summary.researchGaps.push('Limited access to validated study corpus');
        }

        // Suggest next steps
        if (summary.overallStrength === 'high') {
            summary.nextSteps.push('Suitable for clinical reference and decision support');
        } else {
            summary.nextSteps.push('Requires additional evidence sources for clinical validation');
        }

        return summary;
    }

    /**
   * Summarize DEBBIE evidence
   */
    summarizeDebbieEvidence(debbieData) {
        if (!debbieData) return { available: false };

        return {
            available: true,
            strength: debbieData.validation?.evidenceQuality?.quality || 'unknown',
            researchActivity: debbieData.evidence?.researchActivity || 'unknown',
            associatedTerms: debbieData.evidence?.associatedConcepts?.length || 0,
            temporalCoverage: debbieData.validation?.temporalCoverage || null
        };
    }

    /**
   * Summarize ontology evidence
   */
    summarizeOntologyEvidence(ontologyData) {
        if (!ontologyData) return { available: false };

        const classCount = ontologyData.classes?.length || 0;
        let strength = 'low';
        if (classCount >= 5) strength = 'high';
        else if (classCount >= 2) strength = 'medium';

        return {
            available: true,
            strength: strength,
            classMatches: classCount,
            semanticCoverage: classCount > 0 ? 'present' : 'absent'
        };
    }

    /**
   * Summarize gold standard evidence
   */
    summarizeGoldStandardEvidence(goldStandardData) {
        if (!goldStandardData) return { available: false };

        return {
            available: true,
            strength: 'medium', // PMIDs available but abstracts not searched yet
            studyCount: goldStandardData.availablePmids || 0,
            studySets: goldStandardData.sets?.length || 0,
            note: goldStandardData.searchNote || 'PMID database available'
        };
    }

    /**
   * Convert strength to numeric value for calculations
   */
    convertStrengthToNumber(strength) {
        const values = { low: 1, medium: 2, high: 3 };
        return values[strength] || 0;
    }

    /**
   * Convert numeric value back to strength
   */
    convertNumberToStrength(value) {
        if (value >= 2.5) return 'high';
        if (value >= 1.5) return 'medium';
        return 'low';
    }

    /**
   * Get fallback search results
   */
    getFallbackSearchResults(term, error) {
        return {
            term: term,
            timestamp: new Date().toISOString(),
            source: 'fallback_offline',
            error: error?.message || 'ProjectDebbie integration unavailable',

            debbie: null,
            ontology: null,
            goldStandard: null,

            integration: {
                dataAvailability: { debbie: false, ontology: false, goldStandard: false },
                confidence: 'none'
            },

            validation: {
                evidenceLevel: 'unavailable',
                clinicalRecommendation: 'system_offline'
            }
        };
    }

    /**
   * Get system status
   */
    getSystemStatus() {
        return {
            initialized: this.initialized,
            version: this.version,
            source: this.source,

            components: {
                debbieApi: !!this.debbieApi,
                owl2dict: !!this.owl2dict,
                goldStandardLoader: !!this.goldStandardLoader
            },

            datasets: {
                debOntology: !!this.debOntology,
                goldStandardDatabase: !!this.goldStandardDatabase,
                annotationCategories: !!this.annotationCategories
            },

            cacheStats: {
                size: this.cache.size,
                entries: Array.from(this.cache.keys())
            }
        };
    }

    /**
   * Clear all caches
   */
    clearAllCaches() {
        this.cache.clear();
        this.debbieApi?.clearCache();
        this.owl2dict?.clearCache();
        this.goldStandardLoader?.clearCache();
    }

    /**
   * Export integration data
   */
    exportIntegrationData(format = 'json') {
        const data = {
            system: this.getSystemStatus(),
            ontology: this.debOntology?.metadata,
            goldStandard: this.goldStandardDatabase?.metadata,
            categories: Object.keys(this.annotationCategories || {})
        };

        switch (format.toLowerCase()) {
        case 'json':
            return JSON.stringify(data, null, 2);
        default:
            return data;
        }
    }
}

// Global instance
window.ProjectDebbieCoordinator = new ProjectDebbieCoordinator();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectDebbieCoordinator;
}
