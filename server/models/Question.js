/**
 * Question Model
 * Defines the schema for quiz questions in MongoDB
 * Updated to include subject and flagged fields
 */

const mongoose = require('mongoose');

// Create a schema for question choices
const ChoiceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
});

// Create the main Question schema
const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: ''  // Subject field for categorization
  },
  choices: [ChoiceSchema],
  correctAnswerId: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  examNumber: {
    type: Number,
    required: true,
    default: 1
  },
  flagged: {
    type: Boolean,
    default: false  // Flag field to mark questions for review
  }
});

// Export the Question model
module.exports = mongoose.model('Question', QuestionSchema);