/**
 * UI Feedback System - Handles all user interface interactions
 */
class UIFeedback {
    constructor() {
        this.logger = new Logger('UIFeedback');
        this.activePopups = new Set();
        this.activeTooltips = new Set();
        this.overlays = new Map();
        this.animations = new Map();
    }

    async init() {
        this.logger.debug('Initializing UI feedback system');

        // Inject CSS styles
        this.injectStyles();

        // Set up global event listeners
        this.setupGlobalListeners();

        this.logger.info('UI feedback system initialized');
    }

    injectStyles() {
        if (document.querySelector('#inline-feedback-styles')) return;

        const style = document.createElement('style');
        style.id = 'inline-feedback-styles';
        style.textContent = this.getCSS();
        document.head.appendChild(style);
    }

    getCSS() {
        return `
      /* Inline Feedback UI Styles */
      .if-popup {
        position: fixed;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        border: 1px solid rgba(0, 0, 0, 0.1);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 400px;
        min-width: 300px;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.2s ease-out;
      }
      
      .if-popup.show {
        opacity: 1;
        transform: translateY(0);
      }
      
      .if-popup-header {
        padding: 16px 20px 12px;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .if-popup-title {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0 0 4px 0;
      }
      
      .if-popup-subtitle {
        font-size: 14px;
        color: #666;
        margin: 0;
      }
      
      .if-popup-content {
        padding: 16px 20px;
        max-height: 300px;
        overflow-y: auto;
      }
      
      .if-popup-text {
        font-size: 14px;
        line-height: 1.5;
        color: #333;
        margin: 0;
        white-space: pre-wrap;
      }
      
      .if-popup-original {
        background: #f8f9fa;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 12px;
        font-size: 13px;
        color: #666;
        border-left: 3px solid #e9ecef;
      }
      
      .if-popup-actions {
        padding: 12px 20px 16px;
        border-top: 1px solid #f0f0f0;
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
      
      .if-btn {
        padding: 8px 16px;
        border-radius: 6px;
        border: none;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      
      .if-btn-primary {
        background: #007AFF;
        color: white;
      }
      
      .if-btn-primary:hover {
        background: #0056CC;
      }
      
      .if-btn-secondary {
        background: #f1f3f4;
        color: #5f6368;
      }
      
      .if-btn-secondary:hover {
        background: #e8eaed;
      }
      
      .if-tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        max-width: 250px;
        z-index: 10001;
        opacity: 0;
        transform: translateY(5px);
        transition: all 0.2s ease-out;
        pointer-events: none;
      }
      
      .if-tooltip.show {
        opacity: 1;
        transform: translateY(0);
      }
      
      .if-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border: 5px solid transparent;
        border-top-color: rgba(0, 0, 0, 0.9);
      }
      
      .if-processing {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        padding: 24px;
        z-index: 10002;
        display: flex;
        align-items: center;
        gap: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .if-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #007AFF;
        border-radius: 50%;
        animation: if-spin 1s linear infinite;
      }
      
      @keyframes if-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .if-selection-menu {
        position: absolute;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(0, 0, 0, 0.1);
        z-index: 10000;
        opacity: 0;
        transform: scale(0.95);
        transition: all 0.15s ease-out;
        overflow: hidden;
      }
      
      .if-selection-menu.show {
        opacity: 1;
        transform: scale(1);
      }
      
      .if-menu-item {
        padding: 12px 16px;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        font-size: 14px;
        color: #333;
        cursor: pointer;
        transition: background-color 0.1s ease;
      }
      
      .if-menu-item:hover {
        background: #f8f9fa;
      }
      
      .if-menu-item:not(:last-child) {
        border-bottom: 1px solid #f0f0f0;
      }
      
      .if-menu-icon {
        display: inline-block;
        width: 16px;
        margin-right: 8px;
      }
      
      .if-highlight {
        background: rgba(255, 235, 59, 0.3);
        border-radius: 2px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .if-highlight:hover {
        background: rgba(255, 235, 59, 0.5);
      }
      
      .if-highlight-medical {
        background: rgba(76, 175, 80, 0.2);
        border-bottom: 2px solid rgba(76, 175, 80, 0.6);
      }
      
      .if-highlight-medical:hover {
        background: rgba(76, 175, 80, 0.3);
      }
      
      .if-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.1);
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      
      .if-backdrop.show {
        opacity: 1;
      }
    `;
    }

