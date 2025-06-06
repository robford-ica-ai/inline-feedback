module.exports = {
    env: {
        browser: true,
        es2021: true,
        webextensions: true,
        node: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    globals: {
        chrome: 'readonly',
        globalThis: 'readonly'
    },
    rules: {
        // Relaxed rules for extension development
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'no-console': 'off', // Allow console for debugging
        'prefer-const': 'warn',
        'no-var': 'error',
        'semi': ['error', 'always'],
        'quotes': ['warn', 'single', { allowTemplateLiterals: true }],
        'indent': ['warn', 4],
        'comma-dangle': ['warn', 'never'],
        'eol-last': 'warn',
        'no-trailing-spaces': 'warn',
        
        // Chrome extension specific - allow undefined globals for extension architecture
        'no-undef': 'warn',
        'no-redeclare': 'warn',
        'no-cond-assign': 'warn',
        'no-case-declarations': 'warn',
        'no-useless-escape': 'warn'
    },
    ignorePatterns: [
        'dist/**',
        'packages/**',
        'node_modules/**',
        '*.min.js'
    ]
}; 