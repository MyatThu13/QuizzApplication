/**
 * PocketPrep Quiz Application - Main JavaScript file
 * Complete implementation with all features
 */

// Global variables for the application
let API_URL; // Will be set in initialize()
let currentExamId = '';
let currentExamName = '';
let currentFileName = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let examTitles = []; // Store exam titles data
let examsContainer; // Reference to exams container
let currentExamMetadata = null; // Store current exam metadata

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
    // Check if basic HTML structure is correct
    const appContainer = document.querySelector('.app-container');
    
    if (!appContainer) {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h1 style="color: red;">Application Error</h1>
                <p>The application container was not found. Please check your HTML structure.</p>
                <button onclick="location.reload()">Refresh Page</button>
            </div>
        `;
        return;
    }
    
    // Check if start-screen exists, create it if it doesn't
    let startScreen = document.getElementById('start-screen');
    if (!startScreen) {
        console.warn('start-screen element not found, creating it...');
        startScreen = document.createElement('div');
        startScreen.id = 'start-screen';
        appContainer.appendChild(startScreen);
        
        // Create header if not present
        if (!document.querySelector('.app-header')) {
            const header = document.createElement('header');
            header.className = 'app-header';
            header.innerHTML = '<h1>PocketPrep<span class="highlight">Quiz</span></h1><p class="tagline">Test your knowledge, track your progress</p>';
            startScreen.appendChild(header);
        }
        
        // Create dashboard container if not present
        const dashboardContainer = document.createElement('div');
        dashboardContainer.className = 'dashboard-container';
        startScreen.appendChild(dashboardContainer);
        
        // Create exams container if not present
        const examsContainer = document.createElement('div');
        examsContainer.id = 'exams-container';
        examsContainer.className = 'exams-container';
        dashboardContainer.appendChild(examsContainer);
        
        // Create performance container if not present
        const performanceContainer = document.createElement('div');
        performanceContainer.className = 'performance-container';
        performanceContainer.innerHTML = `
            <h2>Your Performance</h2>
            <div id="recent-attempts" class="attempt-history">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading your progress...</p>
                </div>
            </div>
        `;
        dashboardContainer.appendChild(performanceContainer);
    }
    
    // Initialize the app
    initialize();
    
    // Load exams and attempts
    loadExams();
    loadRecentAttempts();
});

function initialize() {
    // Set the API URL
    API_URL = 'http://localhost:5000/api';
    console.log('API URL set to:', API_URL);
    
    // Check if the app-container exists
    const appContainer = document.querySelector('.app-container');
    if (!appContainer) {
        console.error('CRITICAL ERROR: app-container not found');
        document.body.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h1 style="color: red;">Application Error</h1>
                <p>Critical container elements not found. Please make sure the HTML structure is correct.</p>
                <button onclick="location.reload()">Refresh Page</button>
            </div>
        `;
        return;
    }
    
    // Get DOM elements or create them if needed
    ensureRequiredDomElements();
    
    // CRITICAL: Initialize examsContainer
    examsContainer = document.getElementById('exams-container');
    if (!examsContainer) {
        console.error('ERROR: exams-container element not found in DOM');
        // Try alternative selector
        examsContainer = document.querySelector('.exams-container');
        if (!examsContainer) {
            console.error('CRITICAL ERROR: Could not find exams container by class either');
            // Create error message on page
            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'red';
            errorDiv.style.padding = '20px';
            errorDiv.innerHTML = '<h2>Error: Missing Element</h2><p>The exams container element could not be found.</p>';
            document.body.prepend(errorDiv);
        } else {
            console.log('Found exams container by class');
        }
    } else {
        console.log('Found exams container by ID');
    }
    
    // Check if required elements exist and log any issues
    ['startScreen', 'questionContainer', 'feedbackContainer', 'resultsContainer', 'examsContainer'].forEach(element => {
        if (!window[element]) {
            console.error(`Element ${element} not found in DOM`);
        }
    });
}


/**
 * Frontend Debugging Fix for loadExams Function
 * 
 * This updated function includes detailed debugging and better handles the API response format
 */
