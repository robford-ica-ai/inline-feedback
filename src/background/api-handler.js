/**
 * Claude AI API Handler
 * Manages interactions with Anthropic's Claude API
 */

class ClaudeAPIHandler {
    constructor() {
        this.baseURL = 'https://api.anthropic.com/v1/messages';
        this.defaultModel = 'claude-3-haiku-20240307';
        this.maxTokens = 1000;
        this.requestCache = new Map();
        this.rateLimitTracker = new Map();
    }

    /**
     * Send request to Claude API
     * @param {string} prompt - The user prompt
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} API response
     */
    async sendRequest(prompt, options = {}) {
        const {
            model = this.defaultModel,
            maxTokens = this.maxTokens,
            apiKey,
            systemPrompt = null,
            temperature = 0.7,
            useCache = true
        } = options;

        if (!apiKey) {
            throw new Error('API key is required');
        }

        // Check rate limits
        if (this.isRateLimited(apiKey)) {
            throw new Error('Rate limit exceeded. Please wait before making another request.');
        }

        // Check cache first
        const cacheKey = this.generateCacheKey(prompt, model, systemPrompt);
        if (useCache && this.requestCache.has(cacheKey)) {
            console.log('Returning cached response');
            return this.requestCache.get(cacheKey);
        }

        try {
            const response = await this.makeAPIRequest(prompt, {
                model,
                maxTokens,
                apiKey,
                systemPrompt,
                temperature
            });

            // Cache successful responses
            if (useCache && response.content) {
                this.requestCache.set(cacheKey, response);

                // Limit cache size
                if (this.requestCache.size > 50) {
                    const firstKey = this.requestCache.keys().next().value;
                    this.requestCache.delete(firstKey);
                }
            }

            // Update rate limit tracker
            this.updateRateLimit(apiKey);

            return response;

        } catch (error) {
            console.error('Claude API error:', error);
            throw this.handleAPIError(error);
        }
    }

    /**
     * Make the actual API request
     * @private
     */
    async makeAPIRequest(prompt, options) {
        const { model, maxTokens, apiKey, systemPrompt, temperature } = options;

        const messages = [
            {
                role: 'user',
                content: prompt
            }
        ];

        const requestBody = {
            model,
            max_tokens: maxTokens,
            messages,
            temperature
        };

        // Add system prompt if provided
        if (systemPrompt) {
            requestBody.system = systemPrompt;
        }

        const response = await fetch(this.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new APIError(
                `HTTP ${response.status}: ${response.statusText}`,
                response.status,
                errorData
            );
        }

        const data = await response.json();

        return {
            content: data.content?.[0]?.text || '',
            model: data.model,
            usage: data.usage,
            stopReason: data.stop_reason
        };
    }

    /**
     * Test API connection
     * @param {string} apiKey - API key to test
     * @returns {Promise<Object>} Test result
     */
    async testConnection(apiKey) {
        try {
            const response = await this.sendRequest(
                'Hello! Please respond with just "API connection successful"',
                {
                    apiKey,
                    maxTokens: 50,
                    useCache: false
                }
            );

            return {
                success: true,
                model: response.model,
                usage: response.usage
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Handle translation requests
     * @param {string} text - Text to translate
     * @param {string} targetLanguage - Target language
     * @param {string} apiKey - API key
     * @returns {Promise<string>} Translated text
     */
    async translateText(text, targetLanguage = 'English', apiKey) {
        const prompt = `Please translate the following text to ${targetLanguage}. 
        If the text is already in ${targetLanguage}, just return it as-is.
        Only provide the translation, no explanation:

        ${text}`;

        const response = await this.sendRequest(prompt, {
            apiKey,
            maxTokens: 500,
            systemPrompt: 'You are a professional translator. Provide accurate, natural translations.'
        });

        return response.content;
    }

    /**
     * Handle explanation requests for medical terms
     * @param {string} term - Medical term to explain
     * @param {string} context - Surrounding context
     * @param {string} apiKey - API key
     * @returns {Promise<string>} Explanation
     */
    async explainMedicalTerm(term, context, apiKey) {
        const prompt = `Please provide a clear, concise explanation of the medical term "${term}" in the following context:

        Context: ${context}

        Include:
        1. What it is/does
        2. Medical applications (if applicable)
        3. Key properties or characteristics
        4. Any safety considerations

        Keep the explanation accessible but medically accurate.`;

        const response = await this.sendRequest(prompt, {
            apiKey,
            maxTokens: 800,
            systemPrompt: 'You are a medical expert providing clear explanations of medical terms and concepts.'
        });

        return response.content;
    }

    /**
     * Generate cache key for requests
     * @private
     */
    generateCacheKey(prompt, model, systemPrompt) {
        const content = `${prompt}|${model}|${systemPrompt || ''}`;
        return btoa(content).slice(0, 32); // Simple hash
    }

    /**
     * Check if rate limited
     * @private
     */
    isRateLimited(apiKey) {
        const now = Date.now();
        const keyHash = btoa(apiKey).slice(0, 16);
        const lastRequest = this.rateLimitTracker.get(keyHash);

        // Simple rate limiting: max 1 request per 2 seconds
        return lastRequest && (now - lastRequest) < 2000;
    }

    /**
     * Update rate limit tracker
     * @private
     */
    updateRateLimit(apiKey) {
        const keyHash = btoa(apiKey).slice(0, 16);
        this.rateLimitTracker.set(keyHash, Date.now());

        // Clean old entries
        if (this.rateLimitTracker.size > 100) {
            const oldestKey = this.rateLimitTracker.keys().next().value;
            this.rateLimitTracker.delete(oldestKey);
        }
    }

    /**
     * Handle API errors
     * @private
     */
    handleAPIError(error) {
        if (error instanceof APIError) {
            return error;
        }

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return new APIError('Network error. Please check your connection.', 0);
        }

        return new APIError(`Request failed: ${error.message}`, 0);
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.requestCache.clear();
        console.log('API cache cleared');
    }

    /**
     * Get cache stats
     */
    getCacheStats() {
        return {
            size: this.requestCache.size,
            keys: Array.from(this.requestCache.keys())
        };
    }
}

/**
 * Custom API Error class
 */
class APIError extends Error {
    constructor(message, status, details = {}) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.details = details;
    }
}

// Export for use in service worker
if (typeof globalThis !== 'undefined') {
    globalThis.ClaudeAPIHandler = ClaudeAPIHandler;
    globalThis.APIError = APIError;
}
