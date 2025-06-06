/**
 * Chrome Extension Storage Manager
 * Handles all storage operations for the extension
 */

class StorageManager {
    constructor() {
        this.SYNC_KEYS = [
            'apiKey',
            'selectedModel', 
            'autoTranslate',
            'ontologyMode',
            'debugMode',
            'language',
            'userPreferences'
        ];
        
        this.LOCAL_KEYS = [
            'requestHistory',
            'cacheData',
            'lastSync',
            'usageStats'
        ];

        this.DEFAULT_SETTINGS = {
            selectedModel: 'claude-3-haiku-20240307',
            autoTranslate: false,
            ontologyMode: true,
            debugMode: false,
            language: 'en',
            userPreferences: {}
        };
    }

    /**
     * Initialize storage with default settings
     */
    async init() {
        try {
            const existing = await this.getSyncData();
            const needsDefaults = Object.keys(this.DEFAULT_SETTINGS)
                .some(key => !(key in existing));

            if (needsDefaults) {
                await this.setSyncData(this.DEFAULT_SETTINGS);
                console.log('Storage initialized with defaults');
            }

            return true;
        } catch (error) {
            console.error('Storage initialization failed:', error);
            return false;
        }
    }

    /**
     * Get all sync storage data
     * @returns {Promise<Object>} Sync storage data
     */
    async getSyncData(keys = null) {
        try {
            if (!chrome.storage?.sync) {
                throw new Error('Chrome storage API not available');
            }

            const result = await chrome.storage.sync.get(keys);
            return result;
        } catch (error) {
            console.error('Error getting sync data:', error);
            throw error;
        }
    }

    /**
     * Set sync storage data
     * @param {Object} data - Data to store
     */
    async setSyncData(data) {
        try {
            if (!chrome.storage?.sync) {
                throw new Error('Chrome storage API not available');
            }

            await chrome.storage.sync.set(data);
            console.log('Sync data saved:', Object.keys(data));
        } catch (error) {
            console.error('Error setting sync data:', error);
            throw error;
        }
    }

    /**
     * Get local storage data
     * @param {string|Array|null} keys - Keys to retrieve
     * @returns {Promise<Object>} Local storage data
     */
    async getLocalData(keys = null) {
        try {
            if (!chrome.storage?.local) {
                throw new Error('Chrome storage API not available');
            }

            const result = await chrome.storage.local.get(keys);
            return result;
        } catch (error) {
            console.error('Error getting local data:', error);
            throw error;
        }
    }

    /**
     * Set local storage data
     * @param {Object} data - Data to store
     */
    async setLocalData(data) {
        try {
            if (!chrome.storage?.local) {
                throw new Error('Chrome storage API not available');
            }

            await chrome.storage.local.set(data);
            console.log('Local data saved:', Object.keys(data));
        } catch (error) {
            console.error('Error setting local data:', error);
            throw error;
        }
    }

    /**
     * Get API key securely
     * @returns {Promise<string|null>} API key
     */
    async getAPIKey() {
        try {
            const data = await this.getSyncData(['apiKey']);
            return data.apiKey || null;
        } catch (error) {
            console.error('Error getting API key:', error);
            return null;
        }
    }

