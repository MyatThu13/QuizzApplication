/**
 * PocketPrep Quiz Application - Main JavaScript file
 * Complete implementation with all features
 */

// Global variables for the application
let API_URL; // Will be set in initialize()
let currentExamNumber = 0;
let currentExamName = '';
let currentFileName = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;

// DOM element references
let startScreen;
let questionContainer;
let feedbackContainer;
let resultsContainer;
let currentQuestionEl;
let totalQuestionsEl;
let questionTextEl;
let choicesEl;
let feedbackHeaderEl;
let explanationEl;
let nextButtonEl;
let completedExamNameEl;
let percentageCorrectEl;
let correctAnswersEl;
let totalAnswersEl;
let historyBodyEl;
let returnButtonEl;

// Main entry point - when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initialize();
    
    // Load recent attempts on the home page
    loadRecentAttempts();
});

/**
 * Initialize the application
 * Set up event listeners and references
 */
function initialize() {
    // Set the API URL
    API_URL = 'http://localhost:5000/api';
    
    // Get DOM elements
    startScreen = document.getElementById('start-screen');
    questionContainer = document.getElementById('question-container');
    feedbackContainer = document.getElementById('feedback-container');
    resultsContainer = document.getElementById('results-container');
    
    currentQuestionEl = document.getElementById('current-question');
    totalQuestionsEl = document.getElementById('total-questions');
    questionTextEl = document.getElementById('question-text');
    choicesEl = document.getElementById('choices');
    
    feedbackHeaderEl = document.getElementById('feedback-header');
    explanationEl = document.getElementById('explanation');
    nextButtonEl = document.getElementById('next-button');
    
    completedExamNameEl = document.getElementById('completed-exam-name');
    percentageCorrectEl = document.getElementById('percentage-correct');
    correctAnswersEl = document.getElementById('correct-answers');
    totalAnswersEl = document.getElementById('total-answers');
    historyBodyEl = document.getElementById('history-body');
    returnButtonEl = document.getElementById('return-button');
    
    // Initialize exam type selector
    initExamTypeSelector();
    
    // Add event listeners for mock exam buttons
    document.querySelectorAll('.mock-exam-btn').forEach(button => {
        button.addEventListener('click', () => {
            const examId = parseInt(button.getAttribute('data-exam-id'));
            const fileName = button.getAttribute('data-file-name');
            const examName = button.querySelector('.exam-title').textContent;
            startExam(examId, fileName, examName);
        });
    });
    
    // Add event listener for the next button
    if (nextButtonEl) {
        nextButtonEl.addEventListener('click', showNextQuestion);
    }
    
    // Add event listener for the return button
    if (returnButtonEl) {
        returnButtonEl.addEventListener('click', returnToStart);
    }
}

/**
 * Initialize Exam Type Selector
 */
function initExamTypeSelector() {
    const currentExamType = document.querySelector('.current-exam-type');
    const examTypeDropdown = document.getElementById('exam-type-dropdown');
    const examTypeOptions = document.querySelectorAll('.exam-type-option');
    const addExamTypeBtn = document.getElementById('add-exam-type-btn');
    
    if (!currentExamType || !examTypeDropdown) return;
    
    // Toggle dropdown when clicking the current exam type
    currentExamType.addEventListener('click', function() {
        examTypeDropdown.classList.toggle('hidden');
        setTimeout(() => {
            examTypeDropdown.classList.toggle('show');
        }, 10);
    });
    
    // Handle exam type selection
    examTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Get selected exam type data
            const examType = this.getAttribute('data-exam-type');
            const examTitle = this.querySelector('h3').textContent;
            const examDescription = this.querySelector('p').textContent;
            const examIconSrc = this.querySelector('img').src;
            
            // Update current exam type display
            document.querySelector('.exam-type-info h2').textContent = examTitle;
            document.querySelector('.exam-type-info p').textContent = examDescription;
            document.querySelector('.exam-icon-large img').src = examIconSrc;
            
            // Update selected state
            examTypeOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            // Save selected exam type to local storage
            localStorage.setItem('selectedExamType', examType);
            
            // Hide dropdown
            examTypeDropdown.classList.remove('show');
            setTimeout(() => {
                examTypeDropdown.classList.add('hidden');
            }, 300);
            
            // Optional: Load exam-specific data or update UI based on exam type
            // loadExamTypeData(examType);
        });
    });
    
    // Handle "Add New Exam Type" button
    if (addExamTypeBtn) {
        addExamTypeBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering the dropdown toggle
            
            // This would typically open a modal or form to add a new exam type
            // For now, just show a notification
            showNotification('Add New Exam Type feature coming soon!', 'info');
            
            // Hide dropdown
            examTypeDropdown.classList.remove('show');
            setTimeout(() => {
                examTypeDropdown.classList.add('hidden');
            }, 300);
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (currentExamType && examTypeDropdown && 
            !currentExamType.contains(e.target) && 
            !examTypeDropdown.contains(e.target)) {
            examTypeDropdown.classList.remove('show');
            setTimeout(() => {
                examTypeDropdown.classList.add('hidden');
            }, 300);
        }
    });
    
    // Load previously selected exam type from local storage (if any)
    const savedExamType = localStorage.getItem('selectedExamType');
    if (savedExamType) {
        const savedOption = document.querySelector(`.exam-type-option[data-exam-type="${savedExamType}"]`);
        if (savedOption) {
            // Simulate a click on the saved option
            savedOption.click();
        }
    }
}

