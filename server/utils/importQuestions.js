/**
 * Import Questions Utility
 * Script to import questions from separate JSON files into MongoDB
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Question = require('../models/Question');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quiz-app';
    
    // Configure mongoose connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
    
    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

// Function to import questions from multiple JSON files
const importQuestions = async () => {
  try {
    // Connect to database
    await connectDB();

    // Define the exam files to import
    const examFiles = [
      { id: 1, name: 'PocketPrepMockExam1_Questions.json' },
      { id: 2, name: 'PocketPrepMockExam2_Questions.json' },
      { id: 3, name: 'PocketPrepMockExam3_Questions.json' },
      { id: 4, name: 'PocketPrepAllQuestions.json' },
      { id: 5, name: 'PocketPrepFlaggedQuestions.json' }
    ];
    
    // Clear existing questions
    console.log('Clearing existing questions...');
    await Question.deleteMany({});
    
    // Import each exam file
    for (const exam of examFiles) {
      const filePath = path.join(__dirname, `../../data/${exam.name}`);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log(`Warning: File not found: ${exam.name}. Skipping this exam.`);
        continue;
      }
      
      console.log(`Reading questions from ${exam.name}...`);
      
      try {
        // Read and parse the JSON file
        const questionsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Validate the file structure
        if (!questionsData || !questionsData.questions || !Array.isArray(questionsData.questions)) {
          console.error(`Error: Invalid file format in ${exam.name}. The JSON file should contain a "questions" array.`);
          continue;
        }
        
        // Add examNumber to each question
        const questionsToInsert = questionsData.questions.map(question => ({
          ...question,
          examNumber: exam.id
        }));
        
        // Insert questions for this exam
        if (questionsToInsert.length > 0) {
          await Question.insertMany(questionsToInsert);
          console.log(`Successfully imported ${questionsToInsert.length} questions for exam ${exam.id}.`);
        } else {
          console.log(`No questions found in ${exam.name}.`);
        }
      } catch (error) {
        console.error(`Error processing ${exam.name}: ${error.message}`);
      }
    }
    
    // Display distribution of questions across exams
    console.log('\nQuestion distribution summary:');
    
    for (const exam of examFiles) {
      const count = await Question.countDocuments({ examNumber: exam.id });
      console.log(`- Exam ${exam.id} (${exam.name}): ${count} questions`);
    }
    
    // Create empty files for any missing exam files
    for (const exam of examFiles) {
      const filePath = path.join(__dirname, `../../data/${exam.name}`);
      
      if (!fs.existsSync(filePath)) {
        // Create a template file with empty questions array
        const template = {
          "questions": []
        };
        
        try {
          fs.writeFileSync(filePath, JSON.stringify(template, null, 2));
          console.log(`Created empty template file for ${exam.name}`);
        } catch (error) {
          console.error(`Error creating template file for ${exam.name}: ${error.message}`);
        }
      }
    }
    
    console.log('\nImport process complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error importing questions:', error);
    process.exit(1);
  }
};

// Run the import function
importQuestions();