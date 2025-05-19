/**
 * Questions Routes - Complete Version
 */

const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// @route   GET api/questions/titles
// @desc    Get all available exam titles with their exams
// @access  Public
router.get('/titles', questionController.getExamTitles);

// @route   GET api/questions/:examId
// @desc    Get questions for a specific exam
// @access  Public
router.get('/:examId', questionController.getQuestions);

// @route   PUT api/questions/flag?id=questionId
// @desc    Flag a question for review
// @access  Public
router.put('/flag', questionController.flagQuestion);

// @route   PUT api/questions/unflag?id=questionId
// @desc    Unflag a question
// @access  Public
router.put('/unflag', questionController.unflagQuestion);

module.exports = router;