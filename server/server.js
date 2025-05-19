/**
 * Quiz Application - Debug Server File
 * With explicit route definitions
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
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

// Questions routes
app.get('/api/questions/:examNumber', questionController.getQuestions);
app.put('/api/questions/flag', (req, res) => {
  console.log('Flag route called with ID (query param):', req.query.id);
  req.params.id = req.query.id;
  return questionController.flagQuestion(req, res);
});
app.put('/api/questions/unflag', (req, res) => {
  console.log('Unflag route called with ID (query param):', req.query.id);
  req.params.id = req.query.id;
  return questionController.unflagQuestion(req, res);
});

// Attempts routes
app.use('/api/attempts', require('./routes/attempts'));

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