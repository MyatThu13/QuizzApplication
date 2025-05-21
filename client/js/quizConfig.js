// Create a new file: client/js/quizConfig.js

/**
 * Quiz Configuration Module
 * Handles the quiz configuration UI and settings management
 */

const QuizConfig = (function() {
    // Private state
    let currentExamId = '';
    let currentExamTitle = '';
    let availableQuestionCounts = {
        new: 0,
        answered: 0,
        flagged: 0,
        incorrect: 0
    };
    
    // Default configuration
    const defaultConfig = {
        showAnswerMode: 'afterEach', // 'afterEach' or 'afterSubmit'
        includeNew: true,
        includeAnswered: true,
        includeFlagged: false,
        includeIncorrect: false,
        questionCount: 15
    };
    
    // Current configuration (initialize with defaults)
    let currentConfig = { ...defaultConfig };
    
    /**
     * Initialize the quiz configuration UI
     * @param {string} examId - The ID of the exam
     * @param {string} examTitle - The title of the exam
     * @param {Object} questionCounts - Available question counts
     */
    function init(examId, examTitle, questionCounts = {}) {
        currentExamId = examId;
        currentExamTitle = examTitle;
        
        // Update available question counts
        if (questionCounts.new !== undefined) availableQuestionCounts.new = questionCounts.new;
        if (questionCounts.answered !== undefined) availableQuestionCounts.answered = questionCounts.answered;
        if (questionCounts.flagged !== undefined) availableQuestionCounts.flagged = questionCounts.flagged;
        if (questionCounts.incorrect !== undefined) availableQuestionCounts.incorrect = questionCounts.incorrect;
        
        // Show the configuration UI
        showConfigUI();
    }
    
    /**
     * Create and show the configuration UI
     */
    function showConfigUI() {
        // Create container for configuration UI
        const configContainer = document.createElement('div');
        configContainer.id = 'quiz-config-container';
        configContainer.classList.add('app-container');
        
        // Set the HTML content
        configContainer.innerHTML = `
            <div class="quiz-config-header">
                <button id="config-back-btn" class="config-back-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                </button>
                <div class="config-title">
                    <h2>Build Your Own Quiz</h2>
                </div>
                <div class="config-edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                    </svg>
                </div>
            </div>
            
            <div class="quiz-config-content">
                <div class="config-section">
                    <h3>When do you want to see the correct answer and explanation?</h3>
                    <div class="radio-option-group">
                        <div class="radio-option ${currentConfig.showAnswerMode === 'afterEach' ? 'selected' : ''}">
                            <label for="answer-mode-after-each">After each question</label>
                            <div class="radio-button ${currentConfig.showAnswerMode === 'afterEach' ? 'selected' : ''}" id="answer-mode-after-each"></div>
                        </div>
                        <div class="radio-option ${currentConfig.showAnswerMode === 'afterSubmit' ? 'selected' : ''}">
                            <label for="answer-mode-after-submit">After submitting quiz</label>
                            <div class="radio-button ${currentConfig.showAnswerMode === 'afterSubmit' ? 'selected' : ''}" id="answer-mode-after-submit"></div>
                        </div>
                    </div>
                </div>
                
                <div class="config-section">
                    <h3>Include:</h3>
                    <div class="checkbox-option-group">
                        <div class="checkbox-option">
                            <label for="include-new">New Questions</label>
                            <div class="question-count">${availableQuestionCounts.new}</div>
                            <div class="checkbox ${currentConfig.includeNew ? 'selected' : ''}" id="include-new"></div>
                        </div>
                        <div class="checkbox-option">
                            <label for="include-answered">Answered Questions</label>
                            <div class="question-count">${availableQuestionCounts.answered}</div>
                            <div class="checkbox ${currentConfig.includeAnswered ? 'selected' : ''}" id="include-answered"></div>
                        </div>
                        <div class="checkbox-option">
                            <label for="include-flagged">Flagged Questions</label>
                            <div class="question-count">${availableQuestionCounts.flagged}</div>
                            <div class="checkbox ${currentConfig.includeFlagged ? 'selected' : ''}" id="include-flagged"></div>
                        </div>
                        <div class="checkbox-option">
                            <label for="include-incorrect">Incorrect Questions</label>
                            <div class="question-count">${availableQuestionCounts.incorrect}</div>
                            <div class="checkbox ${currentConfig.includeIncorrect ? 'selected' : ''}" id="include-incorrect"></div>
                        </div>
                    </div>
                </div>
                
                <div class="config-section">
                    <h3>How many questions?</h3>
                    <div class="question-count-selector">
                        <input type="number" id="question-count-input" value="${currentConfig.questionCount}" min="1" max="100">
                    </div>
                </div>
                
                <div class="config-actions">
                    <button id="start-quiz-btn" class="start-quiz-button">Start Quiz</button>
                </div>
            </div>
        `;
        
        // Add the container to the page
        document.body.appendChild(configContainer);
        
        // Attach event listeners
        attachEventListeners();
        
        // Hide other containers
        const containers = ['start-screen', 'question-container', 'feedback-container', 'results-container'];
        containers.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'none';
            }
        });
    }
    
    /**
     * Attach event listeners to UI elements
     */
    function attachEventListeners() {
        // Back button
        const backButton = document.getElementById('config-back-btn');
        if (backButton) {
            backButton.addEventListener('click', () => {
                closeConfigUI();
            });
        }
        
        // Answer mode selection
        const answerModeAfterEach = document.getElementById('answer-mode-after-each');
        const answerModeAfterSubmit = document.getElementById('answer-mode-after-submit');
        
        if (answerModeAfterEach) {
            answerModeAfterEach.addEventListener('click', () => {
                selectAnswerMode('afterEach');
            });
        }
        
        if (answerModeAfterSubmit) {
            answerModeAfterSubmit.addEventListener('click', () => {
                selectAnswerMode('afterSubmit');
            });
        }
        
        // Include checkboxes
        const includeNew = document.getElementById('include-new');
        const includeAnswered = document.getElementById('include-answered');
        const includeFlagged = document.getElementById('include-flagged');
        const includeIncorrect = document.getElementById('include-incorrect');
        
        if (includeNew) {
            includeNew.addEventListener('click', () => {
                toggleInclude('new');
            });
        }
        
        if (includeAnswered) {
            includeAnswered.addEventListener('click', () => {
                toggleInclude('answered');
            });
        }
        
        if (includeFlagged) {
            includeFlagged.addEventListener('click', () => {
                toggleInclude('flagged');
            });
        }
        
        if (includeIncorrect) {
            includeIncorrect.addEventListener('click', () => {
                toggleInclude('incorrect');
            });
        }
        
        // Question count input
        const questionCountInput = document.getElementById('question-count-input');
        if (questionCountInput) {
            questionCountInput.addEventListener('change', (event) => {
                updateQuestionCount(parseInt(event.target.value));
            });
        }
        
        // Start quiz button
        const startQuizButton = document.getElementById('start-quiz-btn');
        if (startQuizButton) {
            startQuizButton.addEventListener('click', () => {
                startQuizWithConfig();
            });
        }
    }
    
    /**
     * Select the answer mode (after each question or after submitting quiz)
     * @param {string} mode - The answer mode ('afterEach' or 'afterSubmit')
     */
    function selectAnswerMode(mode) {
        currentConfig.showAnswerMode = mode;
        
        // Update UI
        const afterEachElement = document.getElementById('answer-mode-after-each');
        const afterSubmitElement = document.getElementById('answer-mode-after-submit');
        
        if (afterEachElement) {
            afterEachElement.classList.toggle('selected', mode === 'afterEach');
            afterEachElement.parentElement.classList.toggle('selected', mode === 'afterEach');
        }
        
        if (afterSubmitElement) {
            afterSubmitElement.classList.toggle('selected', mode === 'afterSubmit');
            afterSubmitElement.parentElement.classList.toggle('selected', mode === 'afterSubmit');
        }
    }
    
    /**
     * Toggle include/exclude for a question type
     * @param {string} type - The question type ('new', 'answered', 'flagged', 'incorrect')
     */
    function toggleInclude(type) {
        const mapToConfig = {
            'new': 'includeNew',
            'answered': 'includeAnswered',
            'flagged': 'includeFlagged',
            'incorrect': 'includeIncorrect'
        };
        
        const configKey = mapToConfig[type];
        if (!configKey) return;
        
        // Toggle the value
        currentConfig[configKey] = !currentConfig[configKey];
        
        // Update UI
        const checkboxElement = document.getElementById(`include-${type}`);
        if (checkboxElement) {
            checkboxElement.classList.toggle('selected', currentConfig[configKey]);
        }
        
        // Ensure at least one type is selected
        const anySelected = currentConfig.includeNew || 
                           currentConfig.includeAnswered || 
                           currentConfig.includeFlagged || 
                           currentConfig.includeIncorrect;
        
        if (!anySelected) {
            // If nothing is selected, revert the change
            currentConfig[configKey] = true;
            if (checkboxElement) {
                checkboxElement.classList.add('selected');
            }
            
            // Show a notification to the user
            showNotification('At least one question type must be selected');
        }
        
        // Update available question count and limit the question count input
        updateAvailableQuestionCount();
    }
    
    /**
     * Update the question count
     * @param {number} count - The new question count
     */
    function updateQuestionCount(count) {
        // Ensure count is a valid number
        if (isNaN(count) || count < 1) {
            count = 1;
        }
        
        // Get the available question count
        const availableCount = calculateAvailableQuestionCount();
        
        // Limit the count to the available count
        if (count > availableCount) {
            count = availableCount;
        }
        
        // Update the config
        currentConfig.questionCount = count;
        
        // Update the input value
        const questionCountInput = document.getElementById('question-count-input');
        if (questionCountInput) {
            questionCountInput.value = count;
        }
    }
    
    /**
     * Calculate the available question count based on selected types
     * @returns {number} The available question count
     */
    function calculateAvailableQuestionCount() {
        let totalAvailable = 0;
        
        if (currentConfig.includeNew) totalAvailable += availableQuestionCounts.new;
        if (currentConfig.includeAnswered) totalAvailable += availableQuestionCounts.answered;
        if (currentConfig.includeFlagged) totalAvailable += availableQuestionCounts.flagged;
        if (currentConfig.includeIncorrect) totalAvailable += availableQuestionCounts.incorrect;
        
        return totalAvailable;
    }
    
    /**
     * Update the available question count and limit the question count input
     */
    function updateAvailableQuestionCount() {
        const availableCount = calculateAvailableQuestionCount();
        
        // Update the question count if it exceeds the available count
        if (currentConfig.questionCount > availableCount) {
            updateQuestionCount(availableCount);
        }
    }
    
