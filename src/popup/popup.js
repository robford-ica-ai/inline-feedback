/**
 * Inline Feedback Extension Popup
 * Handles extension settings and configuration
 */

class PopupManager {
    constructor() {
        this.storageManager = null;
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.updateStatus();
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get([
                'apiKey', 
                'selectedModel', 
                'autoTranslate', 
                'ontologyMode', 
                'debugMode'
            ]);

            // Populate form fields
            if (result.apiKey) {
                document.getElementById('apiKey').value = result.apiKey;
            }
            
            if (result.selectedModel) {
                document.getElementById('modelSelect').value = result.selectedModel;
            }
            
            document.getElementById('autoTranslate').checked = result.autoTranslate || false;
            document.getElementById('ontologyMode').checked = result.ontologyMode !== false; // default true
            document.getElementById('debugMode').checked = result.debugMode || false;

        } catch (error) {
            console.error('Error loading settings:', error);
            this.updateStatus('Error loading settings', 'error');
        }
    }

    setupEventListeners() {
        // Save API key
        document.getElementById('saveApiKey').addEventListener('click', () => {
            this.saveApiKey();
        });

        // Model selection
        document.getElementById('modelSelect').addEventListener('change', (e) => {
            this.saveSetting('selectedModel', e.target.value);
        });

        // Checkbox settings
        document.getElementById('autoTranslate').addEventListener('change', (e) => {
            this.saveSetting('autoTranslate', e.target.checked);
        });

        document.getElementById('ontologyMode').addEventListener('change', (e) => {
            this.saveSetting('ontologyMode', e.target.checked);
            this.notifyContentScript('ontologyMode', e.target.checked);
        });

        document.getElementById('debugMode').addEventListener('change', (e) => {
            this.saveSetting('debugMode', e.target.checked);
        });

        // Test connection
        document.getElementById('testConnection').addEventListener('click', () => {
            this.testConnection();
        });

        // Clear data
        document.getElementById('clearData').addEventListener('click', () => {
            this.clearData();
        });

        // Enter key on API key field
        document.getElementById('apiKey').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveApiKey();
            }
        });
    }

    async saveApiKey() {
        const apiKey = document.getElementById('apiKey').value.trim();
        
        if (!apiKey) {
            this.updateStatus('Please enter an API key', 'error');
            return;
        }

        try {
            await chrome.storage.sync.set({ apiKey });
            this.updateStatus('API key saved successfully', 'success');
            
            // Clear the field for security
            setTimeout(() => {
                document.getElementById('apiKey').value = '';
            }, 1500);
        } catch (error) {
            console.error('Error saving API key:', error);
            this.updateStatus('Error saving API key', 'error');
        }
    }

    async saveSetting(key, value) {
        try {
            await chrome.storage.sync.set({ [key]: value });
            this.updateStatus(`${key} updated`, 'success');
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            this.updateStatus(`Error saving ${key}`, 'error');
        }
    }

    async testConnection() {
        this.updateStatus('Testing connection...', 'loading');
        
        try {
            const result = await chrome.storage.sync.get(['apiKey']);
            
            if (!result.apiKey) {
                this.updateStatus('No API key found', 'error');
                return;
            }

            // Send test message to background script
            const response = await chrome.runtime.sendMessage({
                type: 'TEST_CONNECTION',
                apiKey: result.apiKey
            });

            if (response.success) {
                this.updateStatus('Connection successful!', 'success');
            } else {
                this.updateStatus(`Connection failed: ${response.error}`, 'error');
            }
        } catch (error) {
            console.error('Error testing connection:', error);
            this.updateStatus('Connection test failed', 'error');
        }
    }

    async clearData() {
        if (!confirm('Are you sure you want to clear all extension data?')) {
            return;
        }

        try {
            await chrome.storage.sync.clear();
            await chrome.storage.local.clear();
            
            // Reset form
            document.getElementById('apiKey').value = '';
            document.getElementById('modelSelect').value = 'claude-3-haiku-20240307';
            document.getElementById('autoTranslate').checked = false;
            document.getElementById('ontologyMode').checked = true;
            document.getElementById('debugMode').checked = false;
            
            this.updateStatus('All data cleared', 'success');
        } catch (error) {
            console.error('Error clearing data:', error);
            this.updateStatus('Error clearing data', 'error');
        }
    }

    async notifyContentScript(setting, value) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab) {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'SETTING_CHANGED',
                    setting: setting,
                    value: value
                });
            }
        } catch (error) {
            console.error('Error notifying content script:', error);
        }
    }

    updateStatus(message, type = 'info') {
        const statusText = document.getElementById('statusText');
        const statusIndicator = document.getElementById('statusIndicator');
        
        statusText.textContent = message;
        statusIndicator.className = `status-indicator ${type}`;
        
        // Clear status after 3 seconds unless it's an error
        if (type !== 'error') {
            setTimeout(() => {
                statusText.textContent = 'Ready';
                statusIndicator.className = 'status-indicator';
            }, 3000);
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});

// Handle extension icon click
chrome.action?.onClicked?.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/content-script.js']
    });
}); 