function loadExams() {
    try {
        // Show loading indicator
        examsContainer.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading available exams...</p>
            </div>
        `;
        
        console.log('Starting to fetch exam titles from API...');
        
        // Add this debugging code to check your API URL
        const titlesUrl = `${API_URL}/questions/titles`;
        console.log('Fetching from:', titlesUrl);
        
        // Use fetch with explicit debugging
        fetch(titlesUrl)
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                // Log the complete response structure
                console.log('API Response data:', data);
                
                // Check if response has the expected structure
                if (!data || typeof data !== 'object') {
                    throw new Error('API response is not a valid object');
                }
                
                // Examine what's in the response
                if (data.titles) {
                    console.log('Found titles array in response:', data.titles.length);
                    examTitles = data.titles;
                } else {
                    // If data doesn't have a titles property, check if it might be the titles array directly
                    console.log('No titles property found, checking if response is the titles array');
                    if (Array.isArray(data)) {
                        console.log('Response is an array, using as titles:', data.length);
                        examTitles = data;
                    } else {
                        console.error('Unexpected API response format:', data);
                        throw new Error('API returned unexpected data format - missing titles array');
                    }
                }
                
                // Clear loading indicator
                examsContainer.innerHTML = '';
                
                if (examTitles.length === 0) {
                    console.log('No exam titles found');
                    examsContainer.innerHTML = `
                        <div class="no-exams">
                            <h2>No Exams Available</h2>
                            <p>No exam data found. Please run the import script to load exams.</p>
                        </div>
                    `;
                    return;
                }
                
                console.log('Building UI for exam titles...');
                
                // Create a section for each title
                examTitles.forEach(title => {
                    console.log(`Processing title: ${title._id || title.title}`);
                    
                    const titleSection = document.createElement('div');
                    titleSection.className = 'exam-title-section';
                    
                    // Create title header
                    const titleHeader = document.createElement('h2');
                    titleHeader.textContent = title._id || title.title; // Handle both formats
                    titleSection.appendChild(titleHeader);
                    
                    // Create exams container for this title
                    const titleExamsContainer = document.createElement('div');
                    titleExamsContainer.className = 'title-exams-container';
                    
                    // Check if title has exams array
                    const exams = title.exams || [];
                    if (exams.length === 0) {
                        console.warn(`No exams found for title ${title._id || title.title}`);
                        const noExamsMsg = document.createElement('p');
                        noExamsMsg.className = 'no-exams-message';
                        noExamsMsg.textContent = `No exams available for ${title._id || title.title}`;
                        titleExamsContainer.appendChild(noExamsMsg);
                    } else {
                        console.log(`Title ${title._id || title.title} has ${exams.length} exams`);
                        
                        // Add each exam for this title
                        exams.forEach(exam => {
                            // Skip flagged for now, we'll add it at the end
                            if (exam.isFlagged) return;
                            
                            console.log(`Adding button for exam: ${exam.examId}`);
                            
                            const examButton = document.createElement('button');
                            examButton.className = 'mock-exam-btn';
                            examButton.setAttribute('data-exam-id', exam.examId);
                            
                            // Determine icon text
                            let iconText;
                            if (exam.type.includes('Mock') || exam.type.includes('Exam')) {
                                // If it's a numbered exam, extract the number
                                const examNumber = exam.examId.split('_')[1] || '';
                                iconText = examNumber.padStart(2, '0');
                            } else if (exam.type.includes('All')) {
                                iconText = 'ALL';
                            } else {
                                // Use first letter of each word in type
                                iconText = exam.type.split(' ')
                                    .map(word => word[0])
                                    .join('')
                                    .toUpperCase();
                            }
                            
                            examButton.innerHTML = `
                                <div class="exam-icon">${iconText}</div>
                                <div class="exam-info">
                                    <span class="exam-title">${exam.type}</span>
                                    <span class="exam-subtitle">${exam.vendor} ${exam.year}</span>
                                </div>
                            `;
                            
                            // Add event listener - FIXED: Add event listener when creating the button
                            examButton.addEventListener('click', () => {
                                console.log(`Exam button clicked for exam: ${exam.examId}`);
                                startExam(exam.examId);
                            });
                            
                            titleExamsContainer.appendChild(examButton);
                        });
                        
                        // Add flagged questions exam at the end
                        const flaggedExam = exams.find(exam => exam.isFlagged);
                        if (flaggedExam) {
                            console.log(`Adding flagged exam for ${title._id || title.title}`);
                            
                            const flaggedButton = document.createElement('button');
                            flaggedButton.className = 'mock-exam-btn flagged-exam-btn';
                            flaggedButton.setAttribute('data-exam-id', flaggedExam.examId);
                            
                            flaggedButton.innerHTML = `
                                <div class="exam-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                        <path d="M4 21V6M4 6C4 6 7 3 12 3C17 3 20 6 20 6V15C20 15 17 12 12 12C7 12 4 15 4 15V6Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <div class="exam-info">
                                    <span class="exam-title">Flagged Questions</span>
                                    <span class="exam-subtitle">Your saved items</span>
                                </div>
                            `;
                            
                            // Add event listener for flagged exam
                            flaggedButton.addEventListener('click', () => {
                                console.log(`Flagged exam button clicked for exam: ${flaggedExam.examId}`);
                                startExam(flaggedExam.examId);
                            });
                            
                            titleExamsContainer.appendChild(flaggedButton);
                        } else {
                            console.warn(`No flagged exam found for ${title._id || title.title}`);
                        }
                    }
                    
                    titleSection.appendChild(titleExamsContainer);
                    examsContainer.appendChild(titleSection);
                });
                
                console.log('Exam titles UI building completed successfully');
            })
            .catch(error => {
                console.error('Error in loadExams:', error);
                examsContainer.innerHTML = `
                    <div class="error-message">
                        <h2>Error Loading Exams</h2>
                        <p>${error.message || 'Failed to load available exams.'}</p>
                        <button onclick="location.reload()" class="error-button">Refresh Page</button>
                    </div>
                `;
            });
            
    } catch (error) {
        console.error('Exception in loadExams:', error);
        examsContainer.innerHTML = `
            <div class="error-message">
                <h2>Error Loading Exams</h2>
                <p>${error.message || 'An unexpected error occurred.'}</p>
                <button onclick="location.reload()" class="error-button">Refresh Page</button>
            </div>
        `;
    }
}

/**
 * Debug function to check database status
 */
async function checkDatabaseStatus() {
    try {
        examsContainer.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Checking database status...</p>
            </div>
        `;
        
        const response = await fetch(`${API_URL}/debug/titles`);
        
        if (!response.ok) {
            throw new Error(`API returned status: ${response.status}`);
        }
        
        const data = await response.json();
        
        let html = `
            <div class="debug-info">
                <h2>Database Status</h2>
                <p>Connection state: ${data.connectionState === 1 ? '✅ Connected' : '❌ Disconnected'}</p>
                <p>Metadata records: ${data.metadataCount}</p>
                <p>Unique titles: ${data.titles.length}</p>
                <h3>Available Titles:</h3>
                <ul>
        `;
        
        if (data.titles && data.titles.length > 0) {
            data.titles.forEach(title => {
                html += `<li>${title._id}: ${title.count} exams</li>`;
            });
        } else {
            html += `<li>No titles found in database</li>`;
        }
        
        html += `
                </ul>
                <div class="button-container">
                    <button onclick="loadExams()" class="error-button">Retry Loading Exams</button>
                </div>
            </div>
        `;
        
        examsContainer.innerHTML = html;
    } catch (error) {
        console.error('Database check error:', error);
        
        examsContainer.innerHTML = `
            <div class="error-message">
                <h2>Database Connection Error</h2>
                <p>${error.message || 'Failed to connect to database'}</p>
                <p>Please check server logs for more details.</p>
                <div class="button-container">
                    <button onclick="location.reload()" class="error-button">Refresh Page</button>
                </div>
            </div>
        `;
    }
}