    setupGlobalListeners() {
    // Close popups on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllPopups();
            }
        });

        // Close popups on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.if-popup') && !e.target.closest('.if-selection-menu')) {
                this.closeAllPopups();
            }
        });
    }

    showPopup(options) {
        const popup = this.createPopup(options);
        document.body.appendChild(popup);
        this.activePopups.add(popup);

        // Position popup
        this.positionPopup(popup, options.position);

        // Show with animation
        requestAnimationFrame(() => {
            popup.classList.add('show');
        });

        return popup;
    }

    createPopup(options) {
        const popup = document.createElement('div');
        popup.className = 'if-popup';

        // Header
        if (options.title || options.subtitle) {
            const header = document.createElement('div');
            header.className = 'if-popup-header';

            if (options.title) {
                const title = document.createElement('h3');
                title.className = 'if-popup-title';
                title.textContent = options.title;
                header.appendChild(title);
            }

            if (options.subtitle) {
                const subtitle = document.createElement('p');
                subtitle.className = 'if-popup-subtitle';
                subtitle.textContent = options.subtitle;
                header.appendChild(subtitle);
            }

            popup.appendChild(header);
        }

        // Content
        const content = document.createElement('div');
        content.className = 'if-popup-content';

        if (options.originalText) {
            const original = document.createElement('div');
            original.className = 'if-popup-original';
            original.textContent = options.originalText;
            content.appendChild(original);
        }

        const text = document.createElement('p');
        text.className = 'if-popup-text';
        text.textContent = options.content;
        content.appendChild(text);

        popup.appendChild(content);

        // Actions
        if (options.showOptions || options.actions) {
            const actions = document.createElement('div');
            actions.className = 'if-popup-actions';

            if (options.showOptions) {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'if-btn if-btn-secondary';
                copyBtn.textContent = 'Copy';
                copyBtn.onclick = () => {
                    navigator.clipboard.writeText(options.content);
                    this.showTooltip(copyBtn, 'Copied!', 'success');
                };
                actions.appendChild(copyBtn);

                const acceptBtn = document.createElement('button');
                acceptBtn.className = 'if-btn if-btn-primary';
                acceptBtn.textContent = 'Accept';
                acceptBtn.onclick = () => {
                    if (options.onAccept) {
                        options.onAccept({ addToNotes: true });
                    }
                    this.closePopup(popup);
                };
                actions.appendChild(acceptBtn);
            }

            if (options.actions) {
                options.actions.forEach(action => {
                    const btn = document.createElement('button');
                    btn.className = `if-btn ${action.primary ? 'if-btn-primary' : 'if-btn-secondary'}`;
                    btn.textContent = action.text;
                    btn.onclick = () => {
                        if (action.handler) action.handler();
                        if (!action.keepOpen) this.closePopup(popup);
                    };
                    actions.appendChild(btn);
                });
            }

            popup.appendChild(actions);
        }

        return popup;
    }

    positionPopup(popup, position) {
        if (position) {
            popup.style.left = `${position.x}px`;
            popup.style.top = `${position.y}px`;
        } else {
            // Center on screen
            const rect = popup.getBoundingClientRect();
            popup.style.left = `${(window.innerWidth - rect.width) / 2}px`;
            popup.style.top = `${(window.innerHeight - rect.height) / 2}px`;
        }

        // Ensure popup stays within viewport
        this.keepInViewport(popup);
    }

    keepInViewport(element) {
        const rect = element.getBoundingClientRect();
        const padding = 20;

        if (rect.right > window.innerWidth - padding) {
            element.style.left = `${window.innerWidth - rect.width - padding}px`;
        }
        if (rect.left < padding) {
            element.style.left = `${padding}px`;
        }
        if (rect.bottom > window.innerHeight - padding) {
            element.style.top = `${window.innerHeight - rect.height - padding}px`;
        }
        if (rect.top < padding) {
            element.style.top = `${padding}px`;
        }
    }

    showTooltip(target, content, type = 'default', duration = 2000) {
        const tooltip = document.createElement('div');
        tooltip.className = 'if-tooltip';
        tooltip.textContent = content;

        document.body.appendChild(tooltip);
        this.activeTooltips.add(tooltip);

        // Position relative to target
        const targetRect = target.getBoundingClientRect();
        tooltip.style.left = `${targetRect.left + targetRect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${targetRect.top - tooltip.offsetHeight - 10}px`;

        this.keepInViewport(tooltip);

        // Show with animation
        requestAnimationFrame(() => {
            tooltip.classList.add('show');
        });

        // Auto-hide after duration
        setTimeout(() => {
            this.closeTooltip(tooltip);
        }, duration);

        return tooltip;
    }

    showProcessingOverlay(message = 'Processing...') {
        const overlay = document.createElement('div');
        overlay.className = 'if-processing';

        const spinner = document.createElement('div');
        spinner.className = 'if-spinner';
        overlay.appendChild(spinner);

        const text = document.createElement('span');
        text.textContent = message;
        overlay.appendChild(text);

        document.body.appendChild(overlay);
        this.overlays.set('processing', overlay);

        return overlay;
    }

    showSelectionMenu(selection, text, actions = null) {
        const menu = document.createElement('div');
        menu.className = 'if-selection-menu';

        const defaultActions = [
            { icon: '🌐', text: 'Translate', action: 'translate' },
            { icon: '💡', text: 'Explain', action: 'explain' },
            { icon: '📝', text: 'Summarize', action: 'summarize' }
        ];

        const menuActions = actions || defaultActions;

        menuActions.forEach(actionDef => {
            const item = document.createElement('button');
            item.className = 'if-menu-item';

            const icon = document.createElement('span');
            icon.className = 'if-menu-icon';
            icon.textContent = actionDef.icon;
            item.appendChild(icon);

            item.appendChild(document.createTextNode(actionDef.text));

            item.onclick = () => {
                if (actionDef.handler) {
                    actionDef.handler(text);
                } else {
                    // Dispatch to main extension
                    const event = new CustomEvent('inlineFeedbackAction', {
                        detail: { action: actionDef.action, text: text }
                    });
                    document.dispatchEvent(event);
                }
                this.closeSelectionMenu(menu);
            };

            menu.appendChild(item);
        });

        document.body.appendChild(menu);

        // Position near selection
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        menu.style.left = `${rect.left}px`;
        menu.style.top = `${rect.bottom + 10}px`;

        this.keepInViewport(menu);

        // Show with animation
        requestAnimationFrame(() => {
            menu.classList.add('show');
        });

        // Auto-hide after 10 seconds
        setTimeout(() => {
            this.closeSelectionMenu(menu);
        }, 10000);

        return menu;
    }

    closePopup(popup) {
        popup.classList.remove('show');
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
            this.activePopups.delete(popup);
        }, 200);
    }

    closeTooltip(tooltip) {
        tooltip.classList.remove('show');
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
            this.activeTooltips.delete(tooltip);
        }, 200);
    }

    closeSelectionMenu(menu) {
        menu.classList.remove('show');
        setTimeout(() => {
            if (menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
        }, 150);
    }

    closeAllPopups() {
        this.activePopups.forEach(popup => this.closePopup(popup));
        this.activeTooltips.forEach(tooltip => this.closeTooltip(tooltip));

        // Close overlays
        this.overlays.forEach((overlay, key) => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });
        this.overlays.clear();
    }

    highlightText(element, className = 'if-highlight') {
        if (element.classList.contains(className)) return;

        element.classList.add(className);

        // Add click handler for highlights
        element.onclick = (e) => {
            e.stopPropagation();
            this.handleHighlightClick(element, className);
        };
    }

    handleHighlightClick(element, className) {
        const text = element.textContent;

        if (className === 'if-highlight-medical') {
            // Show medical material information
            this.showMaterialInfo(element, text);
        } else {
            // Show general action menu
            const fakeSelection = {
                getRangeAt: () => ({
                    getBoundingClientRect: () => element.getBoundingClientRect()
                })
            };
            this.showSelectionMenu(fakeSelection, text);
        }
    }

    showMaterialInfo(element, materialName) {
    // This would integrate with the medical ontology
        const rect = element.getBoundingClientRect();

        this.showPopup({
            title: materialName,
            subtitle: 'Medical Material Information',
            content: `Click to get detailed information about ${materialName}`,
            position: { x: rect.left, y: rect.bottom + 10 },
            actions: [
                {
                    text: 'Learn More',
                    primary: true,
                    handler: () => {
                        // Trigger detailed lookup
                        const event = new CustomEvent('inlineFeedbackAction', {
                            detail: { action: 'explain', text: materialName }
                        });
                        document.dispatchEvent(event);
                    }
                }
            ]
        });
    }

    // Animation utilities
    fadeIn(element, duration = 200) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;

        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }

    slideUp(element, duration = 200) {
        element.style.transform = 'translateY(20px)';
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms ease`;

        requestAnimationFrame(() => {
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
        });
    }

    // Utility methods
    isVisible() {
        return this.activePopups.size > 0 || this.activeTooltips.size > 0;
    }

    getActiveElements() {
        return {
            popups: Array.from(this.activePopups),
            tooltips: Array.from(this.activeTooltips),
            overlays: Array.from(this.overlays.values())
        };
    }
}

// Make available globally
window.UIFeedback = UIFeedback;
