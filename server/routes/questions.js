/**
 * Questions Routes - Corrected Version
 * Routes properly ordered to prevent path conflicts
 */

const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// IMPORTANT: Order matters in Express routing
// Define specific routes first before parameter routes

// @route   GET api/questions/titles
// @desc    Get all available exam titles with their exams
// @access  Public
router.get('/titles', questionController.getExamTitles);

// @route   PUT api/questions/flag?id=questionId
// @desc    Flag a question for review
// @access  Public
router.put('/flag', questionController.flagQuestion);

// @route   PUT api/questions/unflag?id=questionId
// @desc    Unflag a question
// @access  Public
router.put('/unflag', questionController.unflagQuestion);

// @route   PUT api/questions/markMissed?id=questionId 
// @desc    Mark a question as missed
// @access  Public
router.put('/markMissed', questionController.markQuestionMissed);

// @route   PUT api/questions/unmarkMissed?id=questionId
// @desc    Unmark a question as missed
// @access  Public
router.put('/unmarkMissed', questionController.unmarkQuestionMissed);

// IMPORTANT: Parameter routes must come AFTER specific routes
// Otherwise, Express will treat 'titles', 'flag', etc. as examId values

// @route   GET api/questions/:examId
// @desc    Get questions for a specific exam
// @access  Public
router.get('/:examId', questionController.getQuestions);

module.exports = router;