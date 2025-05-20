/**
 * Quiz Application - Debug Server File
 * With explicit route definitions
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

// Define routes EXPLICITLY
// For debugging purposes, we'll define critical routes directly here

// In server.js, add this before your other routes
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response
});


// CRITICAL FIX for server.js
// The specific issue is the order of route definitions

/**
 * The problem:
 * The /:examId route is capturing /titles as an examId parameter
 * This happens because Express routes are matched in order of definition
 * 
 * Solution:
 * 1. Define the /titles route BEFORE the /:examId route
 * 2. Use explicit routes instead of the router for debugging
 */

// ===== ADD THIS CODE TO YOUR server.js FILE =====

// Remove the existing questions route registration if it exists
// app.use('/api/questions', require('./routes/questions'));

// Add specific routes IN THIS ORDER
app.get('/api/questions/titles', async (req, res) => {
  console.log('GET /api/questions/titles endpoint called directly');
  
  try {
    // Get exam metadata from database
    const ExamMetadata = require('./models/ExamMetadata');
    
    // Get unique titles with their exams
    const titles = await ExamMetadata.aggregate([
      { $sort: { title: 1, year: -1, type: 1 } },
      { 
        $group: {
          _id: "$title",
          exams: { 
            $push: {
              examId: "$examId",
              title: "$title",
              type: "$type",
              vendor: "$vendor",
              year: "$year",
              fullName: "$fullName",
              questionCount: "$questionCount",
              isFlagged: "$isFlagged"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort by title
    ]);

    console.log(`Found ${titles.length} unique titles to return`);
    res.json({ titles });
  } catch (error) {
    console.error('Error in /api/questions/titles route:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message 
    });
  }
});

// Add the debug endpoint
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

// AFTER defining these specific routes, THEN add the general routes with parameters
// app.get('/api/questions/:examId', questionController.getQuestions);
app.get('/api/questions/:examId', (req, res, next) => {
    console.log('Exam ID requested:', req.params.examId);
    next();
}, questionController.getQuestions);

app.put('/api/questions/flag', questionController.flagQuestion);
app.put('/api/questions/unflag', questionController.unflagQuestion);

// Then register the attempts routes
app.use('/api/attempts', require('./routes/attempts'));
// Questions routes
// app.get('/api/questions/:examNumber', questionController.getQuestions);

// app.put('/api/questions/flag', (req, res) => {
//   console.log('Flag route called with ID (query param):', req.query.id);
//   req.params.id = req.query.id;
//   return questionController.flagQuestion(req, res);
// });
// app.put('/api/questions/unflag', (req, res) => {
//   console.log('Unflag route called with ID (query param):', req.query.id);
//   req.params.id = req.query.id;
//   return questionController.unflagQuestion(req, res);
// });

// // Attempts routes
// app.use('/api/attempts', require('./routes/attempts'));

// Debugging route to verify API is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Serve static assets (frontend)
app.use(express.static(path.join(__dirname, '../client')));

// Handle any routes not defined above - return the main index.html file
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client', 'index.html'));
});

// Add this to the bottom of server.js before app.listen() to handle 404 errors
// Handle 404 errors - should be after all other routes
app.use((req, res, next) => {
    // API routes should return JSON
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            error: 'Not Found',
            message: 'The requested API endpoint does not exist.'
        });
    }
    
    // For HTML requests, send the 404 page
    res.status(404).sendFile(path.join(__dirname, '../client/404.html'));
});



// Import route modules explicitly with variable names
const questionsRoutes = require('./routes/questions');
const attemptsRoutes = require('./routes/attempts');

// Register routes with app.use
app.use('/api/questions', questionsRoutes);
app.use('/api/attempts', attemptsRoutes);

// Log registered routes from the questions router
console.log('\n=== QUESTIONS ROUTER ROUTES ===');
questionsRoutes.stack.forEach((layer) => {
  if (layer.route) {
    const path = layer.route.path;
    const methods = Object.keys(layer.route.methods)
      .filter(method => layer.route.methods[method])
      .join(', ')
      .toUpperCase();
    console.log(`${methods} /api/questions${path}`);
  }
});
console.log('=============================\n');

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