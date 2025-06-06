/**
 * Inline Feedback Extension Popup
 * Handles extension settings and configuration
 */

class PopupManager {
    constructor() {
        this.storageManager = null;
        this.stats = { translations: 0, explanations: 0, terms: 0 };
        this.init();
    }

    async init() {
        try {
            await this.loadSettings();
            this.setupEventListeners();
            this.updateStatus('Ready', 'success');
            await this.loadStats();
        } catch (error) {
            console.error('Error initializing popup:', error);
            this.updateStatus('Error loading settings', 'error');
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get([
                'apiKey',
                'selectedModel',
                'autoTranslate',
                'autoHighlight',
                'showTooltips'
            ]);

            // Populate form fields with fallback defaults
            const apiKeyField = document.getElementById('apiKey');
            if (apiKeyField && result.apiKey) {
                apiKeyField.value = result.apiKey;
            }

            const modelSelect = document.getElementById('modelSelect');
            if (modelSelect) {
                modelSelect.value = result.selectedModel || 'claude-3-sonnet-20240229';
            }

            const autoTranslate = document.getElementById('autoTranslate');
            if (autoTranslate) {
                autoTranslate.checked = result.autoTranslate || false;
            }

            const autoHighlight = document.getElementById('autoHighlight');
            if (autoHighlight) {
                autoHighlight.checked = result.autoHighlight !== false; // default true
            }

            const showTooltips = document.getElementById('showTooltips');
            if (showTooltips) {
                showTooltips.checked = result.showTooltips !== false; // default true
            }

        } catch (error) {
            console.error('Error loading settings:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Quick action buttons
        const translateBtn = document.getElementById('translateBtn');
        if (translateBtn) {
            translateBtn.addEventListener('click', () => this.triggerAction('translate'));
        }

        const explainBtn = document.getElementById('explainBtn');
        if (explainBtn) {
            explainBtn.addEventListener('click', () => this.triggerAction('explain'));
        }

        const highlightBtn = document.getElementById('highlightBtn');
        if (highlightBtn) {
            highlightBtn.addEventListener('click', () => this.toggleHighlighting());
        }

        // Test API button
        const testApiBtn = document.getElementById('testApiBtn');
        if (testApiBtn) {
            testApiBtn.addEventListener('click', () => this.testConnection());
        }

        // Model selection
        const modelSelect = document.getElementById('modelSelect');
        if (modelSelect) {
            modelSelect.addEventListener('change', (e) => {
                this.saveSetting('selectedModel', e.target.value);
            });
        }

        // Checkbox settings
        const autoTranslate = document.getElementById('autoTranslate');
        if (autoTranslate) {
            autoTranslate.addEventListener('change', (e) => {
                this.saveSetting('autoTranslate', e.target.checked);
            });
        }

        const autoHighlight = document.getElementById('autoHighlight');
        if (autoHighlight) {
            autoHighlight.addEventListener('change', (e) => {
                this.saveSetting('autoHighlight', e.target.checked);
                this.notifyContentScript('autoHighlight', e.target.checked);
            });
        }

        const showTooltips = document.getElementById('showTooltips');
        if (showTooltips) {
            showTooltips.addEventListener('change', (e) => {
                this.saveSetting('showTooltips', e.target.checked);
            });
        }

        // API key save on blur/enter
        const apiKey = document.getElementById('apiKey');
        if (apiKey) {
            apiKey.addEventListener('blur', () => this.saveApiKey());
            apiKey.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveApiKey();
                }
            });
        }

