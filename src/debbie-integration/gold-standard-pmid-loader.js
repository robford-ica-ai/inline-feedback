/**
 * Gold Standard PMID Loader - Real ProjectDebbie Research Database
 * Loads and processes the 1,230+ validated biocompatibility studies
 * Based on https://github.com/ProjectDebbie/gold_standard_set
 */

class GoldStandardPmidLoader {
    constructor() {
        this.version = '1.0.0';
        this.source = 'ProjectDebbie Gold Standard Set';
        this.baseUrl = 'https://raw.githubusercontent.com/ProjectDebbie/gold_standard_set/main';

        // ProjectDebbie gold standard files
        this.goldStandardFiles = {
            clinical: {
                url: `${this.baseUrl}/clinical_gs_1092.txt`,
                name: 'Clinical Studies Gold Standard',
                count: 1092,
                description: 'Human clinical trials and observational studies'
            },
            laboratory: {
                url: `${this.baseUrl}/laboratory_gs_1213.txt`,
                name: 'Laboratory Studies Gold Standard',
                count: 1213,
                description: 'In vitro and in vivo preclinical studies'
            },
            original: {
                url: `${this.baseUrl}/gs_original_1230.txt`,
                name: 'Original Gold Standard',
                count: 1230,
                description: 'Original validated research dataset'
            }
        };

        this.cache = new Map();
        this.cacheTimeout = 1800000; // 30 minutes for PMID data
        this.loadedSets = new Map();
    }

