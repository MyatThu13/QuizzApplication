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
 * Updated loadExams function to properly display Missed Questions buttons
 * This function loads exam titles from the API and creates buttons for regular, "All Questions", 
 * "Flagged Questions", and "Missed Questions" exams
 */

/**
 * Modified loadExams function that applies consistent styling directly
 * This ensures all buttons have the exact same appearance
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
        
        const titlesUrl = `${API_URL}/questions/titles`;
        console.log('Fetching from:', titlesUrl);
        
        // Define the consistent colors
        const FLAGGED_COLOR = '#f8961e'; // Orange
        const MISSED_COLOR = '#f94144';  // Red
        
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
                console.log('API Response data:', data);
                
                // Check if response has the expected structure
                if (!data || typeof data !== 'object') {
                    throw new Error('API response is not a valid object');
                }
                
                // Determine where the titles array is in the response
                if (data.titles) {
                    console.log('Found titles array in response:', data.titles.length);
                    examTitles = data.titles;
                } else if (Array.isArray(data)) {
                    console.log('Response is an array, using as titles:', data.length);
                    examTitles = data;
                } else {
                    console.error('Unexpected API response format:', data);
                    throw new Error('API returned unexpected data format - missing titles array');
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
                        
                        // Filter out special exams first
                        const regularExams = exams.filter(exam => 
                            !exam.isFlagged && 
                            !exam.isMissed && 
                            !exam.type.includes('All') && 
                            !exam.type.includes('Flagged') &&
                            !exam.type.includes('Missed')
                        );
                        
                        // Add each regular exam with a reset counter starting at 1
                        regularExams.forEach((exam, index) => {
                            console.log(`Adding button for exam: ${exam.examId} with index ${index + 1}`);
                            
                            const examButton = document.createElement('button');
                            examButton.className = 'mock-exam-btn';
                            examButton.setAttribute('data-exam-id', exam.examId);
                            
                            // Use index + 1 (starting from 1) for each title group
                            const examNumber = index + 1;
                            let iconText = examNumber.toString().padStart(2, '0');
                            
                            examButton.innerHTML = `
                                <div class="exam-icon">${iconText}</div>
                                <div class="exam-info">
                                    <span class="exam-title">${exam.type}</span>
                                    <span class="exam-subtitle">${exam.vendor} ${exam.year}</span>
                                </div>
                            `;
                            
                            // Add event listener
                            examButton.addEventListener('click', () => {
                                console.log(`Exam button clicked for exam: ${exam.examId}`);
                                startExam(exam.examId);
                            });
                            
                            titleExamsContainer.appendChild(examButton);
                        });
                        
                        // Add "All Questions" exam if it exists
                        const allQuestionsExam = exams.find(exam => exam.type.includes('All'));
                        // if (allQuestionsExam) {
                        //     console.log(`Adding All Questions button for ${title._id || title.title}`);
                            
                        //     const allButton = document.createElement('button');
                        //     allButton.className = 'mock-exam-btn';
                        //     allButton.setAttribute('data-exam-id', allQuestionsExam.examId);
                            
                        //     allButton.innerHTML = `
                        //         <div class="exam-icon">ALL</div>
                        //         <div class="exam-info">
                        //             <span class="exam-title">${allQuestionsExam.type}</span>
                        //             <span class="exam-subtitle">${allQuestionsExam.vendor} ${allQuestionsExam.year}</span>
                        //         </div>
                        //     `;
                            
                        //     // Add event listener
                        //     allButton.addEventListener('click', () => {
                        //         console.log(`All Questions button clicked for exam: ${allQuestionsExam.examId}`);
                        //         startExam(allQuestionsExam.examId);
                        //     });
                            
                        //     titleExamsContainer.appendChild(allButton);
                        // }
                        // Replace the existing code for creating "All Questions" button with this:
                        if (allQuestionsExam) {
                            console.log(`Adding All Questions button for ${title._id || title.title}`);
                            
                            const allQuestionsButton = document.createElement('button');
                            allQuestionsButton.className = 'mock-exam-btn';
                            allQuestionsButton.setAttribute('data-exam-id', allQuestionsExam.examId);

                            allQuestionsButton.innerHTML = `
                                <div class="exam-icon">ALL</div>
                                <div class="exam-info">
                                    <span class="exam-title">${allQuestionsExam.type}</span>
                                    <span class="exam-subtitle">${allQuestionsExam.vendor} ${allQuestionsExam.year}</span>
                                </div>
                            `;
                            // Replace the standard event listener with our custom one
                            allQuestionsButton.addEventListener('click', () => {
                                console.log(`All Questions button clicked for exam: ${allQuestionsExam.examId}`);
                                handleAllQuestionsExamClick(allQuestionsExam.examId, allQuestionsExam.fullName);
                            });
                            
                            titleExamsContainer.appendChild(allQuestionsButton);
                        }
                                                
                        // Add flagged questions exam if it exists - WITH INLINE STYLES
                        const flaggedExam = exams.find(exam => exam.isFlagged);
                        if (flaggedExam) {
                            console.log(`Adding flagged exam for ${title._id || title.title}`);
                            
                            const flaggedButton = document.createElement('button');
                            flaggedButton.className = 'mock-exam-btn flagged-exam-btn';
                            flaggedButton.setAttribute('data-exam-id', flaggedExam.examId);
                            
                            // Apply direct styling
                            flaggedButton.style.borderColor = FLAGGED_COLOR;
                            flaggedButton.style.borderStyle = 'dashed';
                            flaggedButton.style.borderWidth = '1px';
                            
                            flaggedButton.innerHTML = `
                                <div class="exam-icon flag-icon" style="background-color: ${FLAGGED_COLOR};">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                        <path d="M4 21V6M4 6C4 6 7 3 12 3C17 3 20 6 20 6V15C20 15 17 12 12 12C7 12 4 15 4 15V6Z" 
                                            stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
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
                        }
                        
                        // Add missed questions exam if it exists - WITH INLINE STYLES
                        const missedExam = exams.find(exam => exam.isMissed);
                        if (missedExam) {
                            console.log(`Adding missed exam for ${title._id || title.title}`);
                            
                            const missedButton = document.createElement('button');
                            missedButton.className = 'mock-exam-btn missed-exam-btn';
                            missedButton.setAttribute('data-exam-id', missedExam.examId);
                            
                            // Apply direct styling
                            missedButton.style.borderColor = MISSED_COLOR;
                            missedButton.style.borderStyle = 'dashed';
                            missedButton.style.borderWidth = '1px';
                            
                            missedButton.innerHTML = `
                                <div class="exam-icon missed-icon" style="background-color: ${MISSED_COLOR};">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                        <path d="M6 18L18 6M6 6l12 12" 
                                            stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                                    </svg>
                                </div>
                                <div class="exam-info">
                                    <span class="exam-title">Missed Questions</span>
                                    <span class="exam-subtitle">Your incorrect answers</span>
                                </div>
                            `;
                            
                            // Add event listener
                            missedButton.addEventListener('click', () => {
                                console.log(`Missed exam button clicked for exam: ${missedExam.examId}`);
                                startExam(missedExam.examId);
                            });
                            
                            titleExamsContainer.appendChild(missedButton);
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
        // Show loading indicator
        startScreen.style.display = 'none';
        questionContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading questions...</p></div>';
        questionContainer.style.display = 'block';
        
        console.log(`Starting exam with ID: ${examId}`);
        
        // Reset quiz state
        currentExamId = examId;
        currentQuestionIndex = 0;
        correctAnswers = 0;
        
        // Fetch questions from the server
        const response = await fetch(`${API_URL}/questions/${examId}`);
        
        if (!response.ok) {
            // Handle server error response
            throw new Error(`Failed to load questions: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Fetched data:', data);
        
        // Check if we received any questions
        if (!data || !data.questions || data.questions.length === 0) {
            throw new Error(`No questions available for this exam.`);
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
        
        // Add event listener for the exit button
        const exitButton = document.getElementById('exit-exam-btn');
        if (exitButton) {
            exitButton.addEventListener('click', exitExam);
        }
        
        // Show the first question (with randomized choices)
        showQuestion();
    } catch (error) {
        console.error('Error starting exam:', error);
        
        // Use ErrorHandler if available
        if (typeof ErrorHandler !== 'undefined') {
            const examName = examId.includes('Flagged') ? 'Flagged Questions' : examId;
            ErrorHandler.handleQuestionsLoadingError(error, examName);
        } else {
            // Fallback error handling
            questionContainer.innerHTML = `
                <div class="error-container">
                    <h1 class="error-code">404</h1>
                    <h2 class="error-title">Error Loading Questions</h2>
                    <p class="error-message">${error.message || 'Failed to load questions. Please try again later.'}</p>
                    <div class="button-container">
                        <button onclick="returnToStart()" class="error-button">Return to Exam Selection</button>
                    </div>
                </div>
            `;
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
            console.error('Missing critical DOM elements for showQuestion');
            return;
        }
        
        // Clear previous content
        questionContainer.style.display = 'block';
        if (feedbackContainer) {
            feedbackContainer.style.display = 'none';
        }
        choicesEl.innerHTML = '';
        
        // Get the current question
        const question = currentQuestions[currentQuestionIndex];
        
        // Update question number
        if (currentQuestionEl) {
            currentQuestionEl.textContent = currentQuestionIndex + 1;
        }
        if (totalQuestionsEl) {
            totalQuestionsEl.textContent = currentQuestions.length;
        }
        
        // Count correct answers to determine if it's a multiple-choice question
        const correctAnswersCount = question.choices.filter(choice => choice.isCorrect).length;
        const isMultipleChoice = correctAnswersCount > 1;
        
        // Store the number of correct answers for this question
        question.correctAnswersCount = correctAnswersCount;
        
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
        
        // Initialize selected choices array
        question.selectedChoices = [];
        
        // Add choices in the randomized order
        randomizedChoices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.innerHTML = choice.text;
            button.dataset.choiceId = choice.id;
            
            // Handle click event based on question type
            if (isMultipleChoice) {
                button.addEventListener('click', () => {
                    // Toggle selection
                    if (button.classList.contains('selected')) {
                        button.classList.remove('selected');
                        // Remove the choice ID from selected choices
                        const index = question.selectedChoices.indexOf(choice.id);
                        if (index !== -1) {
                            question.selectedChoices.splice(index, 1);
                        }
                    } else {
                        button.classList.add('selected');
                        question.selectedChoices.push(choice.id);
                    }
                    
                    // Update submit button state
                    const submitButton = document.getElementById('submit-answers-btn');
                    if (submitButton) {
                        submitButton.disabled = question.selectedChoices.length === 0;
                    }
                });
            } else {
                // Single choice behavior
                button.addEventListener('click', () => selectAnswer(choice.id));
            }
            
            choicesEl.appendChild(button);
        });
        
        // For multiple-choice questions, add a submit button
        if (isMultipleChoice) {
            const submitContainer = document.createElement('div');
            submitContainer.className = 'submit-container';
            submitContainer.style.marginTop = '20px';
            submitContainer.style.textAlign = 'right';
            
            const submitButton = document.createElement('button');
            submitButton.id = 'submit-answers-btn';
            submitButton.className = 'submit-btn';
            submitButton.textContent = 'Submit Answers';
            submitButton.disabled = true; // Initially disabled
            
            // Apply button styling
            submitButton.style.backgroundColor = 'var(--primary-color)';
            submitButton.style.color = 'white';
            submitButton.style.border = 'none';
            submitButton.style.borderRadius = 'var(--border-radius-md)';
            submitButton.style.padding = 'var(--space-sm) var(--space-lg)';
            submitButton.style.fontWeight = '500';
            submitButton.style.cursor = 'pointer';
            submitButton.style.transition = 'all var(--transition-fast)';
            
            // Add hover styles
            submitButton.addEventListener('mouseover', function() {
                if (!this.disabled) {
                    this.style.backgroundColor = 'var(--primary-dark)';
                    this.style.transform = 'translateY(-2px)';
                }
            });
            
            submitButton.addEventListener('mouseout', function() {
                if (!this.disabled) {
                    this.style.backgroundColor = 'var(--primary-color)';
                    this.style.transform = 'translateY(0)';
                }
            });
            
            // Click handler for submit button
            submitButton.addEventListener('click', () => {
                if (question.selectedChoices.length > 0) {
                    selectMultipleAnswers(question.selectedChoices);
                }
            });
            
            submitContainer.appendChild(submitButton);
            choicesEl.appendChild(submitContainer);
        }
    } catch (error) {
        console.error('Error showing question:', error);
        if (questionTextEl) {
            questionTextEl.innerHTML = `<p class="error-message">Error displaying question: ${error.message}</p>`;
        }
    }
}


// Add this to client/js/app.js
// Replace or update the existing handleAllQuestionsExamClick function
function handleAllQuestionsExamClick(examId, examTitle) {
    console.log(`All Questions exam clicked: ${examId}`);
    
    // Find the exam metadata in the exam titles
    const examMetadata = findExamMetadata(examId);
    
    if (!examMetadata) {
        console.error(`Exam metadata not found for ${examId}`);
        startExam(examId); // Fallback to starting the exam directly
        return;
    }
    
    // Show the quiz configuration UI
    showQuizConfigUI(examId, examTitle || examMetadata.fullName || examId);
}

// Add this function to mark questions as answered
async function markQuestionAnswered(questionId) {
    try {
        // Call the API to mark the question as answered
        const response = await fetch(`${API_URL}/questions/markAnswered?id=${questionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to mark question as answered');
        }
        
        console.log('Question marked as answered');
    } catch (error) {
        console.error('Error marking question as answered:', error);
        // Don't show notification to user - this is a background operation
    }
}


// Add to client/js/app.js

/**
 * Start an exam with custom questions and settings
 * @param {string} examId - The ID of the exam
 * @param {Array} questions - The custom questions
 * @param {boolean} showAnswerAfterEach - Whether to show answers after each question
 */

