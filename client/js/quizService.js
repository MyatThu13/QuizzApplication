// Create a new file: client/js/quizService.js

/**
 * Quiz Service Module
 * Handles quiz data operations and business logic
 */

const QuizService = (function() {
    // Private state
    const API_URL = window.API_URL || 'http://localhost:5000/api';
    
    /**
     * Get available question counts for an exam
     * @param {string} examId - The ID of the exam
     * @returns {Promise<Object>} - Promise resolving to question counts
     */
    async function getAvailableQuestionCounts(examId) {
        try {
            // Fetch exam metadata from the API
            const response = await fetch(`${API_URL}/questions/stats/${examId}`);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Return the counts
            return {
                new: data.newCount || 0,
                answered: data.answeredCount || 0,
                flagged: data.flaggedCount || 0,
                incorrect: data.incorrectCount || 0
            };
        } catch (error) {
            console.error('Error fetching question counts:', error);
            
            // If API doesn't support this endpoint, fetch all questions and count
            return getQuestionCountsFromExam(examId);
        }
    }
    
    /**
     * Fallback method to get question counts by fetching all questions
     * @param {string} examId - The ID of the exam
     * @returns {Promise<Object>} - Promise resolving to question counts
     */
    async function getQuestionCountsFromExam(examId) {
        try {
            // Fetch all questions for the exam
            const response = await fetch(`${API_URL}/questions/${examId}`);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const questions = data.questions || [];
            
            // Count each type
            let newCount = 0;
            let answeredCount = 0;
            let flaggedCount = 0;
            let incorrectCount = 0;
            
            questions.forEach(question => {
                // Check if the question has been answered
                if (question.answered) {
                    answeredCount++;
                    
                    // Check if the question was answered incorrectly
                    if (question.missed) {
                        incorrectCount++;
                    }
                } else {
                    newCount++;
                }
                
                // Check if the question is flagged
                if (question.flagged) {
                    flaggedCount++;
                }
            });
            
            return {
                new: newCount,
                answered: answeredCount,
                flagged: flaggedCount,
                incorrect: incorrectCount
            };
        } catch (error) {
            console.error('Error fetching questions:', error);
            
            // Return default values if unable to fetch
            return {
                new: 0,
                answered: 0,
                flagged: 0,
                incorrect: 0
            };
        }
    }
    
    /**
     * Get filtered questions based on configuration
     * @param {string} examId - The ID of the exam
     * @param {boolean} includeNew - Whether to include new questions
     * @param {boolean} includeAnswered - Whether to include answered questions
     * @param {boolean} includeFlagged - Whether to include flagged questions
     * @param {boolean} includeIncorrect - Whether to include incorrect questions
     * @param {number} count - Maximum number of questions to return
     * @returns {Promise<Array>} - Promise resolving to the filtered questions
     */
    async function getFilteredQuestions(examId, includeNew, includeAnswered, includeFlagged, includeIncorrect, count) {
        try {
            // Build query parameters
            const params = new URLSearchParams({
                includeNew: includeNew,
                includeAnswered: includeAnswered,
                includeFlagged: includeFlagged,
                includeIncorrect: includeIncorrect,
                count: count
            });
            
            // Fetch filtered questions from the API
            const response = await fetch(`${API_URL}/questions/filtered?examId=${examId}&${params}`);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.questions || [];
        } catch (error) {
            console.error('Error fetching filtered questions:', error);
            throw error;
        }
    }
    
    /**
     * Mark a question as answered
     * @param {string} questionId - The ID of the question
     * @returns {Promise<Object>} - Promise resolving to the updated question
     */
    async function markQuestionAnswered(questionId) {
        try {
            const response = await fetch(`${API_URL}/questions/markAnswered?id=${questionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error marking question as answered:', error);
            // Don't throw the error - we don't want to interrupt the quiz flow
            // Just log it and return a minimal response
            return { message: 'Failed to mark question as answered', error: error.message };
        }
    }
    
    /**
     * Start a quiz with filtered questions
     * @param {string} examId - The ID of the exam
     * @param {Array} questions - The filtered questions
     * @param {boolean} showAnswerAfterEach - Whether to show the answer after each question
     */
    function startQuizWithQuestions(examId, questions, showAnswerAfterEach) {
        // Check if we can call the app's startExamWithCustomQuestions function
        if (typeof window.startExamWithCustomQuestions === 'function') {
            window.startExamWithCustomQuestions(examId, questions, showAnswerAfterEach);
        } else {
            console.error('startExamWithCustomQuestions function not found');
            alert('Error starting quiz. Please refresh the page and try again.');
        }
    }
    
    // Return public API
// Continue from previous file: client/js/quizService.js

    // Return public API
    return {
        getAvailableQuestionCounts,
        getFilteredQuestions,
        markQuestionAnswered,
        startQuizWithQuestions
    };
})();