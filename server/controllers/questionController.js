/**
 * Question Controller
 * Handles the business logic for question-related operations
 * Updated to include flag/unflag functionality
 */

const Question = require('../models/Question');

// Get questions for a specific exam
exports.getQuestions = async (req, res) => {
  try {
    const examNumber = parseInt(req.params.examNumber);
    
    // Validate exam number
    if (isNaN(examNumber) || examNumber < 1 || examNumber > 5) {
      return res.status(400).json({ 
        message: 'Invalid exam number. Should be a number between 1 and 5.' 
      });
    }
    
    let questions;
    
    // Special handling for Flagged Questions (exam #5)
    if (examNumber === 5) {
      // Get all flagged questions
      questions = await Question.find({ flagged: true });
    } else {
      // Get questions for the specific exam number
      questions = await Question.find({ examNumber });
    }
    
    // Check if any questions were found
    if (questions.length === 0) {
      if (examNumber === 5) {
        return res.status(404).json({ 
          message: `No flagged questions found. Flag some questions first.` 
        });
      } else {
        return res.status(404).json({ 
          message: `No questions found for Exam ${examNumber}. Make sure to import questions first.` 
        });
      }
    }
    
    // Return the questions
    res.json(questions);
  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: error.message 
    });
  }
};

/**
 * Question Controller - Flag/Unflag Methods Only
 * For debugging purposes
 */

// Flag a question
exports.flagQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    
    // Debug log
    console.log('flagQuestion called with ID:', questionId);
    
    if (!questionId) {
      console.error('No question ID provided');
      return res.status(400).json({ message: 'Question ID is required' });
    }
    
    // Use mongoose findByIdAndUpdate method
    const Question = require('../models/Question');
    
    // Find and update the question
    const question = await Question.findByIdAndUpdate(
      questionId,
      { flagged: true },
      { new: true } // Return the updated document
    );
    
    // Check if question exists
    if (!question) {
      console.error('Question not found with ID:', questionId);
      return res.status(404).json({ message: 'Question not found' });
    }
    
    console.log('Question flagged successfully:', question._id);
    
    // Return success
    res.json({ 
      message: 'Question flagged successfully',
      question 
    });
  } catch (error) {
    console.error('Error flagging question:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: error.message 
    });
  }
};

// Unflag a question
exports.unflagQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    
    // Debug log
    console.log('unflagQuestion called with ID:', questionId);
    
    if (!questionId) {
      console.error('No question ID provided');
      return res.status(400).json({ message: 'Question ID is required' });
    }
    
    // Use mongoose findByIdAndUpdate method
    const Question = require('../models/Question');
    
    // Find and update the question
    const question = await Question.findByIdAndUpdate(
      questionId,
      { flagged: false },
      { new: true } // Return the updated document
    );
    
    // Check if question exists
    if (!question) {
      console.error('Question not found with ID:', questionId);
      return res.status(404).json({ message: 'Question not found' });
    }
    
    console.log('Question unflagged successfully:', question._id);
    
    // Return success
    res.json({ 
      message: 'Question unflagged successfully',
      question 
    });
  } catch (error) {
    console.error('Error unflagging question:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: error.message 
    });
  }
};


// // Flag a question
// exports.flagQuestion = async (req, res) => {
//   try {
//     const questionId = req.params.id;
    
//     // Find and update the question
//     const question = await Question.findByIdAndUpdate(
//       questionId,
//       { flagged: true },
//       { new: true } // Return the updated document
//     );
    
//     // Check if question exists
//     if (!question) {
//       return res.status(404).json({ message: 'Question not found' });
//     }
    
//     // Return success
//     res.json({ 
//       message: 'Question flagged successfully',
//       question 
//     });
//   } catch (error) {
//     console.error('Error flagging question:', error);
//     res.status(500).json({ 
//       message: 'Server Error',
//       error: error.message 
//     });
//   }
// };

// // Unflag a question
// exports.unflagQuestion = async (req, res) => {
//   try {
//     const questionId = req.params.id;
    
//     // Find and update the question
//     const question = await Question.findByIdAndUpdate(
//       questionId,
//       { flagged: false },
//       { new: true } // Return the updated document
//     );
    
//     // Check if question exists
//     if (!question) {
//       return res.status(404).json({ message: 'Question not found' });
//     }
    
//     // Return success
//     res.json({ 
//       message: 'Question unflagged successfully',
//       question 
//     });
//   } catch (error) {
//     console.error('Error unflagging question:', error);
//     res.status(500).json({ 
//       message: 'Server Error',
//       error: error.message 
//     });
//   }
// };