    /**
   * Load all gold standard PMID sets from ProjectDebbie
   * @returns {Promise<Object>} Complete gold standard database
   */
    async loadAllGoldStandardSets() {
        const cacheKey = 'all_gold_standard_sets';

        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            console.log('Loading ProjectDebbie gold standard PMID sets...');

            const results = await Promise.all([
                this.loadGoldStandardSet('clinical'),
                this.loadGoldStandardSet('laboratory'),
                this.loadGoldStandardSet('original')
            ]);

            const goldStandardDatabase = {
                metadata: {
                    source: this.source,
                    version: this.version,
                    loadTimestamp: new Date().toISOString(),
                    totalStudies: results.reduce((sum, set) => sum + set.pmids.length, 0),
                    sets: results.length
                },
                sets: {
                    clinical: results[0],
                    laboratory: results[1],
                    original: results[2]
                },
                combinedPmids: this.combineAndDeduplicatePmids(results),
                statistics: this.generateStatistics(results)
            };

            // Cache the results
            this.cache.set(cacheKey, {
                data: goldStandardDatabase,
                timestamp: Date.now()
            });

            console.log(`Loaded ${goldStandardDatabase.metadata.totalStudies} PMIDs from ${goldStandardDatabase.metadata.sets} gold standard sets`);
            return goldStandardDatabase;

        } catch (error) {
            console.error('Failed to load gold standard sets:', error);
            return this.getFallbackGoldStandard();
        }
    }

    /**
   * Load individual gold standard set
   * @param {string} setType - Type of set (clinical, laboratory, original)
   * @returns {Promise<Object>} Loaded PMID set with metadata
   */
    async loadGoldStandardSet(setType) {
        if (!this.goldStandardFiles[setType]) {
            throw new Error(`Unknown gold standard set type: ${setType}`);
        }

        const setInfo = this.goldStandardFiles[setType];
        const cacheKey = `gold_standard_${setType}`;

        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            console.log(`Loading ${setInfo.name}...`);
            const pmidText = await this.fetchPmidFile(setInfo.url);
            const pmids = this.parsePmidFile(pmidText);

            const setData = {
                type: setType,
                name: setInfo.name,
                description: setInfo.description,
                expectedCount: setInfo.count,
                actualCount: pmids.length,
                pmids: pmids,
                loadTimestamp: new Date().toISOString(),
                source: setInfo.url,
                validation: this.validatePmidSet(pmids, setInfo.count)
            };

            // Cache the results
            this.cache.set(cacheKey, {
                data: setData,
                timestamp: Date.now()
            });

            this.loadedSets.set(setType, setData);
            console.log(`Loaded ${pmids.length} PMIDs for ${setInfo.name}`);
            return setData;

        } catch (error) {
            console.error(`Failed to load ${setInfo.name}:`, error);
            return this.getFallbackSet(setType);
        }
    }

    /**
   * Fetch PMID file from ProjectDebbie repository
   */
    async fetchPmidFile(url) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'text/plain',
                    'User-Agent': 'Inline-Feedback-Extension/1.0 (Gold-Standard-Integration)'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch PMID file: ${response.status} ${response.statusText}`);
            }

            const text = await response.text();
            console.log(`Fetched PMID file: ${Math.round(text.length / 1024)}KB`);
            return text;

        } catch (error) {
            console.error('Error fetching PMID file:', error);
            throw error;
        }
    }

    /**
   * Parse PMID file content
   */
    parsePmidFile(pmidText) {
        const pmids = [];
        const lines = pmidText.split('\n');

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
                return;
            }

            // Extract PMID - could be just number or in format "PMID: 12345678"
            const pmidMatch = trimmedLine.match(/(\d{8,})/);
            if (pmidMatch) {
                const pmid = pmidMatch[1];
                if (this.isValidPmid(pmid)) {
                    pmids.push({
                        pmid: pmid,
                        lineNumber: index + 1,
                        originalLine: trimmedLine
                    });
                }
            }
        });

        return pmids;
    }

    /**
   * Validate PMID format
   */
    isValidPmid(pmid) {
    // PMIDs are typically 8 digits, but can be 7-9 digits
        return /^\d{7,9}$/.test(pmid);
    }

    /**
   * Validate PMID set against expected count
   */
    validatePmidSet(pmids, expectedCount) {
        const actualCount = pmids.length;
        const tolerance = 0.05; // 5% tolerance
        const minExpected = Math.floor(expectedCount * (1 - tolerance));
        const maxExpected = Math.ceil(expectedCount * (1 + tolerance));

        const validation = {
            isValid: actualCount >= minExpected && actualCount <= maxExpected,
            expectedCount: expectedCount,
            actualCount: actualCount,
            difference: actualCount - expectedCount,
            percentageDifference: ((actualCount - expectedCount) / expectedCount) * 100,
            duplicates: this.findDuplicatePmids(pmids),
            invalidPmids: pmids.filter(entry => !this.isValidPmid(entry.pmid))
        };

        if (!validation.isValid) {
            console.warn(`PMID count validation failed: expected ~${expectedCount}, got ${actualCount}`);
        }

        return validation;
    }

    /**
   * Find duplicate PMIDs in set
   */
    findDuplicatePmids(pmids) {
        const seen = new Set();
        const duplicates = [];

        pmids.forEach(entry => {
            if (seen.has(entry.pmid)) {
                duplicates.push(entry);
            } else {
                seen.add(entry.pmid);
            }
        });

        return duplicates;
    }

    /**
   * Combine and deduplicate PMIDs from multiple sets
   */
    combineAndDeduplicatePmids(sets) {
        const allPmids = new Map();
        const setMembership = {};

        sets.forEach(set => {
            set.pmids.forEach(entry => {
                const pmid = entry.pmid;

                if (!allPmids.has(pmid)) {
                    allPmids.set(pmid, {
                        pmid: pmid,
                        sets: [],
                        firstSeen: set.type,
                        sources: []
                    });
                }

                allPmids.get(pmid).sets.push(set.type);
                allPmids.get(pmid).sources.push({
                    set: set.type,
                    lineNumber: entry.lineNumber,
                    originalLine: entry.originalLine
                });
            });
        });

        const combinedArray = Array.from(allPmids.values());

        // Generate set membership statistics
        combinedArray.forEach(entry => {
            const setKey = entry.sets.sort().join(',');
            if (!setMembership[setKey]) {
                setMembership[setKey] = [];
            }
            setMembership[setKey].push(entry.pmid);
        });

        return {
            pmids: combinedArray,
            total: combinedArray.length,
            setMembership: setMembership,
            overlap: this.calculateOverlap(sets)
        };
    }

    /**
   * Calculate overlap between sets
   */
    calculateOverlap(sets) {
        const setPmids = {};
        sets.forEach(set => {
            setPmids[set.type] = new Set(set.pmids.map(entry => entry.pmid));
        });

        const overlap = {};
        const setTypes = Object.keys(setPmids);

        for (let i = 0; i < setTypes.length; i++) {
            for (let j = i + 1; j < setTypes.length; j++) {
                const type1 = setTypes[i];
                const type2 = setTypes[j];
                const intersection = new Set([...setPmids[type1]].filter(pmid => setPmids[type2].has(pmid)));

                overlap[`${type1}_${type2}`] = {
                    count: intersection.size,
                    pmids: Array.from(intersection),
                    percentage1: (intersection.size / setPmids[type1].size) * 100,
                    percentage2: (intersection.size / setPmids[type2].size) * 100
                };
            }
        }

        return overlap;
    }

    /**
   * Generate statistics for loaded sets
   */
    generateStatistics(sets) {
        const stats = {
            totalPmids: 0,
            uniquePmids: 0,
            duplicateCount: 0,
            setDistribution: {},
            validationSummary: {
                allValid: true,
                issues: []
            }
        };

        const allPmids = new Set();
        let totalCount = 0;

        sets.forEach(set => {
            const setCount = set.pmids.length;
            totalCount += setCount;

            stats.setDistribution[set.type] = {
                count: setCount,
                expected: set.expectedCount,
                valid: set.validation.isValid
            };

            if (!set.validation.isValid) {
                stats.validationSummary.allValid = false;
                stats.validationSummary.issues.push({
                    set: set.type,
                    issue: `Count mismatch: expected ${set.expectedCount}, got ${setCount}`
                });
            }

            set.pmids.forEach(entry => {
                allPmids.add(entry.pmid);
            });
        });

        stats.totalPmids = totalCount;
        stats.uniquePmids = allPmids.size;
        stats.duplicateCount = totalCount - allPmids.size;

        return stats;
    }

    /**
   * Search PMIDs by material or keyword
   */
    async searchPmidsByKeyword(keyword) {
    // This would require integration with PubMed API to search abstracts
    // For now, return structure for future implementation
        return {
            keyword: keyword,
            searchType: 'abstract_search',
            totalResults: 0,
            pmids: [],
            note: 'Abstract search requires PubMed API integration'
        };
    }

    /**
   * Get PMID metadata from external source (future enhancement)
   */
    async getPmidMetadata(pmid) {
    // Placeholder for PubMed API integration
        return {
            pmid: pmid,
            title: null,
            authors: [],
            journal: null,
            year: null,
            abstract: null,
            source: 'metadata_unavailable'
        };
    }

    /**
   * Export PMIDs to different formats
   */
    exportPmids(pmids, format = 'json') {
        switch (format.toLowerCase()) {
        case 'json':
            return JSON.stringify(pmids, null, 2);

        case 'csv':
            const csvHeader = 'PMID,Sets,First_Seen\n';
            const csvRows = pmids.map(entry =>
                `${entry.pmid},"${entry.sets.join(';')}",${entry.firstSeen}`
            ).join('\n');
            return csvHeader + csvRows;

        case 'text':
            return pmids.map(entry => entry.pmid).join('\n');

        default:
            throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
   * Get fallback gold standard when real data is unavailable
   */
    getFallbackGoldStandard() {
        return {
            metadata: {
                source: 'fallback_demo_data',
                version: 'fallback',
                loadTimestamp: new Date().toISOString(),
                totalStudies: 100,
                sets: 3
            },
            sets: {
                clinical: this.getFallbackSet('clinical'),
                laboratory: this.getFallbackSet('laboratory'),
                original: this.getFallbackSet('original')
            },
            combinedPmids: {
                pmids: [],
                total: 100,
                setMembership: {},
                overlap: {}
            },
            statistics: {
                totalPmids: 100,
                uniquePmids: 100,
                duplicateCount: 0
            }
        };
    }

    /**
   * Get fallback set data
   */
    getFallbackSet(setType) {
        const fallbackSets = {
            clinical: { count: 50, description: 'Demo clinical studies' },
            laboratory: { count: 60, description: 'Demo laboratory studies' },
            original: { count: 100, description: 'Demo original dataset' }
        };

        const setInfo = fallbackSets[setType] || { count: 50, description: 'Demo dataset' };

        return {
            type: setType,
            name: `Fallback ${setType} set`,
            description: setInfo.description,
            expectedCount: setInfo.count,
            actualCount: 0,
            pmids: [],
            loadTimestamp: new Date().toISOString(),
            source: 'fallback_data',
            validation: {
                isValid: false,
                expectedCount: setInfo.count,
                actualCount: 0
            }
        };
    }

    /**
   * Clear cache
   */
    clearCache() {
        this.cache.clear();
        this.loadedSets.clear();
    }

    /**
   * Get cache statistics
   */
    getCacheStats() {
        return {
            cacheSize: this.cache.size,
            loadedSets: Array.from(this.loadedSets.keys()),
            cacheEntries: Array.from(this.cache.keys())
        };
    }

    /**
   * Get summary of loaded data
   */
    getSummary() {
        return {
            version: this.version,
            source: this.source,
            availableSets: Object.keys(this.goldStandardFiles),
            loadedSets: Array.from(this.loadedSets.keys()),
            cacheStats: this.getCacheStats()
        };
    }
}

// Global instance
window.GoldStandardPmidLoader = new GoldStandardPmidLoader();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoldStandardPmidLoader;
}
