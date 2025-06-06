/**
 * PDF Text Extractor - Handles text extraction from various PDF viewers
 */
class PDFExtractor {
    constructor() {
        this.logger = new Logger('PDFExtractor');
        this.extractionMethods = new Map();
        this.setupExtractionMethods();
    }

    async init() {
        this.logger.debug('Initializing PDF extractor');

        // Detect PDF viewer type
        this.viewerType = this.detectViewerType();
        this.logger.info(`Detected PDF viewer: ${this.viewerType}`);

        // Set up extraction method based on viewer
        this.activeExtractor = this.extractionMethods.get(this.viewerType);

        if (!this.activeExtractor) {
            throw new Error(`No extraction method available for viewer: ${this.viewerType}`);
        }
    }

    detectViewerType() {
    // PDF.js detection
        if (document.querySelector('#viewerContainer') ||
        document.querySelector('.textLayer') ||
        window.PDFViewerApplication) {
            return 'pdfjs';
        }

        // Chrome native PDF viewer
        if (document.contentType === 'application/pdf' &&
        document.querySelector('embed[type="application/pdf"]')) {
            return 'chrome-native';
        }

        // Firefox native PDF viewer
        if (window.location.href.includes('pdfjs/web/viewer.html')) {
            return 'firefox-pdfjs';
        }

        // Embedded PDF detection
        if (document.querySelector('iframe[src*=".pdf"]') ||
        document.querySelector('object[data*=".pdf"]')) {
            return 'embedded';
        }

        return 'unknown';
    }

    setupExtractionMethods() {
        this.extractionMethods.set('pdfjs', {
            extractPage: this.extractFromPDFJS.bind(this),
            extractSelection: this.extractSelectionFromPDFJS.bind(this),
            getAllText: this.getAllTextFromPDFJS.bind(this)
        });

        this.extractionMethods.set('chrome-native', {
            extractPage: this.extractFromChromeNative.bind(this),
            extractSelection: this.extractSelectionFromChrome.bind(this),
            getAllText: this.getAllTextFromChrome.bind(this)
        });

        this.extractionMethods.set('embedded', {
            extractPage: this.extractFromEmbedded.bind(this),
            extractSelection: this.extractSelectionFromEmbedded.bind(this),
            getAllText: this.getAllTextFromEmbedded.bind(this)
        });
    }

    // PDF.js extraction methods
    async extractFromPDFJS(pageNumber = null) {
        try {
            const textLayers = document.querySelectorAll('.textLayer');

            if (pageNumber !== null) {
                const targetLayer = textLayers[pageNumber - 1];
                return targetLayer ? this.extractTextFromLayer(targetLayer) : '';
            }

            // Extract from all visible pages
            const visibleLayers = Array.from(textLayers).filter(layer => {
                const rect = layer.getBoundingClientRect();
                return rect.top < window.innerHeight && rect.bottom > 0;
            });

            return visibleLayers.map(layer => this.extractTextFromLayer(layer)).join('\n\n');
        } catch (error) {
            this.logger.error('Failed to extract from PDF.js:', error);
            return '';
        }
    }

    extractTextFromLayer(textLayer) {
        const textDivs = textLayer.querySelectorAll('span');
        return Array.from(textDivs)
            .map(span => span.textContent)
            .filter(text => text.trim())
            .join(' ');
    }

    extractSelectionFromPDFJS() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return '';

