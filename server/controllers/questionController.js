/**
 * Updated Question Controller
 * Fixed to show separate All Questions buttons per vendor
 */
const Question = require('../models/Question');
const ExamMetadata = require('../models/ExamMetadata');

// Get all available exam titles and their metadata - FIXED VERSION
exports.getExamTitles = async (req, res) => {
  try {
    console.log('getExamTitles called - fetching exam titles from database');
    
    // Get unique titles with their exams - MODIFIED to not aggregate All Questions
    const titles = await ExamMetadata.aggregate([
      { $sort: { title: 1, vendor: 1, year: -1, type: 1 } }, // Sort by vendor too
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
              isMissed: "$isMissed"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort by title
    ]);

    console.log(`Found ${titles.length} unique titles in database`);
    
    // Process each title to ensure proper grouping
    const processedTitles = titles.map(title => {
      // Separate different types of exams
      const regularExams = [];
      const allQuestionsExams = [];
      const flaggedExams = [];
      const missedExams = [];
      
      title.exams.forEach(exam => {
        if (exam.isFlagged) {
          flaggedExams.push(exam);
        } else if (exam.isMissed) {
          missedExams.push(exam);
        } else if (exam.type.toLowerCase().includes('all')) {
          // Don't aggregate All Questions - keep them separate by vendor
          allQuestionsExams.push(exam);
        } else {
          regularExams.push(exam);
        }
      });
      
      // Combine all exams back, maintaining vendor separation for All Questions
      const combinedExams = [
        ...regularExams,
        ...allQuestionsExams, // Keep separate by vendor
        ...flaggedExams,
        ...missedExams
      ];
      
      return {
        _id: title._id,
        exams: combinedExams,
        count: combinedExams.length
      };
    });
    
    // Return the processed titles
    res.json({ titles: processedTitles });
  } catch (error) {
    console.error('Error in getExamTitles:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: error.message 
    });
  }
};

// Rest of the controller methods remain the same...
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
        let questions = await Question.aggregate([
            { $match: query },
            { $sample: { size: questionCount } }
        ]);
        
        if (questions.length === 0) {
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