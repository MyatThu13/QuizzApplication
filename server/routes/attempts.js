/**
 * Attempts Routes
 * Defines API routes for quiz attempt operations
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

module.exports = router;