/**
 * Load and display recent attempts on the home page
 */
async function loadRecentAttempts() {
    try {
        const recentAttemptsContainer = document.getElementById('recent-attempts');
        if (!recentAttemptsContainer) return;
        
        // Show loading spinner
        recentAttemptsContainer.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading your progress...</p>
            </div>
        `;
        
        // Fetch attempt history from the server
        const response = await fetch(`${API_URL}/attempts`);
        
        if (!response.ok) {
            throw new Error('Failed to load attempt history');
        }
        
        const attempts = await response.json();
        
        // Clear loading spinner
        recentAttemptsContainer.innerHTML = '';
        
        if (attempts.length === 0) {
            recentAttemptsContainer.innerHTML = `
                <div class="no-attempts">
                    <p>You haven't taken any exams yet.</p>
                    <p>Select a mock exam to start practicing!</p>
                </div>
            `;
            return;
        }
        
        // Sort attempts by date (newest first)
        const recentAttempts = attempts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Add each attempt as a card
        recentAttempts.forEach(attempt => {
            const date = new Date(attempt.date);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Determine color based on score
            let scoreColor = 'var(--primary-color)';
            if (attempt.percentage < 60) {
                scoreColor = 'var(--danger-color)';
            } else if (attempt.percentage < 80) {
                scoreColor = 'var(--warning-color)';
            } else {
                scoreColor = 'var(--success-color)';
            }
            
            // Get the proper exam name
            const examName = attempt.examName || getExamNameByNumber(attempt.examNumber);
            
            const attemptCard = document.createElement('div');
            attemptCard.className = 'attempt-card';
            attemptCard.innerHTML = `
                <div class="attempt-info">
                    <div class="attempt-exam">${examName}</div>
                    <div class="attempt-date">${formattedDate}</div>
                </div>
                <div class="attempt-score" style="color: ${scoreColor}">${attempt.percentage}%</div>
            `;
            
            recentAttemptsContainer.appendChild(attemptCard);
        });
        
    } catch (error) {
        console.error('Error loading recent attempts:', error);
        
        const recentAttemptsContainer = document.getElementById('recent-attempts');
        if (recentAttemptsContainer) {
            recentAttemptsContainer.innerHTML = `
                <div class="error-message">
                    <p>Failed to load your recent attempts.</p>
                    <p>Please refresh the page or try again later.</p>
                </div>
            `;
        }
    }
}

/**
 * Get proper exam name based on exam number
 * @param {number} examNumber - The exam number
 * @returns {string} - The proper exam name
 */
function getExamNameByNumber(examNumber) {
    switch (examNumber) {
        case 1:
            return "Mock Exam 1";
        case 2:
            return "Mock Exam 2";
        case 3:
            return "Mock Exam 3";
        case 4:
            return "All Questions";
        case 5:
            return "Flagged Questions";
        default:
            return `PocketPrep Exam ${examNumber}`;
    }
}

/**
 * Start a new exam with randomized questions and choices
 * @param {number} examId - The ID of the exam to start
 * @param {string} fileName - The name of the JSON file for this exam
 * @param {string} examName - The display name of the exam
 */
async function startExam(examId, fileName, examName) {
    try {
        // Show loading indicator
        startScreen.style.display = 'none';
        questionContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading questions...</p></div>';
        questionContainer.style.display = 'block';
        
        // Reset quiz state
        currentExamNumber = examId;
        currentFileName = fileName;
        currentExamName = examName;
        currentQuestionIndex = 0;
        correctAnswers = 0;
        
        // Fetch questions from the server
        const response = await fetch(`${API_URL}/questions/${examId}`);
        if (!response.ok) {
            throw new Error(`Failed to load questions: ${response.status}`);
        }
        
        let questions = await response.json();
        
        // Check if we received any questions
        if (!questions || questions.length === 0) {
            throw new Error(`No questions available for ${examName}. Please run the import script to load questions.`);
        }
        
        // Randomize question order 
        currentQuestions = shuffleArray(questions);
        
        // Restore question container structure
        questionContainer.innerHTML = `
            <div class="exam-header">
                <div class="progress">
                    Question <span id="current-question">1</span> of <span id="total-questions">${currentQuestions.length}</span>
                </div>
                <button id="exit-exam-btn" class="exit-button">Exit Exam</button>
            </div>
            <div id="question-text"></div>
            <div id="choices"></div>
        `;
        
        // Update element references after recreating DOM elements
        currentQuestionEl = document.getElementById('current-question');
        totalQuestionsEl = document.getElementById('total-questions');
        questionTextEl = document.getElementById('question-text');
        choicesEl = document.getElementById('choices');
        
        // Add event listener for the exit button
        const exitButton = document.getElementById('exit-exam-btn');
        if (exitButton) {
            exitButton.addEventListener('click', exitExam);
        }
        
        // Show the first question (with randomized choices)
        showQuestion();
    } catch (error) {
        console.error('Error starting exam:', error);
        questionContainer.innerHTML = `
            <div class="error">
                <h2>Error Loading Questions</h2>
                <p>${error.message}</p>
                <button onclick="location.reload()">Return to Exam Selection</button>
            </div>
        `;
    }
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} - The shuffled array
 */
function shuffleArray(array) {
    const newArray = [...array]; // Create a copy to avoid modifying the original
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Swap elements
    }
    return newArray;
}

/**
 * Display the current question with randomized answer choices
 */
function showQuestion() {
    // Clear previous content
    questionContainer.style.display = 'block';
    feedbackContainer.style.display = 'none';
    choicesEl.innerHTML = '';
    
    // Get the current question
    const question = currentQuestions[currentQuestionIndex];
    
    // Update question number
    currentQuestionEl.textContent = currentQuestionIndex + 1;
    totalQuestionsEl.textContent = currentQuestions.length;
    
    // Set question text with flag button
    const flaggedClass = question.flagged ? 'flagged' : 'unflagged';
    const flagTooltip = question.flagged ? 'Unflag this question' : 'Flag this question for review';
    
    // Create question header with flag button
    const questionHeader = document.createElement('div');
    questionHeader.className = 'question-header';
    
    const questionContent = document.createElement('div');
    questionContent.className = 'question-content';
    questionContent.innerHTML = question.question;
    
    const flagButton = document.createElement('div');
    flagButton.className = `tooltip flag-button ${flaggedClass}`;
    flagButton.innerHTML = `
        <span class="tooltiptext">${flagTooltip}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path d="M4 21V6M4 6C4 6 7 3 12 3C17 3 20 6 20 6V15C20 15 17 12 12 12C7 12 4 15 4 15V6Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    
    // Add event listener to flag button
    flagButton.addEventListener('click', () => toggleFlag(question));
    
    // Assemble the question header
    questionHeader.appendChild(questionContent);
    questionHeader.appendChild(flagButton);
    
    // Clear and update question text element
    questionTextEl.innerHTML = '';
    questionTextEl.appendChild(questionHeader);
    
    // Randomize the order of choices
    const randomizedChoices = shuffleArray([...question.choices]);
    
    // Add choices in the randomized order
    randomizedChoices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.innerHTML = choice.text;
        button.dataset.choiceId = choice.id;
        button.addEventListener('click', () => selectAnswer(choice.id));
        choicesEl.appendChild(button);
    });
}

