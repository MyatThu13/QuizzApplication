/**
 * Custom Modal Dialog Component
 * Provides stylish, modern alert and confirmation dialogs
 */

const ModalDialog = (function() {
    // Private variables
    let container = null;
    let overlay = null;
    let activeDialog = null;
    let resolvePromise = null;
    let rejectPromise = null;
    
    /**
     * Initialize the dialog container
     * Creates the overlay and container elements
     */
    function init() {
        // Check if already initialized
        if (container) return;
        
        // Create overlay
        overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        // Create container
        container = document.createElement('div');
        container.className = 'modal-container';
        
        // Append to body
        document.body.appendChild(overlay);
        document.body.appendChild(container);
        
        // Add styles if not present
        if (!document.getElementById('modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'modal-styles';
            styles.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: none;
                    z-index: 1000;
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                }
                
                .modal-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 1001;
                }
                
                .modal-dialog {
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                    width: 90%;
                    max-width: 420px;
                    overflow: hidden;
                    animation: modalFadeIn 0.3s ease-out;
                }
                
                .modal-header {
                    padding: 20px 25px 15px;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .modal-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #212529;
                    margin: 0;
                }
                
                .modal-body {
                    padding: 20px 25px;
                    color: #6c757d;
                    font-size: 1rem;
                    line-height: 1.5;
                }
                
                .modal-footer {
                    padding: 15px 25px 20px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
                
                .modal-btn {
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-weight: 500;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                
                .modal-btn:focus {
                    outline: none;
                }
                
                .modal-btn-secondary {
                    background-color: #f8f9fa;
                    color: #6c757d;
                    border: 1px solid #dee2e6;
                }
                
                .modal-btn-secondary:hover {
                    background-color: #e9ecef;
                }
                
                .modal-btn-primary {
                    background-color: #4361ee;
                    color: white;
                }
                
                .modal-btn-primary:hover {
                    background-color: #3a0ca3;
                }
                
                .modal-btn-danger {
                    background-color: #f72585;
                    color: white;
                }
                
                .modal-btn-danger:hover {
                    background-color: #d90166;
                }
                
                @keyframes modalFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    /**
     * Show a confirmation dialog
     * @param {string} title - The dialog title
     * @param {string} message - The dialog message
     * @param {string} confirmText - Text for confirm button
     * @param {string} cancelText - Text for cancel button
     * @param {string} confirmType - Button type (primary, danger)
     * @returns {Promise} Resolves with true if confirmed, false if cancelled
     */
    function confirm(title, message, confirmText = 'OK', cancelText = 'Cancel', confirmType = 'primary') {
        init();
        
        return new Promise((resolve, reject) => {
            // Store resolve and reject functions
            resolvePromise = resolve;
            rejectPromise = reject;
            
            // Create dialog element
            const dialog = document.createElement('div');
            dialog.className = 'modal-dialog';
            
            // Create dialog content
            dialog.innerHTML = `
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-secondary" data-action="cancel">${cancelText}</button>
                    <button class="modal-btn modal-btn-${confirmType}" data-action="confirm">${confirmText}</button>
                </div>
            `;
            
            // Add event listeners
            const confirmBtn = dialog.querySelector('[data-action="confirm"]');
            const cancelBtn = dialog.querySelector('[data-action="cancel"]');
            
            confirmBtn.addEventListener('click', () => {
                hide();
                resolve(true);
            });
            
            cancelBtn.addEventListener('click', () => {
                hide();
                resolve(false);
            });
            
            // Show the dialog
            activeDialog = dialog;
            container.innerHTML = '';
            container.appendChild(dialog);
            overlay.style.display = 'block';
            container.style.display = 'flex';
        });
    }
    
    /**
     * Show an alert dialog
     * @param {string} title - The dialog title
     * @param {string} message - The dialog message
     * @param {string} buttonText - Text for the button
     * @returns {Promise} Resolves when dismissed
     */
    function alert(title, message, buttonText = 'OK') {
        init();
        
        return new Promise((resolve) => {
            // Create dialog element
            const dialog = document.createElement('div');
            dialog.className = 'modal-dialog';
            
            // Create dialog content
            dialog.innerHTML = `
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn modal-btn-primary" data-action="ok">${buttonText}</button>
                </div>
            `;
            
            // Add event listener
            const okBtn = dialog.querySelector('[data-action="ok"]');
            
            okBtn.addEventListener('click', () => {
                hide();
                resolve();
            });
            
            // Show the dialog
            activeDialog = dialog;
            container.innerHTML = '';
            container.appendChild(dialog);
            overlay.style.display = 'block';
            container.style.display = 'flex';
        });
    }
    
    /**
     * Hide the active dialog
     */
    function hide() {
        if (overlay && container) {
            overlay.style.display = 'none';
            container.style.display = 'none';
            container.innerHTML = '';
            activeDialog = null;
        }
    }
    
    // Public API
    return {
        confirm,
        alert,
        hide
    };
})();