/**
 * Updated ExamMetadata Model
 * Include support for missed questions exams
 */

const mongoose = require('mongoose');

// Create the ExamMetadata schema
const ExamMetadataSchema = new mongoose.Schema({
  examId: {
    type: String,
    required: true,
    unique: true
  },
  fileName: {
    type: String,
    required: true
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
  fullName: {
    type: String,
    required: true
  },
  questionCount: {
    type: Number,
    default: 0
  },
  dateImported: {
    type: Date,
    default: Date.now
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  isMissed: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  }
});

// Export the ExamMetadata model
module.exports = mongoose.model('ExamMetadata', ExamMetadataSchema);