        return selection.toString().trim();
    }

    async getAllTextFromPDFJS() {
        try {
            // Wait for PDF to be fully loaded
            if (window.PDFViewerApplication) {
                await this.waitForPDFLoad();

                const pdfDocument = window.PDFViewerApplication.pdfDocument;
                if (!pdfDocument) return '';

                const numPages = pdfDocument.numPages;
                const textPromises = [];

                for (let i = 1; i <= numPages; i++) {
                    textPromises.push(this.extractPageText(pdfDocument, i));
                }

                const pages = await Promise.all(textPromises);
                return pages.join('\n\n--- Page Break ---\n\n');
            }

            // Fallback to text layer extraction
            return this.extractFromPDFJS();
        } catch (error) {
            this.logger.error('Failed to extract all text from PDF.js:', error);
            return this.extractFromPDFJS();
        }
    }

    async extractPageText(pdfDocument, pageNumber) {
        try {
            const page = await pdfDocument.getPage(pageNumber);
            const textContent = await page.getTextContent();

            return textContent.items
                .map(item => item.str)
                .filter(text => text.trim())
                .join(' ');
        } catch (error) {
            this.logger.debug(`Failed to extract page ${pageNumber}:`, error);
            return '';
        }
    }

    async waitForPDFLoad() {
        return new Promise((resolve) => {
            if (window.PDFViewerApplication?.pdfDocument) {
                resolve();
                return;
            }

            const checkInterval = setInterval(() => {
                if (window.PDFViewerApplication?.pdfDocument) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);

            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 5000);
        });
    }

    // Chrome native PDF viewer methods
    async extractFromChromeNative() {
        try {
            // Chrome native PDFs are harder to extract from
            // Try to get text through accessibility API or fall back to OCR
            return this.extractViaAccessibility() ||
             await this.extractViaClipboard() ||
             'Text extraction not available for this PDF viewer';
        } catch (error) {
            this.logger.error('Failed to extract from Chrome native:', error);
            return '';
        }
    }

    extractSelectionFromChrome() {
        const selection = window.getSelection();
        return selection.toString().trim();
    }

    getAllTextFromChrome() {
        return this.extractFromChromeNative();
    }

    extractViaAccessibility() {
    // Try to get accessible text content
        const body = document.body;
        if (body && body.textContent) {
            return body.textContent.trim();
        }
        return '';
    }

    async extractViaClipboard() {
        try {
            // Select all and copy to get text
            document.execCommand('selectAll');
            document.execCommand('copy');

            // Get from clipboard (requires permission)
            const text = await navigator.clipboard.readText();

            // Clear selection
            window.getSelection().removeAllRanges();

            return text;
        } catch (error) {
            this.logger.debug('Clipboard extraction failed:', error);
            return '';
        }
    }

    // Embedded PDF methods
    async extractFromEmbedded() {
    // For embedded PDFs, we have limited options
    // Try to access iframe content if same-origin
        const iframes = document.querySelectorAll('iframe[src*=".pdf"]');

        for (const iframe of iframes) {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    return iframeDoc.body.textContent || '';
                }
            } catch (error) {
                this.logger.debug('Cross-origin iframe access blocked:', error);
            }
        }

        return 'Text extraction not available for embedded PDFs';
    }

    extractSelectionFromEmbedded() {
        return window.getSelection().toString().trim();
    }

    getAllTextFromEmbedded() {
        return this.extractFromEmbedded();
    }

    // Public API methods
    async getCurrentPageText() {
        if (!this.activeExtractor) {
            throw new Error('PDF extractor not initialized');
        }

        return await this.activeExtractor.extractPage();
    }

    getSelectedText() {
        if (!this.activeExtractor) {
            throw new Error('PDF extractor not initialized');
        }

        return this.activeExtractor.extractSelection();
    }

    async getFullDocumentText() {
        if (!this.activeExtractor) {
            throw new Error('PDF extractor not initialized');
        }

        return await this.activeExtractor.getAllText();
    }

    getContextAroundSelection(selection, contextLines = 2) {
        if (!selection) return '';

        try {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;

            // Get parent text container
            let textContainer = container.nodeType === Node.TEXT_NODE ?
                container.parentElement : container;

            while (textContainer && !textContainer.textContent.includes(selection.toString())) {
                textContainer = textContainer.parentElement;
            }

            if (!textContainer) return selection.toString();

            const fullText = textContainer.textContent;
            const selectedText = selection.toString();
            const selectionIndex = fullText.indexOf(selectedText);

            if (selectionIndex === -1) return selectedText;

            // Extract context around selection
            const lines = fullText.split('\n');
            const selectedLine = lines.findIndex(line => line.includes(selectedText));

            if (selectedLine === -1) return selectedText;

            const startLine = Math.max(0, selectedLine - contextLines);
            const endLine = Math.min(lines.length - 1, selectedLine + contextLines);

            const contextLines = lines.slice(startLine, endLine + 1);
            return contextLines.join('\n');

        } catch (error) {
            this.logger.debug('Failed to get context:', error);
            return selection.toString();
        }
    }

    isTextExtractable() {
        return this.viewerType !== 'unknown' && this.activeExtractor !== null;
    }

    getViewerInfo() {
        return {
            type: this.viewerType,
            extractable: this.isTextExtractable(),
            methods: this.activeExtractor ? Object.keys(this.activeExtractor) : []
        };
    }
}

// Make available globally
window.PDFExtractor = PDFExtractor;
