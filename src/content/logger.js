/**
 * Logger - Provides logging functionality for the extension
 * Supports different log levels and debug mode
 */
class Logger {
    constructor(moduleName) {
        this.moduleName = moduleName || 'Unknown';
        this.debugMode = false;
        this.logLevel = Logger.LOG_LEVELS.INFO;
        this.logPrefix = `[${this.moduleName}]`;
        this.logHistory = [];
        this.maxHistorySize = 100;
    }

    // Log levels
    static get LOG_LEVELS() {
        return {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3
        };
    }

    // Set debug mode
    setDebugMode(enabled) {
        this.debugMode = !!enabled;
        
        if (this.debugMode) {
            this.logLevel = Logger.LOG_LEVELS.DEBUG;
        } else {
            this.logLevel = Logger.LOG_LEVELS.INFO;
        }
        
        return this;
    }

    // Set log level
    setLogLevel(level) {
        if (typeof level === 'string') {
            const upperLevel = level.toUpperCase();
            if (Logger.LOG_LEVELS[upperLevel] !== undefined) {
                this.logLevel = Logger.LOG_LEVELS[upperLevel];
            }
        } else if (typeof level === 'number' && level >= 0 && level <= 3) {
            this.logLevel = level;
        }
        
        return this;
    }

    // Format log message
    formatLogMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] ${this.logPrefix} ${message}`;
        
        // Add to log history
        this.addToHistory(level, formattedMessage, args);
        
        return [formattedMessage, ...args];
    }

    // Add to log history
    addToHistory(level, message, args) {
        this.logHistory.push({
            timestamp: new Date(),
            level: level,
            message: message,
            args: args
        });
        
        // Trim history if exceeding max size
        if (this.logHistory.length > this.maxHistorySize) {
            this.logHistory.shift();
        }
    }

    // Debug log
    debug(message, ...args) {
        if (this.logLevel <= Logger.LOG_LEVELS.DEBUG) {
            console.debug(...this.formatLogMessage('DEBUG', message, ...args));
        }
        
        return this;
    }

    // Info log
    info(message, ...args) {
        if (this.logLevel <= Logger.LOG_LEVELS.INFO) {
            console.info('%c' + this.formatLogMessage('INFO', message, ...args)[0], 'color: #0d6efd', ...args);
        }
        
        return this;
    }

    // Warning log
    warn(message, ...args) {
        if (this.logLevel <= Logger.LOG_LEVELS.WARN) {
            console.warn(...this.formatLogMessage('WARN', message, ...args));
        }
        
        return this;
    }

    // Error log
    error(message, ...args) {
        if (this.logLevel <= Logger.LOG_LEVELS.ERROR) {
            console.error(...this.formatLogMessage('ERROR', message, ...args));
        }
        
        return this;
    }

    // Log with specified level
    log(level, message, ...args) {
        switch (level) {
            case 'debug':
            case Logger.LOG_LEVELS.DEBUG:
                this.debug(message, ...args);
                break;
            case 'info':
            case Logger.LOG_LEVELS.INFO:
                this.info(message, ...args);
                break;
            case 'warn':
            case Logger.LOG_LEVELS.WARN:
                this.warn(message, ...args);
                break;
            case 'error':
            case Logger.LOG_LEVELS.ERROR:
                this.error(message, ...args);
                break;
            default:
                this.info(message, ...args);
        }
        
        return this;
    }

    // Get log history
    getHistory() {
        return this.logHistory;
    }

    // Clear log history
    clearHistory() {
        this.logHistory = [];
        return this;
    }

    // Set max history size
    setMaxHistorySize(size) {
        if (typeof size === 'number' && size > 0) {
            this.maxHistorySize = size;
            
