/**
 * Error Handling Module
 * Provides functions for handling various error scenarios in the application
 */

const ErrorHandler = (function() {
    // Private variables
    const errorTypes = {
        NOT_FOUND: '404',
        SERVER_ERROR: '500',
        UNAUTHORIZED: '401',
        FORBIDDEN: '403',
        BAD_REQUEST: '400'
    };
    
    /**
     * Display an error page directly in the container
     * @param {string} errorType - Type of error (from errorTypes)
     * @param {string} errorMessage - Custom error message
     * @param {HTMLElement} container - Container to render the error in
     */
    function showErrorPage(errorType, errorMessage, container) {
        const errorCode = errorTypes[errorType] || '404';
        let errorTitle;
        
        switch(errorCode) {
            case '400':
                errorTitle = 'Bad Request';
                break;
            case '401':
                errorTitle = 'Unauthorized';
                break;
            case '403':
                errorTitle = 'Forbidden';
                break;
            case '500':
                errorTitle = 'Server Error';
                break;
            default:
                errorTitle = 'Page Not Found';
        }
        
        // Create error page HTML
        const errorHTML = `
            <div class="error-container">
                <h1 class="error-code">${errorCode}</h1>
                <h2 class="error-title">${errorTitle}</h2>
                <p class="error-message">${errorMessage || 'Something went wrong. Please try again.'}</p>
                <svg class="error-illustration" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#4361ee" />
                            <stop offset="100%" stop-color="#f72585" />
                        </linearGradient>
                    </defs>
                    <circle cx="250" cy="250" r="200" fill="none" stroke="url(#errorGradient)" stroke-width="10" stroke-dasharray="25 15" />
                    <g transform="translate(150, 150)">
                        <rect x="0" y="0" width="200" height="200" fill="none" />
                        <path d="M40,60 L160,60 M40,100 L160,100 M40,140 L160,140" stroke="#212529" stroke-width="15" stroke-linecap="round" />
                        <circle cx="70" cy="200" r="15" fill="#4361ee" />
                        <circle cx="130" cy="200" r="15" fill="#4361ee" />
                        <path d="M40,0 L160,0 L200,40 L200,160 L160,200 L40,200 L0,160 L0,40 Z" stroke="url(#errorGradient)" stroke-width="10" fill="none" />
                    </g>
                </svg>
                <div class="button-container">
                    <button class="error-button" onclick="window.location.reload()">Refresh Page</button>
                    <button class="error-button" onclick="window.location.href='index.html'">Return Home</button>
                </div>
            </div>
        `;
        
        // Apply the error HTML to the container
        container.innerHTML = errorHTML;
        container.style.display = 'block';
        
        // Hide other containers if they exist
        const containers = ['start-screen', 'question-container', 'feedback-container', 'results-container'];
        containers.forEach(id => {
            const el = document.getElementById(id);
            if (el && el !== container) {
                el.style.display = 'none';
            }
        });
    }
    
    /**
     * Handle API errors based on status code
     * @param {Error} error - The error object
     * @param {string} customMessage - Optional custom message to display
     * @param {HTMLElement} container - Container to render the error in
     */
    function handleApiError(error, customMessage, container) {
        console.error('API Error:', error);
        
        // Default container if not provided
        if (!container) {
            container = document.querySelector('.app-container') || document.body;
        }
        
        let errorType = 'NOT_FOUND';
        let message = customMessage || 'An error occurred while fetching data.';
        
        // Determine error type from status code if available
        if (error.status) {
            switch (error.status) {
                case 400:
                    errorType = 'BAD_REQUEST';
                    message = 'Invalid request. Please check your data and try again.';
                    break;
                case 401:
                    errorType = 'UNAUTHORIZED';
                    message = 'You need to be logged in to access this resource.';
                    break;
                case 403:
                    errorType = 'FORBIDDEN';
                    message = 'You don\'t have permission to access this resource.';
                    break;
                case 404:
                    errorType = 'NOT_FOUND';
                    message = 'The requested resource was not found.';
                    break;
                case 500:
                case 502:
                case 503:
                case 504:
                    errorType = 'SERVER_ERROR';
                    message = 'Server error. Please try again later.';
                    break;
                default:
                    errorType = 'NOT_FOUND';
            }
        }
        
        if (customMessage) {
            message = customMessage;
        }
        
        showErrorPage(errorType, message, container);
    }
    
    /**
     * Handle questions loading error
     * @param {Error} error - The error object
     * @param {string} examName - The name of the exam
     */
    function handleQuestionsLoadingError(error, examName) {
        const container = document.getElementById('question-container');
        
        if (!container) {
            console.error('Question container not found');
            return;
        }
        
        let message;
        if (examName) {
            message = `Failed to load questions for ${examName}. Please run the import script or try again later.`;
        } else {
            message = 'Failed to load questions. Please run the import script or try again later.';
        }
        
        handleApiError(error, message, container);
    }
    
    /**
     * Create a dedicated 404 error page if needed
     */
    function create404Page() {
        document.body.innerHTML = `
        <div class="app-container">
            <div class="error-container">
                <h1 class="error-code">404</h1>
                <h2 class="error-title">Page Not Found</h2>
                <p class="error-message">We couldn't find the page you're looking for. The page might have been moved, deleted, or never existed.</p>
                <svg class="error-illustration" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#4361ee" />
                            <stop offset="100%" stop-color="#f72585" />
                        </linearGradient>
                    </defs>
                    <circle cx="250" cy="250" r="200" fill="none" stroke="url(#errorGradient)" stroke-width="10" stroke-dasharray="25 15" />
                    <g transform="translate(150, 150)">
                        <rect x="0" y="0" width="200" height="200" fill="none" />
                        <path d="M40,60 L160,60 M40,100 L160,100 M40,140 L160,140" stroke="#212529" stroke-width="15" stroke-linecap="round" />
                        <circle cx="70" cy="200" r="15" fill="#4361ee" />
                        <circle cx="130" cy="200" r="15" fill="#4361ee" />
                        <path d="M40,0 L160,0 L200,40 L200,160 L160,200 L40,200 L0,160 L0,40 Z" stroke="url(#errorGradient)" stroke-width="10" fill="none" />
                    </g>
                </svg>
                <div class="button-container">
                    <a href="/" class="error-button">Return to Home</a>
                </div>
            </div>
        </div>
        `;
    }
    
    // Add this to your ErrorHandler.js file
    function handleQuestionsLoadingError(error, examName) {
    const container = document.getElementById('question-container');
    
    if (!container) {
        console.error('Question container not found');
        return;
    }
    
    let message;
    let errorType = 'NOT_FOUND';
    
    // Special handling for flagged questions
    if (examName && examName.includes('Flagged')) {
        message = 'No flagged questions found. Flag some questions during exams by clicking the flag icon.';
    } else if (examName) {
        message = `Failed to load questions for ${examName}. Please make sure questions have been imported.`;
    } else {
        message = 'Failed to load questions. Please run the import script or try again later.';
    }
    
    handleApiError(error, message, container);
}

    // Public API
    return {
        showErrorPage,
        handleApiError,
        handleQuestionsLoadingError,
        create404Page,
        errorTypes
    };
})();

// Check if we need to export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}