/**
 * Toggle the flag status of a question
 * @param {Object} question - The question to toggle flag status
 */
async function toggleFlag(question) {
    try {
        // Use query parameters for flag/unflag
        const endpoint = question.flagged ? 
            `${API_URL}/questions/unflag?id=${question._id}` : 
            `${API_URL}/questions/flag?id=${question._id}`;
        
        console.log('Calling flag endpoint:', endpoint);
        
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error(`Failed to ${question.flagged ? 'unflag' : 'flag'} question`);
        }
        
        const result = await response.json();
        console.log('Server response:', result);
        
        // Update the question in our current questions array
        question.flagged = !question.flagged;
        
        // Update the flag button display
        const flagButton = document.querySelector('.flag-button');
        if (flagButton) {
            if (question.flagged) {
                flagButton.classList.remove('unflagged');
                flagButton.classList.add('flagged');
                flagButton.querySelector('.tooltiptext').textContent = 'Unflag this question';
            } else {
                flagButton.classList.remove('flagged');
                flagButton.classList.add('unflagged');
                flagButton.querySelector('.tooltiptext').textContent = 'Flag this question for review';
            }
        }
        
        // Show a brief notification
        showNotification(question.flagged ? 'Question flagged for review' : 'Question unflagged');
        
    } catch (error) {
        console.error('Error toggling flag:', error);
        showNotification('Error updating flag status', 'error');
    }
}