        // Footer links
        const helpLink = document.getElementById('helpLink');
        if (helpLink) {
            helpLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showHelp();
            });
        }

        const historyLink = document.getElementById('historyLink');
        if (historyLink) {
            historyLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showHistory();
            });
        }

        const aboutLink = document.getElementById('aboutLink');
        if (aboutLink) {
            aboutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAbout();
            });
        }
    }

    async triggerAction(action) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'keyboard-command',
                    command: action
                });
                this.updateStatus(`Triggered ${action}`, 'success');
                window.close(); // Close popup after action
            }
        } catch (error) {
            console.error(`Error triggering ${action}:`, error);
            this.updateStatus(`Failed to trigger ${action}`, 'error');
        }
    }

    async toggleHighlighting() {
        try {
            const result = await chrome.storage.sync.get(['autoHighlight']);
            const newValue = !result.autoHighlight;
            
            await this.saveSetting('autoHighlight', newValue);
            document.getElementById('autoHighlight').checked = newValue;
            
            this.notifyContentScript('autoHighlight', newValue);
            this.updateStatus(`Highlighting ${newValue ? 'enabled' : 'disabled'}`, 'success');
        } catch (error) {
            console.error('Error toggling highlighting:', error);
            this.updateStatus('Error toggling highlighting', 'error');
        }
    }

    async saveApiKey() {
        const apiKeyField = document.getElementById('apiKey');
        if (!apiKeyField) return;

        const apiKey = apiKeyField.value.trim();

        if (!apiKey) {
            return; // Don't show error for empty field
        }

        if (!apiKey.startsWith('sk-ant-')) {
            this.updateStatus('API key should start with sk-ant-', 'error');
            return;
        }

        try {
            await chrome.storage.sync.set({ apiKey });
            this.updateStatus('API key saved', 'success');
        } catch (error) {
            console.error('Error saving API key:', error);
            this.updateStatus('Error saving API key', 'error');
        }
    }

    async saveSetting(key, value) {
        try {
            await chrome.storage.sync.set({ [key]: value });
            // Don't show status for every setting change to avoid spam
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            this.updateStatus(`Error saving ${key}`, 'error');
        }
    }

    async testConnection() {
        this.updateStatus('Testing API connection...', 'loading');

        try {
            const result = await chrome.storage.sync.get(['apiKey']);

            if (!result.apiKey) {
                this.updateStatus('No API key found', 'error');
                return;
            }

            // Send test message to background script
            const response = await chrome.runtime.sendMessage({
                action: 'test-api',
                apiKey: result.apiKey
            });

            if (response && response.success) {
                this.updateStatus('API connection successful!', 'success');
            } else {
                this.updateStatus(`API test failed: ${response?.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error testing connection:', error);
            this.updateStatus('Connection test failed', 'error');
        }
    }

    async notifyContentScript(setting, value) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (tab) {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'setting-changed',
                    setting: setting,
                    value: value
                });
            }
        } catch (error) {
            // Content script might not be loaded, that's OK
            console.debug('Could not notify content script:', error);
        }
    }

    async loadStats() {
        try {
            const result = await chrome.storage.local.get(['usage-stats']);
            const stats = result['usage-stats'] || { translations: 0, explanations: 0, terms: 0 };

            const translationCount = document.getElementById('translationCount');
            const explanationCount = document.getElementById('explanationCount');
            const termCount = document.getElementById('termCount');

            if (translationCount) translationCount.textContent = stats.translations || 0;
            if (explanationCount) explanationCount.textContent = stats.explanations || 0;
            if (termCount) termCount.textContent = stats.terms || 0;

        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    updateStatus(message, type = 'info') {
        const statusText = document.getElementById('statusText');
        const statusDot = document.getElementById('statusDot');

        if (statusText) {
            statusText.textContent = message;
        }

        if (statusDot) {
            statusDot.className = `status-dot ${type}`;
        }

        // Clear status after 3 seconds unless it's an error
        if (type !== 'error') {
            setTimeout(() => {
                if (statusText) statusText.textContent = 'Ready';
                if (statusDot) statusDot.className = 'status-dot success';
            }, 3000);
        }
    }

    showHelp() {
        chrome.tabs.create({
            url: 'https://github.com/your-repo/inline-feedback#usage'
        });
    }

    showHistory() {
        // Could open a dedicated history page or show inline
        this.updateStatus('History feature coming soon!', 'info');
    }

    showAbout() {
        const manifest = chrome.runtime.getManifest();
        alert(`Inline Feedback v${manifest.version}\n\nAI-powered text processing for web pages with medical term highlighting.\n\nDeveloped by Robert Ford`);
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new PopupManager();
    } catch (error) {
        console.error('Failed to initialize popup:', error);
        // Fallback error display
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = 'Initialization failed';
        }
    }
});

// Handle extension icon click
chrome.action?.onClicked?.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/content-script.js']
    });
});
