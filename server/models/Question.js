/**
 * Updated Question Model
 * Include missed questions support
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
  choices: [ChoiceSchema],
  correctAnswerId: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  // Updated fields for new structure
  examId: {
    type: String,
    required: true,
    index: true // Add index for faster queries by examId
  },
  title: {
    type: String,
    required: true,
    index: true // Add index for faster queries by title
  },
  type: {
    type: String,
    required: true
  },
  vendor: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  // Optional fields
  subject: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  flagged: {
    type: Boolean,
    default: false
  },
  missed: {
    type: Boolean,
    default: false
  },
  answered: {
        type: Boolean,
        default: false,
        index: true // Add index for faster querying
    }
});

// // Add compound index for efficient filtering
// QuestionSchema.index({ title: 1, examId: 1 });
// QuestionSchema.index({ flagged: 1, title: 1 }); // For efficient flagged questions queries
// QuestionSchema.index({ missed: 1, title: 1 }); // For efficient missed questions queries

// Update indexes to include the new field
QuestionSchema.index({ title: 1, examId: 1, answered: 1 });
QuestionSchema.index({ flagged: 1, title: 1, answered: 1 });
QuestionSchema.index({ missed: 1, title: 1, answered: 1 });

// Export the Question model
module.exports = mongoose.model('Question', QuestionSchema);