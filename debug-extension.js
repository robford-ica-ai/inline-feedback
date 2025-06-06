/**
 * Debug script to test extension messaging logic
 * Run with: node debug-extension.js
 */

// Mock Chrome API for testing
global.chrome = {
    runtime: {
        sendMessage: async (message) => {
            console.log('📤 Content script sending:', message);
            
            // Simulate service worker response
            const mockServiceWorker = {
                translate: `[Mock Translation] This is a simulated translation of: "${message.text?.substring(0, 50)}..."`,
                explain: `[Mock Explanation] This is a simulated explanation of: "${message.text?.substring(0, 50)}..." - This concept refers to...`,
                summarize: `[Mock Summary] Key points from "${message.text?.substring(0, 50)}...": • Main idea 1 • Main idea 2 • Conclusion`,
                correct: `[Mock Correction] Suggested improvement for: "${message.text?.substring(0, 50)}..."`
            };
            
            const response = {
                content: mockServiceWorker[message.action] || `[Mock Response] Processed "${message.text?.substring(0, 50)}..." with action: ${message.action}`,
                action: message.action,
                success: true
            };
            
            console.log('📥 Service worker responding:', response);
            return response;
        }
    },
    storage: {
        sync: {
            get: async (keys) => {
                console.log('🔍 Storage get:', keys);
                return { apiKey: 'sk-ant-test-key' }; // Mock API key
            }
        }
    }
};

// Test the getLoadingMessage function
function getLoadingMessage(action) {
    const messages = {
        translate: 'Translating...',
        explain: 'Explaining...',
        summarize: 'Summarizing...',
        correct: 'Correcting...'
    };
    return messages[action] || 'Processing...';
}

// Test the processWithClaude function logic
async function testProcessWithClaude(action, text) {
    try {
        console.log(`\n🧪 Testing ${action} with text: "${text.substring(0, 30)}..."`);
        console.log(`📝 Loading message: "${getLoadingMessage(action)}"`);
        
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout - no response from background script')), 10000);
        });

        const messagePromise = chrome.runtime.sendMessage({
            action: action,
            text: text,
            context: {},
            url: 'https://example.com'
        });

        const response = await Promise.race([messagePromise, timeoutPromise]);

        if (!response) {
            throw new Error('No response from background script - check if API key is configured');
        }

        if (response.error) {
            throw new Error(response.error);
        }

        console.log(`✅ ${action} completed successfully`);
        console.log(`📄 Response: ${response.content.substring(0, 100)}...`);
        return response;
        
    } catch (error) {
        console.error(`❌ ${action} failed:`, error.message);
        throw error;
    }
}

// Run tests
async function runTests() {
    console.log('🚀 Starting extension logic tests...\n');
    
    const testCases = [
        { action: 'translate', text: 'Hello world, this is a test message for translation.' },
        { action: 'explain', text: 'Quantum mechanics is a fundamental theory in physics.' },
        { action: 'summarize', text: 'This is a long article about artificial intelligence and machine learning technologies that are being developed by various companies around the world.' }
    ];
    
    for (const testCase of testCases) {
        try {
            await testProcessWithClaude(testCase.action, testCase.text);
            console.log(`✅ ${testCase.action} test passed\n`);
        } catch (error) {
            console.log(`❌ ${testCase.action} test failed: ${error.message}\n`);
        }
    }
    
    console.log('🏁 Tests completed!');
    console.log('\n📋 If these tests pass but the extension still pinwheels:');
    console.log('1. Check Chrome DevTools console for errors');
    console.log('2. Verify the extension was properly reloaded');
    console.log('3. Check that both service worker and content script are loaded');
}

// Run the tests
runTests().catch(console.error); 