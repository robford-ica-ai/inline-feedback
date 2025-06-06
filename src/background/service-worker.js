/**
 * Chrome Extension Service Worker
 * Handles background tasks and extension lifecycle
 */

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Inline Feedback extension installed:', details.reason);
    
    if (details.reason === 'install') {
        // First-time installation
        console.log('First-time installation of Inline Feedback');
        
        // Initialize default settings
        chrome.storage.sync.set({
            'inline-feedback-enabled': true,
            'auto-highlight': true,
            'show-tooltips': true,
            'translation-enabled': true
        });
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Inline Feedback extension started');
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Service worker received message:', request);
    
    switch (request.action) {
        case 'getExtensionInfo':
            sendResponse({
                version: chrome.runtime.getManifest().version,
                name: chrome.runtime.getManifest().name
            });
            break;
            
        case 'logError':
            console.error('Error from content script:', request.error);
            break;
            
        default:
            console.log('Unknown action:', request.action);
    }
    
    return true; // Keep message channel open for async responses
});

// Handle context menu clicks (if we add context menus later)
chrome.contextMenus?.onClicked?.addListener((info, tab) => {
    console.log('Context menu clicked:', info);
    
    // Send message to content script
    chrome.tabs.sendMessage(tab.id, {
        action: 'contextMenuClicked',
        menuItemId: info.menuItemId,
        selectionText: info.selectionText
    });
});

// Handle keyboard shortcuts
chrome.commands?.onCommand?.addListener((command) => {
    console.log('Keyboard shortcut triggered:', command);
    
    // Get active tab and send command
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'keyboardShortcut',
                command: command
            });
        }
    });
});

// Handle tab updates (optional - for detecting PDF pages)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Check if it's a PDF
        if (tab.url.includes('.pdf') || tab.url.includes('pdf')) {
            console.log('PDF detected:', tab.url);
            
            // Could send message to content script about PDF detection
            chrome.tabs.sendMessage(tabId, {
                action: 'pdfDetected',
                url: tab.url
            }).catch(() => {
                // Content script might not be ready yet, ignore error
            });
        }
    }
});

console.log('Inline Feedback service worker loaded successfully');
