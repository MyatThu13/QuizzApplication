/**
 * Attempt Model (Updated)
 * Defines the schema for quiz attempt results in MongoDB
 * Updated to include additional metadata
 */

const mongoose = require('mongoose');

// Create the Attempt schema
const AttemptSchema = new mongoose.Schema({
  examId: {
    type: String,
    required: true
  },
  examName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    index: true
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

// Add compound index for efficient filtering
AttemptSchema.index({ title: 1, date: -1 });

// Export the Attempt model
module.exports = mongoose.model('Attempt', AttemptSchema);