function startQuizWithConfig() {
    // Create API endpoint url with query parameters
    const queryParams = new URLSearchParams({
        examId: currentExamId,
        includeNew: currentConfig.includeNew,
        includeAnswered: currentConfig.includeAnswered,
        includeFlagged: currentConfig.includeFlagged,
        includeIncorrect: currentConfig.includeIncorrect,
        count: currentConfig.questionCount
    });
    
    const apiUrl = `${API_URL}/questions/filtered?${queryParams}`;
    
    // Show loading indicator
    const configContainer = document.getElementById('quiz-config-container');
    if (configContainer) {
        configContainer.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading your custom quiz...</p>
            </div>
        `;
    }
    
    // Fetch filtered questions
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Failed to load questions');
                });
            }
            return response.json();
        })
        .then(data => {
            // Hide config container
            if (configContainer) {
                configContainer.remove();
            }
            
            // Check if we have any questions
            if (!data.questions || data.questions.length === 0) {
                throw new Error(data.message || 'No questions match your selected filters');
            }
            
            // Store the metadata for later use
            window.currentExamMetadata = data.metadata;
            
            // Start the quiz with the filtered questions
            startExamWithCustomQuestions(
                currentExamId, 
                data.questions, 
                currentConfig.showAnswerMode === 'afterEach'
            );
        })
        .catch(error => {
            console.error('Error fetching filtered questions:', error);
            
            // Show error in container
            if (configContainer) {
                configContainer.innerHTML = `
                    <div class="error-container">
                        <h2 class="error-title">Error Loading Questions</h2>
                        <p class="error-message">${error.message}</p>
                        <div class="button-container">
                            <button onclick="QuizConfig.closeConfigUI()" class="error-button">Go Back</button>
                        </div>
                    </div>
                `;
            }
        });
}

    /**
     * Close the configuration UI and return to the previous screen
     */
    function closeConfigUI() {
        // Remove the configuration UI
        const configContainer = document.getElementById('quiz-config-container');
        if (configContainer) {
            configContainer.remove();
        }
        
        // Show the start screen
        returnToStart();
    }
    
    /**
     * Show a notification to the user
     * @param {string} message - The notification message
     * @param {string} type - The notification type ('success', 'error', 'info')
     */
    function showNotification(message, type = 'info') {
        // Try to use the application's notification system if available
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            // Fallback to a simple alert
            alert(message);
        }
    }
    
    // Return public API
    return {
        init,
        closeConfigUI,
        getConfig: function() {
            return { ...currentConfig };
        }
    };
})();