// CONSOLE DEBUG SCRIPT
// Paste this into Chrome DevTools Console to test the extension manually

console.log('🔧 Starting manual extension debug...');

// Test 1: Check if extension is loaded
if (window.inlineFeedbackExtension) {
    console.log('✅ Extension object found:', window.inlineFeedbackExtension);
} else {
    console.log('❌ Extension object not found - extension may not be loaded');
}

// Test 2: Check if components are initialized
if (window.inlineFeedbackExtension?.components) {
    console.log('📦 Components loaded:', Array.from(window.inlineFeedbackExtension.components.keys()));
} else {
    console.log('❌ No components found');
}

// Test 3: Manual message test
async function testManualMessage() {
    try {
        console.log('📤 Sending test message...');
        const response = await chrome.runtime.sendMessage({
            action: 'translate',
            text: 'Hello world test',
            context: {},
            url: window.location.href
        });
        console.log('📥 Response received:', response);
        return response;
    } catch (error) {
        console.error('❌ Message failed:', error);
        return null;
    }
}

// Test 4: Check API key
async function checkAPIKey() {
    try {
        const result = await chrome.storage.sync.get(['apiKey']);
        if (result.apiKey) {
            console.log('🔑 API key found:', result.apiKey.substring(0, 10) + '...');
        } else {
            console.log('⚠️ No API key configured');
        }
    } catch (error) {
        console.error('❌ Storage access failed:', error);
    }
}

// Run tests
console.log('\n🧪 Running manual tests...');
checkAPIKey();
testManualMessage().then(result => {
    if (result) {
        console.log('✅ Manual message test passed');
    } else {
        console.log('❌ Manual message test failed');
        console.log('\n🔍 Debugging checklist:');
        console.log('1. Is the service worker active? Check chrome://extensions/');
        console.log('2. Are there any errors in the service worker console?');
        console.log('3. Try reloading the extension and webpage');
        console.log('4. Check if content scripts are loaded properly');
    }
});

// Test 5: Manual trigger without selection
window.debugTranslate = function() {
    if (window.inlineFeedbackExtension) {
        console.log('🔧 Triggering manual translate...');
        window.inlineFeedbackExtension.processSelection('translate', 'Test text for debugging');
    } else {
        console.log('❌ Extension not available');
    }
};

console.log('\n📝 Available debug functions:');
console.log('- testManualMessage() - Test service worker communication');
console.log('- checkAPIKey() - Check if API key is configured');
console.log('- debugTranslate() - Trigger translate without text selection');
console.log('\n💡 To test: Select text on page, then check console for messages'); 