function startExamWithCustomQuestions(examId, questions, showAnswerAfterEach = true) {
    try {
        // Show loading indicator
        startScreen.style.display = 'none';
        questionContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading custom quiz...</p></div>';
        questionContainer.style.display = 'block';
        
        console.log(`Starting custom exam with ${questions.length} questions`);
        
        // Reset quiz state
        currentExamId = examId;
        currentExamName = `Custom Quiz (${examId})`; // Set a default exam name
        currentQuestionIndex = 0;
        correctAnswers = 0;
        currentQuestions = questions;
        
        // Set the flag for showing answers
        window.showAnswersImmediately = showAnswerAfterEach;
        
        // Create basic metadata for the custom quiz if real metadata isn't available
        if (!currentExamMetadata) {
            // Parse the exam ID to get the base title
            const baseTitle = examId.split('_')[0] || 'Custom';
            
            // Create metadata
            currentExamMetadata = {
                examId: examId,
                title: baseTitle,
                type: 'Custom Quiz',
                vendor: 'PocketPrep',
                year: new Date().getFullYear(),
                fullName: `${baseTitle} Custom Quiz`,
                questionCount: questions.length
            };
        }
        
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
        
        // Show the first question
        showQuestion();
    } catch (error) {
        console.error('Error starting custom exam:', error);
        
        // Use ErrorHandler if available
        if (typeof ErrorHandler !== 'undefined') {
            ErrorHandler.handleApiError(error, 'Error starting custom quiz', questionContainer);
        } else {
            alert('Error starting quiz: ' + error.message);
            returnToStart();
        }
    }
}

