/**
 * Quiz Application - Server File with Fixed Route Registration
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Import controllers
const questionController = require('./controllers/questionController');
const attemptController = require('./controllers/attemptController');


// Serve static assets (frontend)
app.use(express.static(path.join(__dirname, '../client')));

// IMPORTANT: Add static file serving for question assets
// This should be added BEFORE your other routes
app.use('/question_assets', express.static(path.join(__dirname, '../question_assets')));

// Handle favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response
});

// Debug endpoint
app.get('/api/debug/titles', async (req, res) => {
  try {
    // Check mongoose connection
    if (mongoose.connection.readyState !== 1) {
      try {
        await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
      } catch (connError) {
        return res.status(500).json({
          success: false,
          error: `Failed to connect to database: ${connError.message}`,
          connectionState: mongoose.connection.readyState
        });
      }
    }
    
    // Get exam metadata directly 
    const ExamMetadata = require('./models/ExamMetadata');
    const metadata = await ExamMetadata.find().lean();
    
    // Get unique titles with basic aggregation
    const titles = await ExamMetadata.aggregate([
      { $group: { _id: "$title", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Return detailed debug information
    res.json({
      success: true,
      connectionState: mongoose.connection.readyState,
      metadataCount: metadata.length,
      titles: titles,
      rawMetadata: metadata.slice(0, 3) // Show first 3 records only
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Debugging route to verify API is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Import route modules
const questionsRoutes = require('./routes/questions');
const attemptsRoutes = require('./routes/attempts');

// IMPORTANT: Register questions routes properly
// First, register specific route handlers to ensure they take precedence
app.put('/api/questions/markMissed', questionController.markQuestionMissed);
app.put('/api/questions/unmarkMissed', questionController.unmarkQuestionMissed);
app.put('/api/questions/flag', questionController.flagQuestion);
app.put('/api/questions/unflag', questionController.unflagQuestion);
app.get('/api/questions/titles', questionController.getExamTitles);


// Add the filtered questions endpoint
app.get('/api/questions/filtered', questionController.getFilteredQuestions);

// Add the mark answered endpoint
app.put('/api/questions/markAnswered', questionController.markQuestionAnswered);

// Add the stats endpoint
app.get('/api/questions/stats/:examId', questionController.getQuestionStats);

// Add to server/server.js

// Add the metadata endpoint - register it directly
app.get('/api/questions/metadata/:examId', questionController.getExamMetadata);


// Then register the parameter route AFTER all specific routes
app.get('/api/questions/:examId', (req, res, next) => {
    console.log('Exam ID requested:', req.params.examId);
    next();
}, questionController.getQuestions);

// Then register the attempts routes
app.use('/api/attempts', attemptsRoutes);



// Handle 404 errors for API routes
app.use('/api/*', (req, res) => {
    return res.status(404).json({
        error: 'Not Found',
        message: 'The requested API endpoint does not exist.'
    });
});

// Handle 404 errors for all other routes - serve the 404 page
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../client/404.html'));
});

// Set up the server port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open your browser and navigate to: http://localhost:${PORT}`);
  
  // Log all registered routes
  console.log('\n=== REGISTERED ROUTES ===');
  app._router.stack.forEach((layer) => {
    if (layer.route) {
      const path = layer.route.path;
      const methods = Object.keys(layer.route.methods)
        .filter(method => layer.route.methods[method])
        .join(', ')
        .toUpperCase();
      console.log(`${methods} ${path}`);
    }
  });
  console.log('=========================\n');
});