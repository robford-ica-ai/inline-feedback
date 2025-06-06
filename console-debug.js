/**
 * Console Debug - Provides enhanced console debugging functionality
 * Extends the native console with additional features for debugging
 */

// Store original console methods
const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug
};

// Debug settings
const debugSettings = {
    enabled: true,
    logLevel: 'debug', // debug, info, warn, error
    showTimestamp: true,
    logToStorage: false,
    maxStoredLogs: 100,
    storedLogs: []
};

// Log levels
const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

// Override console methods
if (debugSettings.enabled) {
    // Format log message
    function formatLogMessage(level, args) {
        const timestamp = debugSettings.showTimestamp ? `[${new Date().toLocaleTimeString()}] ` : '';
        return [`${timestamp}[${level.toUpperCase()}]`, ...args];
    }
    
    // Store log in storage
    function storeLog(level, args) {
        if (debugSettings.logToStorage) {
            const logEntry = {
                timestamp: new Date(),
                level: level,
                message: args.map(arg => {
                    try {
                        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                    } catch (e) {
                        return '[Object]';
                    }
                }).join(' ')
            };
            
            debugSettings.storedLogs.push(logEntry);
            
            // Trim logs if exceeding max
            if (debugSettings.storedLogs.length > debugSettings.maxStoredLogs) {
                debugSettings.storedLogs.shift();
            }
        }
    }
    
    // Override console.log
    console.log = function(...args) {
        if (LOG_LEVELS[debugSettings.logLevel] <= LOG_LEVELS.info) {
            originalConsole.log.apply(console, args);
            storeLog('log', args);
        }
    };
    
    // Override console.info
    console.info = function(...args) {
        if (LOG_LEVELS[debugSettings.logLevel] <= LOG_LEVELS.info) {
            const formattedArgs = formatLogMessage('info', args);
            originalConsole.info.apply(console, formattedArgs);
            storeLog('info', args);
        }
    };
    
    // Override console.warn
    console.warn = function(...args) {
        if (LOG_LEVELS[debugSettings.logLevel] <= LOG_LEVELS.warn) {
            const formattedArgs = formatLogMessage('warn', args);
            originalConsole.warn.apply(console, formattedArgs);
            storeLog('warn', args);
        }
    };
    
    // Override console.error
    console.error = function(...args) {
        if (LOG_LEVELS[debugSettings.logLevel] <= LOG_LEVELS.error) {
            const formattedArgs = formatLogMessage('error', args);
            originalConsole.error.apply(console, formattedArgs);
            storeLog('error', args);
        }
    };
    
    // Override console.debug
    console.debug = function(...args) {
        if (LOG_LEVELS[debugSettings.logLevel] <= LOG_LEVELS.debug) {
            const formattedArgs = formatLogMessage('debug', args);
            originalConsole.debug.apply(console, formattedArgs);
            storeLog('debug', args);
        }
    };
}

// Add debug utilities to window
window.debugUtils = {
    // Get stored logs
    getLogs() {
        return debugSettings.storedLogs;
    },
    
    // Clear stored logs
    clearLogs() {
        debugSettings.storedLogs = [];
        console.log('Debug logs cleared');
    },
    
    // Enable/disable logging
    setEnabled(enabled) {
        debugSettings.enabled = !!enabled;
        console.log(`Debug logging ${debugSettings.enabled ? 'enabled' : 'disabled'}`);
        
        // Restore original console if disabled
        if (!debugSettings.enabled) {
            console.log = originalConsole.log;
            console.info = originalConsole.info;
            console.warn = originalConsole.warn;
            console.error = originalConsole.error;
            console.debug = originalConsole.debug;
        }
    },
    
    // Set log level
    setLogLevel(level) {
        if (LOG_LEVELS[level] !== undefined) {
            debugSettings.logLevel = level;
            console.log(`Debug log level set to: ${level}`);
        } else {
            console.error(`Invalid log level: ${level}. Valid levels are: debug, info, warn, error`);
        }
    },
    
    // Enable/disable timestamp
    showTimestamp(show) {
        debugSettings.showTimestamp = !!show;
        console.log(`Timestamps ${debugSettings.showTimestamp ? 'enabled' : 'disabled'}`);
    },
    
    // Enable/disable log storage
    setLogToStorage(enable) {
        debugSettings.logToStorage = !!enable;
        console.log(`Log storage ${debugSettings.logToStorage ? 'enabled' : 'disabled'}`);
    },
    
    // Set max stored logs
    setMaxStoredLogs(max) {
        if (typeof max === 'number' && max > 0) {
            debugSettings.maxStoredLogs = max;
            console.log(`Max stored logs set to: ${max}`);
        } else {
            console.error('Max stored logs must be a positive number');
        }
    },
    
    // Get current settings
    getSettings() {
        return { ...debugSettings };
    }
};

// Log initialization
console.log('Console debug utilities initialized');
