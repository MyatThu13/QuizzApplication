/**
 * Updated Question Controller
 * Properly handle missed questions logic
 */
const Question = require('../models/Question');
const ExamMetadata = require('../models/ExamMetadata');

// Get all available exam titles and their metadata
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
              isFlagged: "$isFlagged",
              isMissed: "$isMissed"  // Include isMissed flag
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort by title
    ]);

    console.log(`Found ${titles.length} unique titles in database`);
    
    // IMPORTANT: Make sure the response format is { titles: [...] }
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

// Add to server/controllers/questionController.js

// Get filtered questions for a specific exam title
exports.getFilteredQuestions = async (req, res) => {
    try {
        const { 
            examId, 
            includeNew, 
            includeAnswered, 
            includeFlagged, 
            includeIncorrect, 
            count 
        } = req.query;
        
        // Validate required parameters
        if (!examId) {
            return res.status(400).json({ message: 'Exam ID is required' });
        }
        
        // Find the exam metadata
        const metadata = await ExamMetadata.findOne({ examId });
        
        if (!metadata) {
            return res.status(404).json({ 
                message: `Exam with ID ${examId} not found.` 
            });
        }
        
        // Parse boolean parameters
        const includeNewBool = includeNew === 'true';
        const includeAnsweredBool = includeAnswered === 'true';
        const includeFlaggedBool = includeFlagged === 'true';
        const includeIncorrectBool = includeIncorrect === 'true';
        
        // Parse count parameter
        const questionCount = parseInt(count) || 10;
        
        // Build the query based on the configuration
        const query = { title: metadata.title };
        
        // If all are false, include all questions
        if (!includeNewBool && !includeAnsweredBool && !includeFlaggedBool && !includeIncorrectBool) {
            // No filter, include all questions
        } else {
            // Build filter conditions
            const conditions = [];
            
            if (includeNewBool) {
                conditions.push({ answered: false });
            }
            
            if (includeAnsweredBool) {
                conditions.push({ answered: true });
            }
            
            if (includeFlaggedBool) {
                conditions.push({ flagged: true });
            }
            
            if (includeIncorrectBool) {
                conditions.push({ missed: true });
            }
            
            // Add conditions to query if any exist
            if (conditions.length > 0) {
                query.$or = conditions;
            }
        }
        
        // Get questions matching the query and limit to the requested count
        // Use aggregation to get a random sample if needed
        let questions = await Question.aggregate([
            { $match: query },
            { $sample: { size: questionCount } }
        ]);
        
        // // Check if any questions were found
        // if (questions.length === 0) {
        //     return res.status(404).json({ 
        //         message: 'No questions match the selected filters.' 
        //     });
        // }
        // Replace the existing "no questions found" error with this:
        if (questions.length === 0) {
            // Instead of a 404 error, return an empty array with metadata
            return res.json({ 
                questions: [],
                metadata,
                filters: {
                    includeNew: includeNewBool,
                    includeAnswered: includeAnsweredBool,
                    includeFlagged: includeFlaggedBool,
                    includeIncorrect: includeIncorrectBool,
                    count: questionCount
                },
                message: 'No questions match the selected filters.'
            });
        }
        
        // Return the questions with metadata
        res.json({
            questions,
            metadata,
            filters: {
                includeNew: includeNewBool,
                includeAnswered: includeAnsweredBool,
                includeFlagged: includeFlaggedBool,
                includeIncorrect: includeIncorrectBool,
                count: questionCount
            }
        });
    } catch (error) {
        console.error('Error getting filtered questions:', error);
        res.status(500).json({ 
            message: 'Server Error',
            error: error.message 
        });
    }
};

// Add to server/controllers/questionController.js

// Mark a question as answered
exports.markQuestionAnswered = async (req, res) => {
    try {
        const questionId = req.query.id;
        
        if (!questionId) {
            return res.status(400).json({ message: 'Question ID is required' });
        }
        
        // Find and update the question
        const question = await Question.findByIdAndUpdate(
            questionId,
            { answered: true },
            { new: true }
        );
        
        // Check if question exists
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        // Return success
        res.json({ 
            message: 'Question marked as answered',
            question 
        });
    } catch (error) {
        console.error('Error marking question as answered:', error);
        res.status(500).json({ 
            message: 'Server Error',
            error: error.message 
        });
    }
};


// Add to server/controllers/questionController.js

// Get question statistics for a specific exam
exports.getQuestionStats = async (req, res) => {
    try {
        const examId = req.params.examId;
        
        // Find the exam metadata
        const metadata = await ExamMetadata.findOne({ examId });
        
        if (!metadata) {
            return res.status(404).json({ 
                message: `Exam with ID ${examId} not found.` 
            });
        }
        
        // Get all questions for this title (not just for this specific exam)
        const allQuestionsCount = await Question.countDocuments({ title: metadata.title });
        
        // Get counts for each type
        const newCount = await Question.countDocuments({ 
            title: metadata.title,
            answered: false
        });
        
        const answeredCount = await Question.countDocuments({ 
            title: metadata.title,
            answered: true
        });
        
        const flaggedCount = await Question.countDocuments({ 
            title: metadata.title,
            flagged: true
        });
        
        const incorrectCount = await Question.countDocuments({ 
            title: metadata.title,
            missed: true
        });
        
        // Return the statistics
        res.json({
            examId,
            title: metadata.title,
            totalCount: allQuestionsCount,
            newCount,
            answeredCount,
            flaggedCount,
            incorrectCount
        });
    } catch (error) {
        console.error('Error getting question statistics:', error);
        res.status(500).json({ 
            message: 'Server Error',
            error: error.message 
        });
    }
};


// Add to server/controllers/questionController.js

// Get exam metadata for a specific exam ID
exports.getExamMetadata = async (req, res) => {
    try {
        const examId = req.params.examId;
        
        // Find the exam metadata
        const metadata = await ExamMetadata.findOne({ examId });
        
        if (!metadata) {
            return res.status(404).json({ 
                message: `Exam with ID ${examId} not found.` 
            });
        }
        
        // Return the metadata
        res.json(metadata);
    } catch (error) {
        console.error('Error getting exam metadata:', error);
        res.status(500).json({ 
            message: 'Server Error',
            error: error.message 
        });
    }
};