// Add to client/js/app.js

/**
 * Load the quiz configuration CSS
 */
function loadQuizConfigCSS() {
    if (document.getElementById('quiz-config-css')) return;
    
    const cssLink = document.createElement('link');
    cssLink.id = 'quiz-config-css';
    cssLink.rel = 'stylesheet';
    cssLink.href = 'css/quizConfig.css';
    document.head.appendChild(cssLink);
}

/**
 * Show the quiz configuration UI
 * @param {string} examId - The ID of the exam
 * @param {string} examTitle - The title of the exam
 */
async function showQuizConfigUI(examId, examTitle) {
    try {
        // Load the CSS if not already loaded
        loadQuizConfigCSS();
        
        // Get available question counts
        const questionCounts = await QuizService.getAvailableQuestionCounts(examId);
        
        // Initialize the quiz configuration UI
        QuizConfig.init(examId, examTitle, questionCounts);
    } catch (error) {
        console.error('Error showing quiz config UI:', error);
        alert('An error occurred while loading quiz configuration. Starting the exam directly.');
        startExam(examId);
    }
}



/**
 * Find the exam metadata in the exam titles
 * @param {string} examId - The ID of the exam
 * @returns {Object|null} - The exam metadata or null if not found
 */
function findExamMetadata(examId) {
    if (!examTitles || examTitles.length === 0) {
        return null;
    }
    
    // Check if examTitles is an array of title objects
    if (Array.isArray(examTitles)) {
        for (const title of examTitles) {
            if (!title.exams || !Array.isArray(title.exams)) continue;
            
            const exam = title.exams.find(e => e.examId === examId);
            if (exam) {
                return exam;
            }
        }
    }
    
    return null;
}