/**
 * Handle a selected answer
 * @param {string} choiceId - The ID of the selected choice
 */
function selectAnswer(choiceId) {
    // Get the current question
    const question = currentQuestions[currentQuestionIndex];
    
    // Check if the answer is correct
    const isCorrect = choiceId === question.correctAnswerId;
    
    if (isCorrect) {
        correctAnswers++;
    }
    
    // Hide question container and show feedback
    questionContainer.style.display = 'none';
    feedbackContainer.style.display = 'block';
    
    // Style the feedback container based on correctness
    feedbackContainer.className = isCorrect ? 'correct' : 'incorrect';
    
    // Set feedback header
    if (isCorrect) {
        feedbackHeaderEl.textContent = 'Correct!';
    } else {
        // Find the correct answer text
        const correctChoice = question.choices.find(choice => choice.id === question.correctAnswerId);
        feedbackHeaderEl.innerHTML = 'Incorrect! The correct answer is: ' + correctChoice.text;
    }
    
    // Show explanation
    explanationEl.innerHTML = question.explanation;
    
    // Update next button text
    const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
    nextButtonEl.textContent = isLastQuestion ? 'Submit Results' : 'Next Question';
}

/**
 * Show the next question or results
 */
function showNextQuestion() {
    // Move to the next question
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuestions.length) {
        // Show the next question
        showQuestion();
    } else {
        // Show results
        showResults();
    }
}

/**
 * Exit the current exam without saving results
 */
function exitExam() {
    if (confirm('Are you sure you want to exit this exam? Your progress will not be saved.')) {
        // Return to start screen
        returnToStart();
    }
}

/**
 * Display the quiz results
 */
