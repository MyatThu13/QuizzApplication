/**
 * Attempts Routes (Updated)
 * Defines API routes for quiz attempt operations
 * Updated to include title-specific routes
 */

const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');

// @route   POST api/attempts
// @desc    Save a new quiz attempt
// @access  Public
router.post('/', attemptController.saveAttempt);

// @route   GET api/attempts
// @desc    Get all quiz attempts
// @access  Public
router.get('/', attemptController.getAttempts);

// @route   GET api/attempts/title/:title
// @desc    Get quiz attempts for a specific title
// @access  Public
router.get('/title/:title', attemptController.getAttemptsByTitle);

module.exports = router;