/**
 * Check if required DOM elements exist and create them if necessary
 * @returns {boolean} - Whether the elements are ready for use
 */
function ensureRequiredDomElements() {
    // Check if startScreen exists
    startScreen = document.getElementById('start-screen');
    if (!startScreen) {
        console.error('Start screen element not found');
        return false;
    }
    
    // Check if questionContainer exists, create it if it doesn't
    questionContainer = document.getElementById('question-container');
    if (!questionContainer) {
        console.log('Question container not found, creating it...');
        questionContainer = document.createElement('div');
        questionContainer.id = 'question-container';
        questionContainer.style.display = 'none';
        document.querySelector('.app-container').appendChild(questionContainer);
    }
    
    // Check if feedbackContainer exists, create it if it doesn't
    feedbackContainer = document.getElementById('feedback-container');
    if (!feedbackContainer) {
        console.log('Feedback container not found, creating it...');
        feedbackContainer = document.createElement('div');
        feedbackContainer.id = 'feedback-container';
        feedbackContainer.style.display = 'none';
        document.querySelector('.app-container').appendChild(feedbackContainer);
        
        // Create the basic structure of the feedback container
        feedbackContainer.innerHTML = `
            <h2 id="feedback-header"></h2>
            <div id="explanation"></div>
            <button id="next-button">Next Question</button>
        `;
        
        // Update references to newly created elements
        feedbackHeaderEl = document.getElementById('feedback-header');
        explanationEl = document.getElementById('explanation');
        nextButtonEl = document.getElementById('next-button');
        
        // Add event listener for next button
        if (nextButtonEl) {
            nextButtonEl.addEventListener('click', showNextQuestion);
        }
    }
    
    // Check if resultsContainer exists, create it if it doesn't
    resultsContainer = document.getElementById('results-container');
    if (!resultsContainer) {
        console.log('Results container not found, creating it...');
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'results-container';
        resultsContainer.style.display = 'none';
        document.querySelector('.app-container').appendChild(resultsContainer);
        
        // Create the basic structure of the results container
        resultsContainer.innerHTML = `
            <h1>Exam Completed</h1>
            <h2>Your Results for <span id="completed-exam-name"></span></h2>
            <div class="result-highlight"><span id="percentage-correct">0</span>%</div>
            <div class="result-details">
                <div class="result-stat">
                    <span class="stat-label">Correct Answers</span>
                    <span id="correct-answers" class="stat-value">0</span>
                </div>
                <div class="result-stat">
                    <span class="stat-label">Total Questions</span>
                    <span id="total-answers" class="stat-value">0</span>
                </div>
            </div>
            <div class="attempts-history">
                <h2>Attempt History</h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Exam</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody id="history-body"></tbody>
                    </table>
                </div>
            </div>
            <button id="return-button">Return to Home</button>
        `;
        
        // Update references to newly created elements
        completedExamNameEl = document.getElementById('completed-exam-name');
        percentageCorrectEl = document.getElementById('percentage-correct');
        correctAnswersEl = document.getElementById('correct-answers');
        totalAnswersEl = document.getElementById('total-answers');
        historyBodyEl = document.getElementById('history-body');
        returnButtonEl = document.getElementById('return-button');
        
        // Add event listener for return button
        if (returnButtonEl) {
            returnButtonEl.addEventListener('click', returnToStart);
        }
    }
    
    return true;
}

