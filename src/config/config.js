// src/config/config.js - Following your config patterns
class Config {
    constructor(options = {}) {
        this.claudeApiKey = options.claudeApiKey || null;
        this.model = options.model || 'claude-3-sonnet-20240229';
        this.autoTranslate = options.autoTranslate || false;
        this.ontologyEnabled = options.ontologyEnabled || true;
        this.debugMode = options.debugMode || false;
    }

    static async fromStorage() {
        const stored = await chrome.storage.local.get(['config']);
        return new Config(stored.config || {});
    }

    async save() {
        await chrome.storage.local.set({ config: this.toObject() });
    }

    toObject() {
        return {
            claudeApiKey: this.claudeApiKey,
            model: this.model,
            autoTranslate: this.autoTranslate,
            ontologyEnabled: this.ontologyEnabled,
            debugMode: this.debugMode
        };
    }

    validate() {
        const errors = [];

        if (!this.claudeApiKey) {
            errors.push('Claude API key is required');
        }

        if (!this.model) {
            errors.push('Model selection is required');
        }

        if (errors.length > 0) {
            throw new ConfigError(`Configuration invalid: ${errors.join(', ')}`);
        }
    }
}

class ConfigError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConfigError';
    }
}
