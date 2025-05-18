/**
 * Questions Routes - Query Parameter Implementation
 */

const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// @route   GET api/questions/:examNumber
// @desc    Get questions for a specific exam
// @access  Public
router.get('/:examNumber', questionController.getQuestions);

// @route   PUT api/questions/flag?id=questionId
// @desc    Flag a question for review
// @access  Public
router.put('/flag', (req, res) => {
  console.log('Flag route called with ID (query param):', req.query.id);
  req.params.id = req.query.id; // Map to expected parameter
  return questionController.flagQuestion(req, res);
});

// @route   PUT api/questions/unflag?id=questionId
// @desc    Unflag a question
// @access  Public
router.put('/unflag', (req, res) => {
  console.log('Unflag route called with ID (query param):', req.query.id);
  req.params.id = req.query.id; // Map to expected parameter
  return questionController.unflagQuestion(req, res);
});

module.exports = router;