/**
 * Attempt Model
 * Defines the schema for quiz attempt results in MongoDB
 */

const mongoose = require('mongoose');

// Create the Attempt schema
const AttemptSchema = new mongoose.Schema({
  examNumber: {
    type: Number,
    required: true
  },
  examName: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  questionsCount: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Export the Attempt model
module.exports = mongoose.model('Attempt', AttemptSchema);