/**
 * Handle multiple answer selection
 * @param {Array} selectedChoiceIds - IDs of the selected choices
 */
function selectMultipleAnswers(selectedChoiceIds) {
    try {
        // Get the current question
        const question = currentQuestions[currentQuestionIndex];
        
        // Get all correct choice IDs and texts
        const correctChoices = question.choices.filter(choice => choice.isCorrect);
        const correctChoiceIds = correctChoices.map(choice => choice.id);
        
        // Check if the selected answers match all correct answers
        const allCorrect = correctChoiceIds.length === selectedChoiceIds.length &&
            correctChoiceIds.every(id => selectedChoiceIds.includes(id));
        
        // Update score if all answers are correct
        if (allCorrect) {
            correctAnswers++;
            
            // If all answers are correct, remove from missed if it was missed before
            if (question.missed) {
                unmarkQuestionMissed(question._id);
            }
        } else {
            // If any answer is incorrect, mark as missed
            markQuestionMissed(question._id);
        }
        
        // Hide question container and show feedback
        questionContainer.style.display = 'none';
        feedbackContainer.style.display = 'block';
        
        // Style the feedback container based on correctness
        feedbackContainer.className = allCorrect ? 'correct' : 'incorrect';
        
        // Set feedback header with improved formatting for multiple correct answers
        if (allCorrect) {
            feedbackHeaderEl.textContent = 'Correct!';
        } else {
            // Format correct answers in a more elegant way
            const correctAnswersText = correctChoices.map(choice => choice.text).join(', ');
            
            // Create a stylized feedback for correct answers
            let correctAnswersHTML = `
                <div>Incorrect! The correct answer${correctChoiceIds.length > 1 ? 's are' : ' is'}:</div>
                <div class="correct-answers-list" style="margin-top: 10px;">
            `;
            
            // Add each correct answer with styling
            correctChoices.forEach(choice => {
                correctAnswersHTML += `
                    <div class="correct-answer-item" style="background-color: rgba(76, 201, 240, 0.1); border-left: 3px solid var(--success-color); padding: 8px 12px; margin-top: 5px; border-radius: 4px; font-weight: 500;">
                        ${choice.text}
                    </div>
                `;
            });
            
            correctAnswersHTML += '</div>';
            feedbackHeaderEl.innerHTML = correctAnswersHTML;
        }
        
        // Show explanation
        explanationEl.innerHTML = question.explanation;
        
        // Update next button text
        const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
        nextButtonEl.textContent = isLastQuestion ? 'Submit Results' : 'Next Question';
    } catch (error) {
        console.error('Error processing multiple answers:', error);
        showNotification('An error occurred while processing your answers', 'error');
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
 * Mark a question as missed
 * @param {string} questionId - The ID of the question to mark as missed
 */
async function markQuestionMissed(questionId) {
    try {
        // Use the correct endpoint format with query parameter
        const response = await fetch(`${API_URL}/questions/markMissed?id=${questionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(`Failed to mark question as missed: ${data.message || response.statusText}`);
        }
        
        console.log('Question marked as missed');
    } catch (error) {
        console.error('Error marking question as missed:', error);
    }
}

/**
 * Unmark a question as missed
 * @param {string} questionId - The ID of the question to unmark as missed
 */
async function unmarkQuestionMissed(questionId) {
    try {
        // Use the correct endpoint format with query parameter
        const response = await fetch(`${API_URL}/questions/unmarkMissed?id=${questionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(`Failed to unmark question as missed: ${data.message || response.statusText}`);
        }
        
        console.log('Question removed from missed');
    } catch (error) {
        console.error('Error unmarking question as missed:', error);
    }
}

/**
 * Handle a selected answer
 * @param {string} choiceId - The ID of the selected choice
 */
// function selectAnswer(choiceId) {
//     try {
//         // Get the current question
//         const question = currentQuestions[currentQuestionIndex];
        
//         // Check if the answer is correct
//         const isCorrect = choiceId === question.correctAnswerId;
        
//         // Update score counter
//         if (isCorrect) {
//             correctAnswers++;
            
//             // If the answer is correct, remove from missed if it was missed before
//             if (question.missed) {
//                 unmarkQuestionMissed(question._id);
//             }
//         } else {
//             // If the answer is incorrect, mark as missed
//             markQuestionMissed(question._id);
//         }
        
//         // Hide question container and show feedback
//         questionContainer.style.display = 'none';
//         feedbackContainer.style.display = 'block';
        
//         // Style the feedback container based on correctness
//         feedbackContainer.className = isCorrect ? 'correct' : 'incorrect';
        
//         // Set feedback header
//         if (isCorrect) {
//             feedbackHeaderEl.textContent = 'Correct!';
//         } else {
//             // Find the correct answer text
//             const correctChoice = question.choices.find(choice => choice.id === question.correctAnswerId);
//             feedbackHeaderEl.innerHTML = 'Incorrect! The correct answer is: ' + correctChoice.text;
//         }
        
//         // Show explanation
//         explanationEl.innerHTML = question.explanation;
        
//         // Update next button text
//         const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
//         nextButtonEl.textContent = isLastQuestion ? 'Submit Results' : 'Next Question';
//     } catch (error) {
//         console.error('Error selecting answer:', error);
//         showNotification('An error occurred while processing your answer', 'error');
//     }
// }


function selectAnswer(choiceId) {
    try {
        // Get the current question
        const question = currentQuestions[currentQuestionIndex];
        
        // Check if the answer is correct
        const isCorrect = choiceId === question.correctAnswerId;
        
        // Update score counter
        if (isCorrect) {
            correctAnswers++;
            
            // If the answer is correct, remove from missed if it was missed before
            if (question.missed) {
                unmarkQuestionMissed(question._id);
            }
        } else {
            // If the answer is incorrect, mark as missed
            markQuestionMissed(question._id);
        }
        
        // Mark the question as answered (regardless of correctness)
        markQuestionAnswered(question._id);
        
        // Check if we should show the answer immediately
        if (window.showAnswersImmediately) {
            // Show feedback immediately - this is your existing code
            questionContainer.style.display = 'none';
            feedbackContainer.style.display = 'block';
            
            feedbackContainer.className = isCorrect ? 'correct' : 'incorrect';
            
            if (isCorrect) {
                feedbackHeaderEl.textContent = 'Correct!';
            } else {
                const correctChoice = question.choices.find(choice => choice.id === question.correctAnswerId);
                feedbackHeaderEl.innerHTML = 'Incorrect! The correct answer is: ' + correctChoice.text;
            }
            
            explanationEl.innerHTML = question.explanation;
            
            const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
            nextButtonEl.textContent = isLastQuestion ? 'Submit Results' : 'Next Question';
        } else {
            // Move to the next question without showing feedback
            currentQuestionIndex++;
            
            if (currentQuestionIndex < currentQuestions.length) {
                // Show the next question
                showQuestion();
            } else {
                // Show results
                showResults();
            }
        }
    } catch (error) {
        console.error('Error selecting answer:', error);
        showNotification('An error occurred while processing your answer', 'error');
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
        // Calculate percentage
        const percentage = Math.round((correctAnswers / currentQuestions.length) * 100);
        
        // Get exam metadata if it's not already available
        if (!currentExamMetadata) {
            try {
                // Try to fetch metadata for the exam ID
                const response = await fetch(`${API_URL}/questions/metadata/${currentExamId}`);
                if (response.ok) {
                    currentExamMetadata = await response.json();
                } else {
                    // If we can't get metadata, create a fallback version
                    // This handles custom filtered quizzes
                    currentExamMetadata = {
                        examId: currentExamId,
                        fullName: `Custom Quiz (${currentExamId})`,
                        title: currentExamId.split('_')[0] || 'Custom',
                        type: 'Custom Quiz',
                        vendor: 'PocketPrep',
                        year: new Date().getFullYear()
                    };
                }
            } catch (error) {
                console.error('Error fetching exam metadata:', error);
                // Create default metadata as fallback
                currentExamMetadata = {
                    examId: currentExamId,
                    fullName: `Custom Quiz (${currentExamId})`,
                    title: currentExamId.split('_')[0] || 'Custom',
                    type: 'Custom Quiz',
                    vendor: 'PocketPrep',
                    year: new Date().getFullYear()
                };
            }
        }
        
        // Ensure we have the exam name
        const examName = currentExamName || currentExamMetadata.fullName || `Quiz (${currentExamId})`;
        
        // Create attempt object
        const attempt = {
            examId: currentExamId,
            examName: examName,
            title: currentExamMetadata.title || currentExamId.split('_')[0] || 'Custom',
            type: currentExamMetadata.type || 'Custom Quiz',
            vendor: currentExamMetadata.vendor || 'PocketPrep',
            year: currentExamMetadata.year || new Date().getFullYear(),
            questionsCount: currentQuestions.length,
            correctAnswers: correctAnswers,
            percentage: percentage
        };
        
        console.log('Saving attempt with data:', attempt);
        
        // Update results UI before saving
        if (completedExamNameEl) completedExamNameEl.textContent = examName;
        if (percentageCorrectEl) percentageCorrectEl.textContent = percentage;
        if (correctAnswersEl) correctAnswersEl.textContent = correctAnswers;
        if (totalAnswersEl) totalAnswersEl.textContent = currentQuestions.length;
        
        // Hide other containers and show results
        if (questionContainer) questionContainer.style.display = 'none';
        if (feedbackContainer) feedbackContainer.style.display = 'none';
        if (resultsContainer) resultsContainer.style.display = 'block';
        
        // Try to save attempt to server
        try {
            const response = await fetch(`${API_URL}/attempts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(attempt)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to save attempt: ${errorData.message || response.statusText}`);
            }
            
            await displayAttemptHistory();
        } catch (saveError) {
            console.error('Error saving attempt:', saveError);
            showNotification('Error saving your results, but your score has been calculated.', 'error');
            
            // Display error message in history table
            if (historyBodyEl) {
                historyBodyEl.innerHTML = `
                    <tr>
                        <td colspan="3">Failed to save attempt. Results not stored.</td>
                    </tr>
                `;
            }
        }
    } catch (error) {
        console.error('Error showing results:', error);
        
        // Show a simplified results view if something fails
        showNotification(`An error occurred while showing results: ${error.message}`, 'error');
        
        // Create a basic fallback results display
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <h1>Quiz Completed</h1>
                <p>Score: ${correctAnswers} out of ${currentQuestions.length}</p>
                <p>Percentage: ${Math.round((correctAnswers / currentQuestions.length) * 100)}%</p>
                <button id="return-btn" class="error-button">Return to Home</button>
            `;
            
            // Add event listener to the return button
            const returnBtn = document.getElementById('return-btn');
            if (returnBtn) {
                returnBtn.addEventListener('click', returnToStart);
            }
            
            resultsContainer.style.display = 'block';
        } else {
            // Last resort: alert and return to start
            alert(`Quiz completed with score: ${correctAnswers}/${currentQuestions.length}`);
            returnToStart();
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
                    <p>Select an exam to start practicing!</p>
                </div>
            `;
            return;
        }
        
        // Sort attempts by date (newest first)
        const recentAttempts = attempts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Add a container for dynamic width adjustment
        const attemptsListContainer = document.createElement('div');
        attemptsListContainer.className = 'attempts-list-container';
        recentAttemptsContainer.appendChild(attemptsListContainer);
        
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
            
            attemptsListContainer.appendChild(attemptCard);
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
// if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
//     // Debug application state
//     window.debugAppState = function() {
//         console.log('==== App State ====');
//         console.log('DOM Elements:');
//         console.log('- startScreen:', !!startScreen);
//         console.log('- questionContainer:', !!questionContainer);
//         console.log('- feedbackContainer:', !!feedbackContainer);
//         console.log('- examsContainer:', !!examsContainer);
//         console.log('- questionTextEl:', !!questionTextEl);
//         console.log('- choicesEl:', !!choicesEl);
        
//         console.log('App State:');
//         console.log('- API_URL:', API_URL);
//         console.log('- currentExamId:', currentExamId);
//         console.log('- currentExamMetadata:', currentExamMetadata);
//         console.log('- currentQuestions:', currentQuestions ? `${currentQuestions.length} questions` : 'None loaded');
//         console.log('- currentQuestionIndex:', currentQuestionIndex);
//         console.log('- correctAnswers:', correctAnswers);
//     };
    
//     // Debug database connectivity
//     window.testDatabaseConnection = function() {
//         fetch(`${API_URL}/debug/titles`)
//             .then(response => response.json())
//             .then(data => console.log('Database connection test:', data))
//             .catch(error => console.error('Database connection error:', error));
//     };
    
//     // Add debugging button
//     document.addEventListener('DOMContentLoaded', () => {
//         const debugButton = document.createElement('button');
//         debugButton.textContent = 'Debug';
//         debugButton.style.position = 'fixed';
//         debugButton.style.bottom = '10px';
//         debugButton.style.right = '10px';
//         debugButton.style.zIndex = '9999';
//         debugButton.style.backgroundColor = '#f72585';
//         debugButton.style.color = 'white';
//         debugButton.style.padding = '8px 12px';
//         debugButton.style.border = 'none';
//         debugButton.style.borderRadius = '4px';
//         debugButton.style.cursor = 'pointer';
//         debugButton.addEventListener('click', () => {
//             window.debugAppState();
//             window.testDatabaseConnection();
//         });
//         document.body.appendChild(debugButton);
//     });
// }