    /**
     * Save API key securely
     * @param {string} apiKey - API key to save
     */
    async saveAPIKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            throw new Error('Invalid API key');
        }

        try {
            await this.setSyncData({ apiKey: apiKey.trim() });
            return true;
        } catch (error) {
            console.error('Error saving API key:', error);
            throw error;
        }
    }

    /**
     * Get user settings
     * @returns {Promise<Object>} User settings
     */
    async getSettings() {
        try {
            const data = await this.getSyncData(this.SYNC_KEYS);
            return { ...this.DEFAULT_SETTINGS, ...data };
        } catch (error) {
            console.error('Error getting settings:', error);
            return this.DEFAULT_SETTINGS;
        }
    }

    /**
     * Save user settings
     * @param {Object} settings - Settings to save
     */
    async saveSettings(settings) {
        try {
            // Filter to only allowed sync keys
            const filteredSettings = {};
            this.SYNC_KEYS.forEach(key => {
                if (key in settings) {
                    filteredSettings[key] = settings[key];
                }
            });

            await this.setSyncData(filteredSettings);
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    }

    /**
     * Save request to history
     * @param {Object} request - Request data to save
     */
    async saveRequestHistory(request) {
        try {
            const { requestHistory = [] } = await this.getLocalData(['requestHistory']);
            
            const newEntry = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                type: request.type,
                prompt: request.prompt?.substring(0, 100) || '', // Truncate for storage
                model: request.model,
                success: request.success,
                errorMessage: request.error?.message || null
            };

            requestHistory.unshift(newEntry);
            
            // Keep only last 100 requests
            if (requestHistory.length > 100) {
                requestHistory.splice(100);
            }

            await this.setLocalData({ requestHistory });
            return newEntry.id;
        } catch (error) {
            console.error('Error saving request history:', error);
            throw error;
        }
    }

    /**
     * Get request history
     * @param {number} limit - Maximum number of entries to return
     * @returns {Promise<Array>} Request history
     */
    async getRequestHistory(limit = 50) {
        try {
            const { requestHistory = [] } = await this.getLocalData(['requestHistory']);
            return requestHistory.slice(0, limit);
        } catch (error) {
            console.error('Error getting request history:', error);
            return [];
        }
    }

    /**
     * Update usage statistics
     * @param {Object} stats - Statistics to update
     */
    async updateUsageStats(stats) {
        try {
            const { usageStats = {} } = await this.getLocalData(['usageStats']);
            
            const updated = {
                ...usageStats,
                lastUpdate: Date.now(),
                totalRequests: (usageStats.totalRequests || 0) + (stats.requests || 0),
                totalTokens: (usageStats.totalTokens || 0) + (stats.tokens || 0),
                translationsCount: (usageStats.translationsCount || 0) + (stats.translations || 0),
                explanationsCount: (usageStats.explanationsCount || 0) + (stats.explanations || 0),
                errorsCount: (usageStats.errorsCount || 0) + (stats.errors || 0)
            };

            await this.setLocalData({ usageStats: updated });
            return updated;
        } catch (error) {
            console.error('Error updating usage stats:', error);
            throw error;
        }
    }

    /**
     * Get usage statistics
     * @returns {Promise<Object>} Usage statistics
     */
    async getUsageStats() {
        try {
            const { usageStats = {} } = await this.getLocalData(['usageStats']);
            return {
                totalRequests: 0,
                totalTokens: 0,
                translationsCount: 0,
                explanationsCount: 0,
                errorsCount: 0,
                lastUpdate: null,
                ...usageStats
            };
        } catch (error) {
            console.error('Error getting usage stats:', error);
            return {};
        }
    }

    /**
     * Cache data with expiration
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    async setCache(key, data, ttl = 300000) { // 5 minutes default
        try {
            const { cacheData = {} } = await this.getLocalData(['cacheData']);
            
            cacheData[key] = {
                data,
                expires: Date.now() + ttl,
                created: Date.now()
            };

            await this.setLocalData({ cacheData });
            return true;
        } catch (error) {
            console.error('Error setting cache:', error);
            throw error;
        }
    }

    /**
     * Get cached data
     * @param {string} key - Cache key
     * @returns {Promise<any|null>} Cached data or null if expired/not found
     */
    async getCache(key) {
        try {
            const { cacheData = {} } = await this.getLocalData(['cacheData']);
            const entry = cacheData[key];

            if (!entry) {
                return null;
            }

            if (Date.now() > entry.expires) {
                // Remove expired entry
                delete cacheData[key];
                await this.setLocalData({ cacheData });
                return null;
            }

            return entry.data;
        } catch (error) {
            console.error('Error getting cache:', error);
            return null;
        }
    }

    /**
     * Clear expired cache entries
     */
    async cleanupCache() {
        try {
            const { cacheData = {} } = await this.getLocalData(['cacheData']);
            const now = Date.now();
            let cleaned = 0;

            Object.keys(cacheData).forEach(key => {
                if (cacheData[key].expires < now) {
                    delete cacheData[key];
                    cleaned++;
                }
            });

            if (cleaned > 0) {
                await this.setLocalData({ cacheData });
                console.log(`Cleaned ${cleaned} expired cache entries`);
            }

            return cleaned;
        } catch (error) {
            console.error('Error cleaning cache:', error);
            return 0;
        }
    }

    /**
     * Clear all storage data
     * @param {boolean} includeSettings - Whether to clear settings too
     */
    async clearAllData(includeSettings = false) {
        try {
            await chrome.storage.local.clear();
            
            if (includeSettings) {
                await chrome.storage.sync.clear();
                await this.init(); // Reinitialize with defaults
            }

            console.log('Storage cleared');
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw error;
        }
    }

    /**
     * Export all data (for backup)
     * @returns {Promise<Object>} All extension data
     */
    async exportData() {
        try {
            const [syncData, localData] = await Promise.all([
                this.getSyncData(),
                this.getLocalData()
            ]);

            // Remove sensitive data
            const exportData = {
                settings: { ...syncData },
                history: localData.requestHistory || [],
                stats: localData.usageStats || {},
                exportDate: new Date().toISOString()
            };

            // Remove API key for security
            delete exportData.settings.apiKey;

            return exportData;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }

    /**
     * Get storage usage information
     * @returns {Promise<Object>} Storage usage stats
     */
    async getStorageInfo() {
        try {
            const [syncUsed, localUsed] = await Promise.all([
                chrome.storage.sync.getBytesInUse?.() || Promise.resolve(0),
                chrome.storage.local.getBytesInUse?.() || Promise.resolve(0)
            ]);

            return {
                sync: {
                    used: syncUsed,
                    limit: chrome.storage.sync.QUOTA_BYTES || 102400, // 100KB
                    percentage: (syncUsed / (chrome.storage.sync.QUOTA_BYTES || 102400)) * 100
                },
                local: {
                    used: localUsed,
                    limit: chrome.storage.local.QUOTA_BYTES || 5242880, // 5MB
                    percentage: (localUsed / (chrome.storage.local.QUOTA_BYTES || 5242880)) * 100
                }
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return { sync: { used: 0, limit: 0, percentage: 0 }, local: { used: 0, limit: 0, percentage: 0 } };
        }
    }
}

// Export for use in service worker
if (typeof globalThis !== 'undefined') {
    globalThis.StorageManager = StorageManager;
} 