/**
 * Attempt Controller
 * Handles the business logic for quiz attempt operations
 */

const Attempt = require('../models/Attempt');

// Save a new quiz attempt
exports.saveAttempt = async (req, res) => {
  try {
    // Extract data from request body
    const { examNumber, questionsCount, correctAnswers, percentage } = req.body;
    
    // Validate required fields
    if (!examNumber || !questionsCount || correctAnswers === undefined || !percentage) {
      return res.status(400).json({ 
        message: 'Missing required fields. Please provide examNumber, questionsCount, correctAnswers, and percentage.' 
      });
    }
    
    // Create a new attempt
    const attempt = new Attempt({
      examNumber,
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