async function showResults() {
    try {
        // Calculate percentage
        const percentage = Math.round((correctAnswers / currentQuestions.length) * 100);
        
        // Get the proper exam name
        const examName = getExamNameByNumber(currentExamNumber);
        
        // Create attempt object
        const attempt = {
            examNumber: currentExamNumber,
            examName: examName,
            fileName: currentFileName,
            questionsCount: currentQuestions.length,
            correctAnswers: correctAnswers,
            percentage: percentage
        };
        
        // Save attempt to the server
        const response = await fetch(`${API_URL}/attempts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attempt)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save attempt');
        }
        
        // Update results UI
        completedExamNameEl.textContent = examName;
        percentageCorrectEl.textContent = percentage;
        correctAnswersEl.textContent = correctAnswers;
        totalAnswersEl.textContent = currentQuestions.length;
        
        // Hide other containers and show results
        questionContainer.style.display = 'none';
        feedbackContainer.style.display = 'none';
        resultsContainer.style.display = 'block';
        
        // Display attempt history
        await displayAttemptHistory();
    } catch (error) {
        console.error('Error showing results:', error);
        alert('An error occurred while saving your results. Your score was: ' + 
            Math.round((correctAnswers / currentQuestions.length) * 100) + '%');
            
        // Show a simplified results view even if saving failed
        completedExamNameEl.textContent = getExamNameByNumber(currentExamNumber);
        percentageCorrectEl.textContent = Math.round((correctAnswers / currentQuestions.length) * 100);
        correctAnswersEl.textContent = correctAnswers;
        totalAnswersEl.textContent = currentQuestions.length;
        
        // Hide other containers and show results
        questionContainer.style.display = 'none';
        feedbackContainer.style.display = 'none';
        resultsContainer.style.display = 'block';
        
        // Show error message in history table
        historyBodyEl.innerHTML = `
            <tr>
                <td colspan="3">Failed to save attempt. Results not stored.</td>
            </tr>
        `;
    }
}

/**
 * Display the attempt history
 */
async function displayAttemptHistory() {
    try {
        // Fetch attempt history from the server
        const response = await fetch(`${API_URL}/attempts`);
        
        if (!response.ok) {
            throw new Error('Failed to load attempt history');
        }
        
        const attempts = await response.json();
        
        // Clear history table
        historyBodyEl.innerHTML = '';
        
        if (attempts.length === 0) {
            historyBodyEl.innerHTML = `
                <tr>
                    <td colspan="3">No previous attempts found.</td>
                </tr>
            `;
            return;
        }
        
        // Sort attempts by date (newest first)
        const sortedAttempts = attempts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Add each attempt to the table
        sortedAttempts.forEach(attempt => {
            const row = document.createElement('tr');
            
            const dateCell = document.createElement('td');
            const date = new Date(attempt.date);
            dateCell.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            const examCell = document.createElement('td');
            // Use the getExamNameByNumber function to get the correct exam name
            examCell.textContent = attempt.examName || getExamNameByNumber(attempt.examNumber);
            
            const scoreCell = document.createElement('td');
            scoreCell.textContent = `${attempt.percentage}%`;
            
            // Add color based on score
            if (attempt.percentage < 60) {
                scoreCell.style.color = 'var(--danger-color)';
            } else if (attempt.percentage < 80) {
                scoreCell.style.color = 'var(--warning-color)';
            } else {
                scoreCell.style.color = 'var(--success-color)';
            }
            
            row.appendChild(dateCell);
            row.appendChild(examCell);
            row.appendChild(scoreCell);
            
            historyBodyEl.appendChild(row);
        });
    } catch (error) {
        console.error('Error displaying attempt history:', error);
        
        // Display error message in the history table
        historyBodyEl.innerHTML = `
            <tr>
                <td colspan="3">Failed to load attempt history.</td>
            </tr>
        `;
    }
}

/**
 * Return to the start screen and refresh attempt history
 */
function returnToStart() {
    // Show start screen and hide other containers
    startScreen.style.display = 'block';
    questionContainer.style.display = 'none';
    feedbackContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    
    // Load recent attempts to refresh the display
    loadRecentAttempts();
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success/error/info)
 */
function showNotification(message, type = 'success') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        document.body.appendChild(notification);
        
        // Add styles if not already in CSS
        if (!document.getElementById('notification-style')) {
            const style = document.createElement('style');
            style.id = 'notification-style';
            style.textContent = `
                #notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 10px 20px;
                    border-radius: 4px;
                    color: white;
                    font-weight: 500;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: 1000;
                }
                #notification.success {
                    background-color: #2ecc71;
                }
                #notification.error {
                    background-color: #e74c3c;
                }
                #notification.info {
                    background-color: #3498db;
                }
                #notification.show {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Set message and type
    notification.textContent = message;
    notification.className = type;
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}