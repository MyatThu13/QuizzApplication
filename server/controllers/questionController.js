/**
 * Question Controller (Updated)
 * Handles the business logic for question-related operations
 * Updated to support title-based grouping and metadata
 */

const Question = require('../models/Question');
const ExamMetadata = require('../models/ExamMetadata');

// Get all available exam titles and their metadata
// exports.getExamTitles = async (req, res) => {
//   try {
//     // Get unique titles with their exams
//     const titles = await ExamMetadata.aggregate([
//       { $sort: { title: 1, year: -1, type: 1 } },
//       { 
//         $group: {
//           _id: "$title",
//           exams: { 
//             $push: {
//               examId: "$examId",
//               title: "$title",
//               type: "$type",
//               vendor: "$vendor",
//               year: "$year",
//               fullName: "$fullName",
//               questionCount: "$questionCount",
//               isFlagged: "$isFlagged"
//             }
//           },
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { _id: 1 } } // Sort by title
//     ]);

//     res.json({ titles });
//   } catch (error) {
//     console.error('Error getting exam titles:', error);
//     res.status(500).json({ 
//       message: 'Server Error',
//       error: error.message 
//     });
//   }
// };


// /**
//  * Get all available exam titles and their metadata
//  * Improved with better error handling and logging
//  */
// exports.getExamTitles = async (req, res) => {
//   try {
//     console.log('getExamTitles called - fetching exam titles from database');
    
//     // Get unique titles with their exams
//     const titles = await ExamMetadata.aggregate([
//       { $sort: { title: 1, year: -1, type: 1 } },
//       { 
//         $group: {
//           _id: "$title",
//           exams: { 
//             $push: {
//               examId: "$examId",
//               title: "$title",
//               type: "$type",
//               vendor: "$vendor",
//               year: "$year",
//               fullName: "$fullName",
//               questionCount: "$questionCount",
//               isFlagged: "$isFlagged"
//             }
//           },
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { _id: 1 } } // Sort by title
//     ]);

//     console.log(`Found ${titles.length} unique titles in database`);
//     titles.forEach(title => {
//       console.log(`  - ${title._id}: ${title.exams.length} exams`);
//     });

//     res.json({ titles });
//   } catch (error) {
//     console.error('Error in getExamTitles:', error);
//     res.status(500).json({ 
//       message: 'Server Error',
//       error: error.message 
//     });
//   }
// };


// Backend API Response Fix
// This ensures the response format matches what the frontend expects

// Update the getExamTitles method in your questionController.js file:

/**
 * Get all available exam titles and their metadata
 * Ensure response format matches frontend expectations
 */
