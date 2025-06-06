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

        case 'translate':
        case 'explain':
        case 'summarize':
        case 'correct':
            handleAIRequest(request, sendResponse);
            return true; // Keep message channel open for async response
            
        case 'test-api':
            handleAPITest(request, sendResponse);
            return true; // Keep message channel open for async response
            
        default:
            console.log('Unknown action:', request.action);
            sendResponse({ error: 'Unknown action: ' + request.action });
    }
    
    return true; // Keep message channel open for async responses
});

// Handle AI requests (translate, explain, etc.)
async function handleAIRequest(request, sendResponse) {
    try {
        console.log(`Processing ${request.action} request:`, request.text.substring(0, 50) + '...');
        
        // Get API key from storage
        const result = await chrome.storage.sync.get(['apiKey']);
        
        if (!result.apiKey) {
            sendResponse({ 
                error: 'No API key configured. Please set your Claude API key in the extension popup.' 
            });
            return;
        }

        // For now, return a mock response since we don't have the actual API implementation
        // In a real implementation, you'd call the Claude API here
        const mockResponse = getMockResponse(request.action, request.text);
        
        sendResponse({
            content: mockResponse,
            action: request.action,
            success: true
        });
        
    } catch (error) {
        console.error('Error handling AI request:', error);
        sendResponse({ 
            error: `Failed to process ${request.action}: ${error.message}` 
        });
    }
}

// Handle API key testing
async function handleAPITest(request, sendResponse) {
    try {
        console.log('Testing API connection...');
        
        if (!request.apiKey || !request.apiKey.startsWith('sk-ant-')) {
            sendResponse({ 
                success: false, 
                error: 'Invalid API key format' 
            });
            return;
        }

        // For now, just validate the format
        // In a real implementation, you'd make a test call to Claude API
        sendResponse({ 
            success: true, 
            message: 'API key format is valid' 
        });
        
    } catch (error) {
        console.error('Error testing API:', error);
        sendResponse({ 
            success: false, 
            error: error.message 
        });
    }
}

// Mock responses for testing without actual API
function getMockResponse(action, text) {
    const responses = {
        translate: `[Mock Translation] This is a simulated translation of: "${text.substring(0, 50)}..."`,
        explain: `[Mock Explanation] This is a simulated explanation of: "${text.substring(0, 50)}..." - This concept refers to...`,
        summarize: `[Mock Summary] Key points from "${text.substring(0, 50)}...": • Main idea 1 • Main idea 2 • Conclusion`,
        correct: `[Mock Correction] Suggested improvement for: "${text.substring(0, 50)}..."`
    };
    
    return responses[action] || `[Mock Response] Processed "${text.substring(0, 50)}..." with action: ${action}`;
}

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
