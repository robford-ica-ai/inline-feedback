/**
 * DEBBIE API Client - Real ProjectDebbie Database Integration
 * Connects to the live EU Horizon 2020 DEBBIE database
 * https://debbie.bsc.es/search/api/v1
 */

class DebbieApiClient {
    constructor() {
        this.baseUrl = 'https://debbie.bsc.es/search/api/v1';
        this.version = '1.0.0';
        this.source = 'EU Horizon 2020 ProjectDebbie';
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 minutes
    }

    /**
   * Search DEBBIE database for biomaterial information
   * @param {string} term - Search term (e.g., 'titanium', 'PEEK')
   * @param {string} category - Optional category filter
   * @returns {Promise<Object>} Search results with research evidence
   */
    async searchMaterial(term, category = null) {
        const cacheKey = `search_${term}_${category || 'all'}`;

        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const results = await Promise.all([
                this.getTermFrequencyOverTime(term),
                this.getTopAssociatedTerms(term),
                this.getTopTermsByCategory(term, category),
                this.getNetworkRelationships(term)
            ]);

            const searchResults = {
                term: term,
                category: category,
                timestamp: new Date().toISOString(),
                frequencyOverTime: results[0],
                associatedTerms: results[1],
                categoryTerms: results[2],
                networkData: results[3],
                source: this.source,
                evidence: this.processEvidenceData(results)
            };

            // Cache the results
            this.cache.set(cacheKey, {
                data: searchResults,
                timestamp: Date.now()
            });

            return searchResults;

        } catch (error) {
            console.error(`DEBBIE API search failed for term: ${term}`, error);
            return this.getFallbackData(term);
        }
    }

    /**
   * Get frequency of term usage over time (normalized per abstract)
   * https://debbie.bsc.es/search/api/v1/search/[term]/years
   */
    async getTermFrequencyOverTime(term) {
        const url = `${this.baseUrl}/search/${encodeURIComponent(term)}/years`;
        return this.makeRequest(url, 'frequency_over_time');
    }

    /**
   * Get top 13 associated terms that co-occur with search term
   * https://debbie.bsc.es/search/api/v1/search/[term]/top_terms
   */
    async getTopAssociatedTerms(term) {
        const url = `${this.baseUrl}/search/${encodeURIComponent(term)}/top_terms`;
        return this.makeRequest(url, 'associated_terms');
    }

    /**
   * Get top terms within specific category
   * https://debbie.bsc.es/search/api/v1/search/[term]/top_terms/[type]
   */
    async getTopTermsByCategory(term, category) {
        if (!category) return null;

        const validCategories = [
            'Biomaterial', 'BiologicallyActiveSubstance', 'ManufacturedObject',
            'ManufacturedObjectComponent', 'MedicalApplication', 'ManufacturedObjectFeatures',
            'Structure', 'AssociatedBiologicalProcess', 'MaterialProcessing',
            'EffectOnBiologicalSystem', 'Cell', 'AdverseEffects', 'Species',
            'ResearchTechnique', 'Tissue'
        ];

        if (!validCategories.includes(category)) {
            console.warn(`Invalid category: ${category}. Valid categories:`, validCategories);
            return null;
        }

        const url = `${this.baseUrl}/search/${encodeURIComponent(term)}/top_terms/${category}`;
        return this.makeRequest(url, 'category_terms');
    }

    /**
   * Get network relationships for the term
   * https://debbie.bsc.es/search/api/v1/search/[term]/network
   */
    async getNetworkRelationships(term) {
        const url = `${this.baseUrl}/search/${encodeURIComponent(term)}/network`;
        return this.makeRequest(url, 'network_data');
    }

    /**
   * Make HTTP request with retry logic and error handling
   */
    async makeRequest(url, dataType) {
        let lastError;

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Inline-Feedback-Extension/1.0 (ProjectDebbie-Integration)'
                    },
                    timeout: 10000
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                return {
                    success: true,
                    data: data,
                    type: dataType,
                    url: url,
                    timestamp: new Date().toISOString()
                };

            } catch (error) {
                lastError = error;
                console.warn(`DEBBIE API attempt ${attempt + 1} failed:`, error.message);

                if (attempt < this.maxRetries - 1) {
                    await this.delay(this.retryDelay * Math.pow(2, attempt));
                }
            }
        }

        return {
            success: false,
            error: lastError.message,
            type: dataType,
            url: url,
            timestamp: new Date().toISOString()
        };
    }

    /**
   * Process evidence data from DEBBIE results
   */
    processEvidenceData(results) {
        const evidence = {
            researchActivity: null,
            associatedConcepts: [],
            temporalTrends: [],
            networkConnections: 0,
            evidenceLevel: 'live_database'
        };

        // Process frequency data
        if (results[0]?.success && results[0].data) {
            evidence.temporalTrends = results[0].data;
            evidence.researchActivity = this.calculateResearchActivity(results[0].data);
        }

        // Process associated terms
        if (results[1]?.success && results[1].data) {
            evidence.associatedConcepts = results[1].data.slice(0, 10); // Top 10
        }

        // Process network data
        if (results[3]?.success && results[3].data) {
            evidence.networkConnections = results[3].data.nodes?.length || 0;
        }

        return evidence;
    }

    /**
   * Calculate research activity level based on temporal data
   */
    calculateResearchActivity(temporalData) {
        if (!temporalData || temporalData.length === 0) return 'unknown';

        const totalMentions = temporalData.reduce((sum, entry) => sum + (entry.count || 0), 0);
        const recentYears = temporalData.filter(entry =>
            entry.year >= new Date().getFullYear() - 5
        );
        const recentActivity = recentYears.reduce((sum, entry) => sum + (entry.count || 0), 0);

        if (totalMentions > 1000) return 'very_high';
        if (totalMentions > 500) return 'high';
        if (totalMentions > 100) return 'moderate';
        if (recentActivity > 10) return 'emerging';
        return 'limited';
    }

    /**
   * Get available annotation categories from DEBBIE
   */
    getAnnotationCategories() {
        return {
            'Biomaterial': {
                description: 'Non-drug raw material suitable for inclusion in systems which augment or replace bodily tissues',
                examples: ['Polydioxanone', 'Polyglycolide', 'Hydroxyapatite']
            },
            'MedicalApplication': {
                description: 'Intended use, context, function or outcome of the manufactured object',
                examples: ['Artificial organs', 'Encapsulation', 'Diabetes', 'Injury']
            },
            'EffectOnBiologicalSystem': {
                description: 'Effect associated with manufactured object in a specific test system',
                examples: ['Biocompatibility', 'Cytocompatibility', 'Immunomodulatory']
            },
            'AdverseEffects': {
                description: 'Unfavorable disease, sign, or symptom associated with medical device use',
                examples: ['Cytotoxicity', 'Inflammatory reaction', 'Abscesses']
            },
            'AssociatedBiologicalProcess': {
                description: 'Cellular or biological process the object is designed to cause or support',
                examples: ['Adipogenesis', 'Angiogenesis', 'Cell attachment']
            },
            'ManufacturedObject': {
                description: 'Physical object created by hand or machine',
                examples: ['Experimental scaffold', 'Medical device', 'Surgical implant']
            },
            'Structure': {
                description: 'Configuration, form or texture associated with manufactured object',
                examples: ['Fiber', 'Gel', 'Mesh']
            },
            'Cell': {
                description: 'Reported cell line or primary cell type',
                examples: ['Fibroblast', 'Type II Pneumocyte', 'Osteocyte']
            },
            'Tissue': {
                description: 'Tissue or organ mentioned as target or test system',
                examples: ['Lung epithelium', 'Nerve plexus', 'Elastic cartilage tissue']
            },
            'MaterialProcessing': {
                description: 'Planned process resulting in physical changes in input material',
                examples: ['Biofabrication', 'Coating', 'Knitting']
            },
            'ResearchTechnique': {
                description: 'Laboratory technique used in experimental study',
                examples: ['Scanning electron microscope', 'High Performance Liquid Chromatography']
            },
            'ManufacturedObjectFeatures': {
                description: 'Characteristics inherent or given during processing',
                examples: ['Geometry', 'Mechanical Property', 'Physical Property']
            },
            'BiologicallyActiveSubstance': {
                description: 'Substance included to impart biological activity',
                examples: ['Collagen', 'Heparin', 'RGD']
            },
            'Species': {
                description: 'Species and/or breed used in the study',
                examples: ['Rat', 'Rabbit', 'Mouse']
            },
            'ManufacturedObjectComponent': {
                description: 'Part, region or component referred to as distinct unit',
                examples: ['Core', 'Shell', 'Coat']
            }
        };
    }

    /**
   * Search for materials with evidence validation
   */
    async searchWithEvidenceValidation(term) {
        const searchResults = await this.searchMaterial(term);

        if (!searchResults.evidence) {
            return searchResults;
        }

        // Add evidence validation
        searchResults.validation = {
            dataSource: 'live_debbie_database',
            lastUpdated: searchResults.timestamp,
            researchActivity: searchResults.evidence.researchActivity,
            associatedTermsCount: searchResults.evidence.associatedConcepts.length,
            temporalCoverage: this.getTemporalCoverage(searchResults.evidence.temporalTrends),
            evidenceQuality: this.assessEvidenceQuality(searchResults.evidence)
        };

        return searchResults;
    }

    /**
   * Get temporal coverage of research
   */
    getTemporalCoverage(temporalData) {
        if (!temporalData || temporalData.length === 0) return null;

        const years = temporalData.map(entry => entry.year).filter(Boolean);
        if (years.length === 0) return null;

        return {
            startYear: Math.min(...years),
            endYear: Math.max(...years),
            spanYears: Math.max(...years) - Math.min(...years),
            totalEntries: temporalData.length
        };
    }

    /**
   * Assess evidence quality based on DEBBIE data
   */
    assessEvidenceQuality(evidence) {
        let score = 0;
        const factors = [];

        // Research activity scoring
        const activityScores = {
            'very_high': 4,
            'high': 3,
            'moderate': 2,
            'emerging': 1,
            'limited': 0
        };

        const activityScore = activityScores[evidence.researchActivity] || 0;
        score += activityScore;
        factors.push(`Research activity: ${evidence.researchActivity} (+${activityScore})`);

        // Associated concepts scoring
        const conceptCount = evidence.associatedConcepts.length;
        const conceptScore = Math.min(Math.floor(conceptCount / 3), 3);
        score += conceptScore;
        factors.push(`Associated concepts: ${conceptCount} (+${conceptScore})`);

        // Network connections scoring
        const networkScore = Math.min(Math.floor(evidence.networkConnections / 10), 2);
        score += networkScore;
        factors.push(`Network connections: ${evidence.networkConnections} (+${networkScore})`);

        // Quality assessment
        let quality = 'low';
        if (score >= 7) quality = 'high';
        else if (score >= 4) quality = 'medium';

        return {
            score: score,
            maxScore: 9,
            quality: quality,
            factors: factors,
            recommendation: this.getQualityRecommendation(quality)
        };
    }

    getQualityRecommendation(quality) {
        const recommendations = {
            high: 'Strong evidence from live database - suitable for clinical reference',
            medium: 'Moderate evidence - consider with additional sources',
            low: 'Limited evidence - interpret with caution'
        };
        return recommendations[quality];
    }

    /**
   * Fallback data when API is unavailable
   */
    getFallbackData(term) {
        return {
            term: term,
            source: 'fallback_offline',
            error: 'DEBBIE API unavailable',
            timestamp: new Date().toISOString(),
            evidence: {
                researchActivity: 'unknown',
                associatedConcepts: [],
                temporalTrends: [],
                evidenceLevel: 'offline'
            }
        };
    }

    /**
   * Utility delay function
   */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
window.DebbieApiClient = new DebbieApiClient();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DebbieApiClient;
}