/**
 * Start an exam
 * @param {string} examId - The ID of the exam
 */
async function startExam(examId) {
    try {
        console.log(`Starting exam with ID: ${examId}`);
        
        // Make sure required DOM elements exist
        if (!ensureRequiredDomElements()) {
            alert('Error: Required page elements not found. Please refresh the page and try again.');
            return;
        }
        
        // Show loading indicator
        startScreen.style.display = 'none';
        questionContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading questions...</p></div>';
        questionContainer.style.display = 'block';
        
        // Reset quiz state
        currentExamId = examId;
        currentQuestionIndex = 0;
        correctAnswers = 0;
        
        // Fetch questions from the server
        const response = await fetch(`${API_URL}/questions/${examId}`);
        
        if (!response.ok) {
            const statusCode = response.status;
            let errorMessage;
            
            // Handle specific status codes
            if (statusCode === 404) {
                errorMessage = `No questions available for this exam. Please run the import script to load questions.`;
            } else {
                errorMessage = `Failed to load questions: ${response.statusText || 'Server error'}`;
            }
            
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('Received data from API:', { 
            hasMetadata: !!data.metadata, 
            questionsCount: data.questions ? data.questions.length : 0 
        });
        
        // Check if we received any questions
        if (!data || !data.questions || data.questions.length === 0) {
            throw new Error(`No questions available for this exam. Please run the import script to load questions.`);
        }
        
        // Store metadata and questions
        currentExamMetadata = data.metadata;
        currentQuestions = shuffleArray(data.questions);
        
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
        
        // Make sure elements exist
        if (!questionTextEl || !choicesEl) {
            throw new Error('Critical question elements not found after container setup');
        }
        
        // Add event listener for the exit button
        const exitButton = document.getElementById('exit-exam-btn');
        if (exitButton) {
            exitButton.addEventListener('click', exitExam);
        }
        
        // Show the first question (with randomized choices)
        showQuestion();
    } catch (error) {
        console.error('Error starting exam:', error);
        
        // Use our error handler
        if (questionContainer) {
            questionContainer.innerHTML = `
                <div class="error-container">
                    <h1 class="error-code">Error</h1>
                    <h2 class="error-title">Error Loading Questions</h2>
                    <p class="error-message">${error.message || 'Failed to load questions. Please try again later.'}</p>
                    <div class="button-container">
                        <button onclick="returnToStart()" class="error-button">Return to Exam Selection</button>
                    </div>
                </div>
            `;
        } else {
            alert(`Error starting exam: ${error.message}`);
        }
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
    try {
        // Make sure we have the necessary elements
        if (!questionContainer || !choicesEl || !questionTextEl) {
            console.error('Missing critical DOM elements for showQuestion:', {
                questionContainer: !!questionContainer,
                choicesEl: !!choicesEl,
                questionTextEl: !!questionTextEl
            });
            return;
        }
        
        // Clear previous content
        questionContainer.style.display = 'block';
        if (feedbackContainer) {
            feedbackContainer.style.display = 'none';
        }
        choicesEl.innerHTML = '';
        
        // Make sure we have questions
        if (!currentQuestions || currentQuestions.length === 0) {
            console.error('No questions available for this exam');
            questionTextEl.innerHTML = '<p class="error-message">No questions available for this exam.</p>';
            return;
        }
        
        // Make sure current index is valid
        if (currentQuestionIndex < 0 || currentQuestionIndex >= currentQuestions.length) {
            console.error('Question index out of range:', currentQuestionIndex, 'max:', currentQuestions.length - 1);
            return;
        }
        
        // Get the current question
        const question = currentQuestions[currentQuestionIndex];
        if (!question) {
            console.error('Failed to get question at index:', currentQuestionIndex);
            return;
        }
        
        // Update question number
        if (currentQuestionEl) {
            currentQuestionEl.textContent = currentQuestionIndex + 1;
        }
        if (totalQuestionsEl) {
            totalQuestionsEl.textContent = currentQuestions.length;
        }
        
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
        
        // Check if question has choices
        if (!question.choices || question.choices.length === 0) {
            console.error('Question has no choices:', question);
            choicesEl.innerHTML = '<p class="error-message">Error: This question has no answer choices.</p>';
            return;
        }
        
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
    } catch (error) {
        console.error('Error showing question:', error);
        if (questionTextEl) {
            questionTextEl.innerHTML = `<p class="error-message">Error displaying question: ${error.message}</p>`;
        }
    }
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
    try {
        // Make sure we have questions and the current question
        if (!currentQuestions || currentQuestions.length === 0 || currentQuestionIndex >= currentQuestions.length) {
            console.error('No current question available');
            return;
        }
        
        // Get the current question
        const question = currentQuestions[currentQuestionIndex];
        
        // Check if the answer is correct
        const isCorrect = choiceId === question.correctAnswerId;
        
        if (isCorrect) {
            correctAnswers++;
        }
        
        // Make sure we have required elements
        if (!questionContainer || !feedbackContainer || !feedbackHeaderEl || !explanationEl) {
            console.error('Missing critical DOM elements for feedback:', {
                questionContainer: !!questionContainer,
                feedbackContainer: !!feedbackContainer,
                feedbackHeaderEl: !!feedbackHeaderEl,
                explanationEl: !!explanationEl
            });
            
            alert(`Your answer was ${isCorrect ? 'correct' : 'incorrect'}. Please try again.`);
            return;
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
            if (correctChoice) {
                feedbackHeaderEl.innerHTML = 'Incorrect! The correct answer is: ' + correctChoice.text;
            } else {
                feedbackHeaderEl.innerHTML = 'Incorrect!';
            }
        }
        
        // Show explanation
        explanationEl.innerHTML = question.explanation;
        
        // Update next button text
        const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
        
        if (nextButtonEl) {
            nextButtonEl.textContent = isLastQuestion ? 'Submit Results' : 'Next Question';
        }
    } catch (error) {
        console.error('Error selecting answer:', error);
        alert(`An error occurred while processing your answer: ${error.message}`);
    }
}

/**
 * Show the next question or results
 */
function showNextQuestion() {
    try {
        // Move to the next question
        currentQuestionIndex++;
        
        if (currentQuestionIndex < currentQuestions.length) {
            // Show the next question
            showQuestion();
        } else {
            // Show results
            showResults();
        }
    } catch (error) {
        console.error('Error showing next question:', error);
        alert(`An error occurred: ${error.message}`);
    }
}

/**
 * Exit the current exam without saving results
 * Using the custom modal dialog instead of confirm()
 */
function exitExam() {
    // Use our custom confirm dialog instead of the browser's default
    if (typeof ModalDialog !== 'undefined') {
        ModalDialog.confirm(
            'Exit Exam',
            'Are you sure you want to exit this exam? Your progress will not be saved.',
            'Exit',
            'Cancel',
            'danger'
        ).then(confirmed => {
            if (confirmed) {
                // Return to start screen
                returnToStart();
            }
        });
    } else {
        // Fall back to browser confirm if ModalDialog not available
        if (confirm('Are you sure you want to exit this exam? Your progress will not be saved.')) {
            returnToStart();
        }
    }
}

/**
 * Display the quiz results
 */
async function showResults() {
    try {
        // Make sure we have the required elements and data
        if (!resultsContainer || !currentExamMetadata || !currentQuestions || currentQuestions.length === 0) {
            console.error('Missing elements or data for showResults:', {
                resultsContainer: !!resultsContainer,
                currentExamMetadata: !!currentExamMetadata,
                currentQuestions: !!currentQuestions
            });
            
            alert('Error displaying results. Please return to the home screen.');
            returnToStart();
            return;
        }
        
        // Calculate percentage
        const percentage = Math.round((correctAnswers / currentQuestions.length) * 100);
        
        // Create attempt object
        const attempt = {
            examId: currentExamId,
            examName: currentExamMetadata.fullName,
            title: currentExamMetadata.title,
            type: currentExamMetadata.type,
            vendor: currentExamMetadata.vendor,
            year: currentExamMetadata.year,
            questionsCount: currentQuestions.length,
            correctAnswers: correctAnswers,
            percentage: percentage
        };
        
        console.log('Saving attempt:', attempt);
        
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
        
        // Check if result elements exist
// Check if result elements exist
        if (!completedExamNameEl || !percentageCorrectEl || !correctAnswersEl || !totalAnswersEl) {
            console.error('Missing DOM elements for results display:', {
                completedExamNameEl: !!completedExamNameEl,
                percentageCorrectEl: !!percentageCorrectEl,
                correctAnswersEl: !!correctAnswersEl,
                totalAnswersEl: !!totalAnswersEl
            });
            
            alert(`Your score: ${percentage}% (${correctAnswers}/${currentQuestions.length})`);
            returnToStart();
            return;
        }
        
        // Update results UI
        completedExamNameEl.textContent = currentExamMetadata.fullName;
        percentageCorrectEl.textContent = percentage;
        correctAnswersEl.textContent = correctAnswers;
        totalAnswersEl.textContent = currentQuestions.length;
        
        // Hide other containers and show results
        if (questionContainer) questionContainer.style.display = 'none';
        if (feedbackContainer) feedbackContainer.style.display = 'none';
        resultsContainer.style.display = 'block';
        
        // Display attempt history
        await displayAttemptHistory();
    } catch (error) {
        console.error('Error showing results:', error);
        showNotification('Error saving your results', 'error');
            
        // Try to show a simplified results view even if saving failed
        if (completedExamNameEl && percentageCorrectEl && correctAnswersEl && totalAnswersEl) {
            completedExamNameEl.textContent = currentExamMetadata ? currentExamMetadata.fullName : 'Completed Exam';
            percentageCorrectEl.textContent = Math.round((correctAnswers / currentQuestions.length) * 100);
            correctAnswersEl.textContent = correctAnswers;
            totalAnswersEl.textContent = currentQuestions.length;
            
            // Hide other containers and show results
            if (questionContainer) questionContainer.style.display = 'none';
            if (feedbackContainer) feedbackContainer.style.display = 'none';
            resultsContainer.style.display = 'block';
        }
        
        // Show error message in history table
        if (historyBodyEl) {
            historyBodyEl.innerHTML = `
                <tr>
                    <td colspan="3">Failed to save attempt. Results not stored.</td>
                </tr>
            `;
        }
    }
}

/**
 * Load and display recent attempts on the home page
 */
async function loadRecentAttempts() {
    try {
        const recentAttemptsContainer = document.getElementById('recent-attempts');
        if (!recentAttemptsContainer) {
            console.error('recent-attempts container not found');
            return;
        }
        
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
        
        if (!attempts || attempts.length === 0) {
            recentAttemptsContainer.innerHTML = `
                <div class="no-attempts">
                    <p>You haven't taken any exams yet.</p>
                    <p>Select an exam to start practicing!</p>
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
            
            const attemptCard = document.createElement('div');
            attemptCard.className = 'attempt-card';
            attemptCard.innerHTML = `
                <div class="attempt-info">
                    <div class="attempt-exam">${attempt.examName || attempt.title}</div>
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
 * Display the attempt history
 */
async function displayAttemptHistory() {
    try {
        // Check if history body element exists
        if (!historyBodyEl) {
            console.error('history-body element not found');
            return;
        }
        
        // Fetch attempt history from the server
        const response = await fetch(`${API_URL}/attempts`);
        
        if (!response.ok) {
            throw new Error('Failed to load attempt history');
        }
        
        const attempts = await response.json();
        
        // Clear history table
        historyBodyEl.innerHTML = '';
        
        if (!attempts || attempts.length === 0) {
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
            examCell.textContent = attempt.examName || attempt.title;
            
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
        if (historyBodyEl) {
            historyBodyEl.innerHTML = `
                <tr>
                    <td colspan="3">Failed to load attempt history.</td>
                </tr>
            `;
        }
    }
}

/**
 * Return to the start screen and refresh attempt history
 */
function returnToStart() {
    // Make sure elements exist
    if (!startScreen) {
        console.error('start-screen element not found');
        location.reload(); // Reload the page if element not found
        return;
    }
    
    // Show start screen and hide other containers
    startScreen.style.display = 'block';
    
    if (questionContainer) questionContainer.style.display = 'none';
    if (feedbackContainer) feedbackContainer.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'none';
    
    // Load recent attempts to refresh the display
    loadRecentAttempts();
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success/error/info)
 */
function showNotification(message, type = 'success') {
    try {
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
    } catch (error) {
        console.error('Error showing notification:', error);
        // Fall back to alert for critical notifications
        if (type === 'error') {
            alert(message);
        }
    }
}

/**
 * Add debugging tools in development mode
 */
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Debug application state
    window.debugAppState = function() {
        console.log('==== App State ====');
        console.log('DOM Elements:');
        console.log('- startScreen:', !!startScreen);
        console.log('- questionContainer:', !!questionContainer);
        console.log('- feedbackContainer:', !!feedbackContainer);
        console.log('- examsContainer:', !!examsContainer);
        console.log('- questionTextEl:', !!questionTextEl);
        console.log('- choicesEl:', !!choicesEl);
        
        console.log('App State:');
        console.log('- API_URL:', API_URL);
        console.log('- currentExamId:', currentExamId);
        console.log('- currentExamMetadata:', currentExamMetadata);
        console.log('- currentQuestions:', currentQuestions ? `${currentQuestions.length} questions` : 'None loaded');
        console.log('- currentQuestionIndex:', currentQuestionIndex);
        console.log('- correctAnswers:', correctAnswers);
    };
    
    // Debug database connectivity
    window.testDatabaseConnection = function() {
        fetch(`${API_URL}/debug/titles`)
            .then(response => response.json())
            .then(data => console.log('Database connection test:', data))
            .catch(error => console.error('Database connection error:', error));
    };
    
    // Add debugging button
    document.addEventListener('DOMContentLoaded', () => {
        const debugButton = document.createElement('button');
        debugButton.textContent = 'Debug';
        debugButton.style.position = 'fixed';
        debugButton.style.bottom = '10px';
        debugButton.style.right = '10px';
        debugButton.style.zIndex = '9999';
        debugButton.style.backgroundColor = '#f72585';
        debugButton.style.color = 'white';
        debugButton.style.padding = '8px 12px';
        debugButton.style.border = 'none';
        debugButton.style.borderRadius = '4px';
        debugButton.style.cursor = 'pointer';
        debugButton.addEventListener('click', () => {
            window.debugAppState();
            window.testDatabaseConnection();
        });
        document.body.appendChild(debugButton);
    });
}