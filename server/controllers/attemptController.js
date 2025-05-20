/**
 * Attempt Controller (Updated)
 * Handles the business logic for quiz attempt operations
 * Updated to include additional metadata
 */

const Attempt = require('../models/Attempt');

// Save a new quiz attempt
// exports.saveAttempt = async (req, res) => {
//   try {
//     // Extract data from request body
//     const { 
//       examId, 
//       examName, 
//       title, 
//       type, 
//       vendor, 
//       year, 
//       questionsCount, 
//       correctAnswers, 
//       percentage 
//     } = req.body;
    
//     // Validate required fields
//     if (!examId || !examName || !title || !type || !vendor || !year || 
//         !questionsCount || correctAnswers === undefined || !percentage) {
//       return res.status(400).json({ 
//         message: 'Missing required fields. Please provide all exam metadata and result data.' 
//       });
//     }
    
//     // Create a new attempt
//     const attempt = new Attempt({
//       examId,
//       examName,
//       title,
//       type,
//       vendor,
//       year,
//       questionsCount,
//       correctAnswers,
//       percentage
//     });
    
//     // Save the attempt to the database
//     const savedAttempt = await attempt.save();
    
//     // Return the saved attempt
//     res.status(201).json(savedAttempt);
//   } catch (error) {
//     console.error('Error saving attempt:', error);
//     res.status(500).json({ 
//       message: 'Server Error',
//       error: error.message 
//     });
//   }
// };


// In server/controllers/attemptController.js
// handle 0 percent results
exports.saveAttempt = async (req, res) => {
  try {
    // Extract data from request body
    const { 
      examId, 
      examName, 
      title, 
      type, 
      vendor, 
      year, 
      questionsCount, 
      correctAnswers, 
      percentage 
    } = req.body;
    
    // Validate required fields - MODIFIED to allow 0 values
    if (!examId || !examName || !title || !type || !vendor || !year || 
        questionsCount === undefined || correctAnswers === undefined || percentage === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields. Please provide all exam metadata and result data.' 
      });
    }

    // Make sure numeric fields are valid numbers (not just undefined)
    if (isNaN(questionsCount) || isNaN(correctAnswers) || isNaN(percentage)) {
      return res.status(400).json({
        message: 'Invalid numeric values. Questions count, correct answers, and percentage must be numbers.'
      });
    }
    
    // Create a new attempt
    const attempt = new Attempt({
      examId,
      examName,
      title,
      type,
      vendor,
      year,
      questionsCount,
      correctAnswers,
      percentage
    });
    
    // Save the attempt to the database
    const savedAttempt = await attempt.save();
    
    // Return the saved attempt
    res.status(201).json(savedAttempt);
  } catch (error) {
    console.error('Error saving attempt:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: error.message 
    });
  }
};

// Get all attempts
exports.getAttempts = async (req, res) => {
  try {
    // Get all attempts, sorted by date (newest first)
    const attempts = await Attempt.find().sort({ date: -1 });
    
    // Return the attempts
    res.json(attempts);
  } catch (error) {
    console.error('Error getting attempts:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: error.message 
    });
  }
};

// Get attempts for a specific title
exports.getAttemptsByTitle = async (req, res) => {
  try {
    const title = req.params.title;
    
    // Get attempts for the specific title, sorted by date (newest first)
    const attempts = await Attempt.find({ title }).sort({ date: -1 });
    
    // Return the attempts
    res.json(attempts);
  } catch (error) {
    console.error('Error getting attempts by title:', error);
    res.status(500).json({ 
      message: 'Server Error',
      error: error.message 
    });
  }
};