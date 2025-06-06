/**
 * UI Feedback - Provides UI feedback elements for the extension
 * Handles notifications, tooltips, and selection menus
 */
class UIFeedback {
    constructor(extension) {
        this.extension = extension;
        this.logger = new Logger('UIFeedback');
        this.notificationContainer = null;
        this.tooltipContainer = null;
        this.selectionMenuContainer = null;
        this.activeTooltips = new Map();
        this.activeNotifications = [];
        this.config = {
            notificationDuration: 5000, // 5 seconds
            tooltipOffset: 10, // 10px offset
            selectionMenuOffset: 10, // 10px offset
            zIndex: 9999
        };
    }

    // Initialize UI feedback
    init() {
        this.logger.debug('Initializing UI feedback');
        
        // Create containers
        this.createContainers();
        
        // Add styles
        this.addStyles();
        
        this.logger.info('UI feedback initialized');
    }

    // Create containers for UI elements
    createContainers() {
        // Create notification container
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'inline-feedback-notifications';
        this.notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            z-index: ${this.config.zIndex};
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        `;
        document.body.appendChild(this.notificationContainer);
        
        // Create tooltip container
        this.tooltipContainer = document.createElement('div');
        this.tooltipContainer.id = 'inline-feedback-tooltips';
        this.tooltipContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            z-index: ${this.config.zIndex};
            pointer-events: none;
        `;
        document.body.appendChild(this.tooltipContainer);
        
        // Create selection menu container
        this.selectionMenuContainer = document.createElement('div');
        this.selectionMenuContainer.id = 'inline-feedback-selection-menu';
        this.selectionMenuContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            z-index: ${this.config.zIndex};
            display: none;
        `;
        document.body.appendChild(this.selectionMenuContainer);
    }

    // Add styles to the document
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .inline-feedback-notification {
                background-color: #f8f9fa;
                border-left: 4px solid #0d6efd;
                border-radius: 4px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                margin-bottom: 10px;
                padding: 12px 15px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                max-width: 100%;
                animation: inline-feedback-fade-in 0.3s ease-out;
            }
            
            .inline-feedback-notification.info {
                border-left-color: #0d6efd;
            }
            
            .inline-feedback-notification.success {
                border-left-color: #198754;
            }
            
            .inline-feedback-notification.warning {
                border-left-color: #ffc107;
            }
            
            .inline-feedback-notification.error {
                border-left-color: #dc3545;
            }
            
            .inline-feedback-notification-close {
                float: right;
                cursor: pointer;
                font-weight: bold;
                margin-left: 10px;
            }
            
            .inline-feedback-tooltip {
                background-color: #212529;
                color: #fff;
                border-radius: 4px;
                padding: 5px 10px;
                font-family: Arial, sans-serif;
                font-size: 12px;
                max-width: 200px;
                pointer-events: none;
                animation: inline-feedback-fade-in 0.2s ease-out;
            }
            
            .inline-feedback-selection-menu {
                background-color: #f8f9fa;
                border-radius: 4px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                padding: 5px;
                font-family: Arial, sans-serif;
                font-size: 14px;
                animation: inline-feedback-fade-in 0.2s ease-out;
            }
            
            .inline-feedback-selection-menu-item {
                padding: 5px 10px;
                cursor: pointer;
                border-radius: 3px;
                display: flex;
                align-items: center;
            }
            
            .inline-feedback-selection-menu-item:hover {
                background-color: #e9ecef;
            }
            
            .inline-feedback-selection-menu-item-icon {
                margin-right: 5px;
            }
            
            @keyframes inline-feedback-fade-in {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    // Show notification
    showNotification(message, type = 'info', duration = this.config.notificationDuration) {
        this.logger.debug(`Showing notification: ${message} (${type})`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `inline-feedback-notification ${type}`;
        
        // Create close button
        const closeButton = document.createElement('span');
        closeButton.className = 'inline-feedback-notification-close';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        // Add content
        notification.appendChild(closeButton);
        notification.appendChild(document.createTextNode(message));
        
        // Add to container
        this.notificationContainer.appendChild(notification);
        
        // Add to active notifications
        this.activeNotifications.push(notification);
        
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }
        
        return notification;
    }

    // Remove notification
    removeNotification(notification) {
        if (!notification || !notification.parentNode) {
            return;
        }
        
        // Remove from DOM
        notification.parentNode.removeChild(notification);
        
        // Remove from active notifications
        const index = this.activeNotifications.indexOf(notification);
        if (index !== -1) {
            this.activeNotifications.splice(index, 1);
        }
    }

    // Show tooltip
    showTooltip(element, content, position = 'top') {
        if (!element || !content) {
            return null;
        }
        
        // Check if element already has a tooltip
        if (this.activeTooltips.has(element)) {
            return this.activeTooltips.get(element);
        }
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'inline-feedback-tooltip';
        tooltip.textContent = content;
        
        // Add to container
        this.tooltipContainer.appendChild(tooltip);
        
        // Position tooltip
        this.positionTooltip(tooltip, element, position);
        
        // Add to active tooltips
        this.activeTooltips.set(element, tooltip);
        
        return tooltip;
    }

    // Position tooltip
    positionTooltip(tooltip, element, position) {
        const elementRect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = elementRect.top - tooltipRect.height - this.config.tooltipOffset;
                left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = elementRect.bottom + this.config.tooltipOffset;
                left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
                left = elementRect.left - tooltipRect.width - this.config.tooltipOffset;
                break;
            case 'right':
                top = elementRect.top + (elementRect.height / 2) - (tooltipRect.height / 2);
                left = elementRect.right + this.config.tooltipOffset;
                break;
            default:
                top = elementRect.top - tooltipRect.height - this.config.tooltipOffset;
                left = elementRect.left + (elementRect.width / 2) - (tooltipRect.width / 2);
        }
        
        // Adjust to viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (left < 0) {
            left = 0;
        } else if (left + tooltipRect.width > viewportWidth) {
            left = viewportWidth - tooltipRect.width;
        }
        
        if (top < 0) {
            top = 0;
        } else if (top + tooltipRect.height > viewportHeight) {
            top = viewportHeight - tooltipRect.height;
        }
        
        // Set position
        tooltip.style.top = `${top + window.scrollY}px`;
        tooltip.style.left = `${left + window.scrollX}px`;
    }

    // Remove tooltip
    removeTooltip(element) {
        if (!element || !this.activeTooltips.has(element)) {
            return;
        }
        
        const tooltip = this.activeTooltips.get(element);
        
        // Remove from DOM
        if (tooltip && tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
        
        // Remove from active tooltips
        this.activeTooltips.delete(element);
    }

    // Show selection menu
    showSelectionMenu(selection, text, actions) {
        if (!selection || !text || !actions || actions.length === 0) {
            return null;
        }
        
        this.logger.debug(`Showing selection menu for: "${text}"`);
        
        // Clear existing menu
        this.selectionMenuContainer.innerHTML = '';
        
        // Create menu element
        const menu = document.createElement('div');
        menu.className = 'inline-feedback-selection-menu';
        
        // Add actions
        for (const action of actions) {
            const item = document.createElement('div');
            item.className = 'inline-feedback-selection-menu-item';
            
            // Add icon if available
            if (action.icon) {
                const icon = document.createElement('span');
                icon.className = 'inline-feedback-selection-menu-item-icon';
                icon.textContent = action.icon;
                item.appendChild(icon);
            }
            
            // Add text
            item.appendChild(document.createTextNode(action.text));
            
            // Add click handler
            item.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                
                // Hide menu
                this.hideSelectionMenu();
                
                // Dispatch action event
                this.dispatchActionEvent(action.action, text);
            });
            
            menu.appendChild(item);
        }
        
        // Add to container
        this.selectionMenuContainer.appendChild(menu);
        
        // Position menu
        this.positionSelectionMenu(selection);
        
        // Show menu
        this.selectionMenuContainer.style.display = 'block';
        
        // Add click handler to hide menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', this.handleDocumentClick = () => {
                this.hideSelectionMenu();
            }, { once: true });
        }, 0);
        
        return menu;
    }

    // Position selection menu
    positionSelectionMenu(selection) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Get menu dimensions
        const menu = this.selectionMenuContainer.firstChild;
        const menuRect = menu.getBoundingClientRect();
        
        // Calculate position
        let top = rect.bottom + this.config.selectionMenuOffset;
        let left = rect.left + (rect.width / 2) - (menuRect.width / 2);
        
        // Adjust to viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (left < 0) {
            left = 0;
        } else if (left + menuRect.width > viewportWidth) {
            left = viewportWidth - menuRect.width;
        }
        
        if (top + menuRect.height > viewportHeight) {
            top = rect.top - menuRect.height - this.config.selectionMenuOffset;
        }
        
        // Set position
        this.selectionMenuContainer.style.top = `${top + window.scrollY}px`;
        this.selectionMenuContainer.style.left = `${left + window.scrollX}px`;
    }

    // Hide selection menu
    hideSelectionMenu() {
        this.selectionMenuContainer.style.display = 'none';
        this.selectionMenuContainer.innerHTML = '';
        
        // Remove document click handler
        if (this.handleDocumentClick) {
            document.removeEventListener('click', this.handleDocumentClick);
            this.handleDocumentClick = null;
        }
    }

    // Dispatch action event
    dispatchActionEvent(action, text) {
        this.logger.debug(`Dispatching action event: ${action} for "${text}"`);
        
        const event = new CustomEvent('inlineFeedbackAction', {
            detail: {
                action: action,
                text: text
            }
        });
        
        document.dispatchEvent(event);
    }

    // Show notification for action
    showActionNotification(action, text) {
        // Create notification content
        const content = `
            <div>
                <strong>Action: ${action}</strong><br>
                Selected text: "${text}"
            </div>
        `;
        
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'inline-feedback-notification info';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #f8f9fa;
            border-left: 4px solid #0d6efd;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            padding: 12px 15px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 300px;
            z-index: ${this.config.zIndex};
        `;
        
        // Create close button
        const closeButton = document.createElement('span');
        closeButton.style.cssText = `
            float: right;
            cursor: pointer;
            font-weight: bold;
            margin-left: 10px;
        `;
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(notification);
        });
        
        // Add content
        notification.appendChild(closeButton);
        notification.innerHTML += content;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, this.config.notificationDuration);
        
        return notification;
    }

    // Hide all UI elements
    hideAllUIElements() {
        // Hide all notifications
        while (this.activeNotifications.length > 0) {
            this.removeNotification(this.activeNotifications[0]);
        }
        
        // Hide all tooltips
        for (const [element, tooltip] of this.activeTooltips.entries()) {
            this.removeTooltip(element);
        }
        
        // Hide selection menu
        this.hideSelectionMenu();
    }
}

// Make available globally
window.UIFeedback = UIFeedback;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIFeedback;
}