exports.getExamTitles = async (req, res) => {
  try {
    console.log('getExamTitles called - fetching exam titles from database');
    
    // Get unique titles with their exams
    const titles = await ExamMetadata.aggregate([
      { $sort: { title: 1, year: -1, type: 1 } },
      { 
        $group: {
          _id: "$title",
          exams: { 
            $push: {
              examId: "$examId",
              title: "$title",
              type: "$type",
              vendor: "$vendor",
              year: "$year",
              fullName: "$fullName",
              questionCount: "$questionCount",
              isFlagged: "$isFlagged"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort by title
    ]);

    console.log(`Found ${titles.length} unique titles in database`);
    
    // IMPORTANT: Make sure the response format is { titles: [...] }
    // This is the format the frontend is expecting
    res.json({ titles });
  } catch (error) {
    console.error('Error in getExamTitles:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: error.message 
    });
  }
};

// Get questions for a specific exam
// exports.getQuestions = async (req, res) => {
//   try {
//     const examId = req.params.examId;
    
//     // Check if this is a flagged questions exam
//     const metadata = await ExamMetadata.findOne({ examId });
    
//     if (!metadata) {
//       return res.status(404).json({ 
//         message: `Exam with ID ${examId} not found.` 
//       });
//     }
    
//     let questions;
    
//     if (metadata.isFlagged) {
//       // Get flagged questions for this title
//       questions = await Question.find({ 
//         title: metadata.title, 
//         flagged: true 
//       });
//     } else {
//       // Get questions for the specific exam
//       questions = await Question.find({ examId });
//     }
    
//     // Check if any questions were found
//     if (questions.length === 0) {
//       if (metadata.isFlagged) {
//         return res.status(404).json({ 
//           message: `No flagged questions found for ${metadata.title}. Flag some questions first.` 
//         });
//       } else {
//         return res.status(404).json({ 
//           message: `No questions found for exam "${metadata.fullName}". Make sure to import questions first.` 
//         });
//       }
//     }
    
//     // Return the questions with metadata
//     res.json({
//       questions,
//       metadata
//     });
//   } catch (error) {
//     console.error('Error getting questions:', error);
//     res.status(500).json({ 
//       message: 'Server Error',
//       error: error.message 
//     });
//   }
// };


exports.getQuestions = async (req, res) => {
    try {
        const examId = req.params.examId;
        
        // Check if this is a flagged or missed questions exam
        const metadata = await ExamMetadata.findOne({ examId });
        
        if (!metadata) {
            return res.status(404).json({ 
                message: `Exam with ID ${examId} not found.` 
            });
        }
        
        let questions;
        
        if (metadata.isFlagged) {
            // Get flagged questions for this title
            questions = await Question.find({ 
                title: metadata.title, 
                flagged: true 
            });
        } else if (metadata.isMissed) {
            // Get missed questions for this title
            questions = await Question.find({ 
                title: metadata.title, 
                missed: true 
            });
        } else {
            // Get questions for the specific exam
            questions = await Question.find({ examId });
        }
        
        // Check if any questions were found
        if (questions.length === 0) {
            if (metadata.isFlagged) {
                return res.status(404).json({ 
                    message: `No flagged questions found for ${metadata.title}. Flag some questions first.` 
                });
            } else if (metadata.isMissed) {
                return res.status(404).json({ 
                    message: `No missed questions found for ${metadata.title}. Questions you answer incorrectly will appear here.` 
                });
            } else {
                return res.status(404).json({ 
                    message: `No questions found for exam "${metadata.fullName}". Make sure to import questions first.` 
                });
            }
        }
        
        // Return the questions with metadata
        res.json({
            questions,
            metadata
        });
    } catch (error) {
        console.error('Error getting questions:', error);
        res.status(500).json({ 
            message: 'Server Error',
            error: error.message 
        });
    }
};

// Flag a question
exports.flagQuestion = async (req, res) => {
  try {
    const questionId = req.query.id;
    
    if (!questionId) {
      return res.status(400).json({ message: 'Question ID is required' });
    }
    
    // Find and update the question
    const question = await Question.findByIdAndUpdate(
      questionId,
      { flagged: true },
      { new: true }
    );
    
    // Check if question exists
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
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
    const questionId = req.query.id;
    
    if (!questionId) {
      return res.status(400).json({ message: 'Question ID is required' });
    }
    
    // Find and update the question
    const question = await Question.findByIdAndUpdate(
      questionId,
      { flagged: false },
      { new: true }
    );
    
    // Check if question exists
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
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

// Mark a question as missed
exports.markQuestionMissed = async (req, res) => {
    try {
        const questionId = req.query.id;
        
        if (!questionId) {
            return res.status(400).json({ message: 'Question ID is required' });
        }
        
        // Find and update the question
        const question = await Question.findByIdAndUpdate(
            questionId,
            { missed: true },
            { new: true }
        );
        
        // Check if question exists
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        // Return success
        res.json({ 
            message: 'Question marked as missed',
            question 
        });
    } catch (error) {
        console.error('Error marking question as missed:', error);
        res.status(500).json({ 
            message: 'Server Error',
            error: error.message 
        });
    }
};

// Unmark a question as missed
exports.unmarkQuestionMissed = async (req, res) => {
    try {
        const questionId = req.query.id;
        
        if (!questionId) {
            return res.status(400).json({ message: 'Question ID is required' });
        }
        
        // Find and update the question
        const question = await Question.findByIdAndUpdate(
            questionId,
            { missed: false },
            { new: true }
        );
        
        // Check if question exists
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        // Return success
        res.json({ 
            message: 'Question removed from missed',
            question 
        });
    } catch (error) {
        console.error('Error unmarking question as missed:', error);
        res.status(500).json({ 
            message: 'Server Error',
            error: error.message 
        });
    }
};