/**
 * Enhanced Import Questions Utility - Updated Version
 * Script to import questions from multiple JSON files into MongoDB with improved metadata
 * Now supports multiple "All Questions" exams per vendor without aggregation
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Question = require('../models/Question');
const ExamMetadata = require('../models/ExamMetadata');
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

/**
 * Parse file name to extract metadata
 * Expected format: Title_Type_Vendor_Year.json
 * Example: CISSP_AllQuestions_PocketPrep_2024.json, CISSP_AllQuestions_Kaplan_2024.json
 */
function parseFileName(fileName) {
  // Remove extension
  const baseName = fileName.replace(/\.json$/, '');
  
  // Split by underscore
  const parts = baseName.split('_');
  
  if (parts.length < 4) {
    console.warn(`Warning: File ${fileName} does not follow the naming convention (Title_Type_Vendor_Year.json)`);
    return {
      title: parts[0] || 'Unknown Title',
      type: parts[1] || 'Exam',
      vendor: parts[2] || 'Unknown',
      year: parseInt(parts[3]) || new Date().getFullYear(),
      fullName: baseName
    };
  }
  
  return {
    title: parts[0],
    type: parts[1],
    vendor: parts[2],
    year: parseInt(parts[3]) || new Date().getFullYear(),
    fullName: baseName
  };
}

// Function to import questions from multiple JSON files
const importQuestions = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Get all JSON files from the data directory
    const dataDirectory = path.join(__dirname, '../../data');
    let files = [];
    
    try {
      files = fs.readdirSync(dataDirectory).filter(file => file.endsWith('.json'));
    } catch (err) {
      console.error(`Error reading data directory: ${err.message}`);
      console.log('Creating data directory...');
      fs.mkdirSync(dataDirectory, { recursive: true });
    }
    
    if (files.length === 0) {
      console.log('No JSON files found in the data directory.');
      process.exit(0);
    }
    
    // Clear existing questions and metadata
    console.log('Clearing existing questions and metadata...');
    await Question.deleteMany({});
    await ExamMetadata.deleteMany({});
    
    // Map to track unique titles for creating flagged/missed exams
    const uniqueTitles = new Map();
    
    // Import each file
    let totalQuestionsImported = 0;
    for (let i = 0; i < files.length; i++) {
      const fileName = files[i];
      const filePath = path.join(dataDirectory, fileName);
      
      // Parse file name for metadata
      const metadata = parseFileName(fileName);
      console.log(`\nProcessing file ${i+1}/${files.length}: ${fileName}`);
      console.log(`Detected metadata: Title=${metadata.title}, Type=${metadata.type}, Vendor=${metadata.vendor}, Year=${metadata.year}`);
      
      try {
        // Read and parse the JSON file
        const questionsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Validate the file structure
        if (!questionsData || !questionsData.questions || !Array.isArray(questionsData.questions)) {
          console.error(`Error: Invalid file format in ${fileName}. The JSON file should contain a "questions" array.`);
          continue;
        }
        
        // Track this title to create flagged/missed exams later
        if (!uniqueTitles.has(metadata.title)) {
          uniqueTitles.set(metadata.title, []);
        }
        uniqueTitles.get(metadata.title).push(metadata);
        
        // Generate a unique examId for this file
        // For "All Questions" exams, include vendor to make them unique
        let examId;
        if (metadata.type.toLowerCase().includes('all')) {
          examId = `${metadata.title}_${metadata.type}_${metadata.vendor}`;
        } else {
          examId = `${metadata.title}_${i+1}`;
        }
        
        console.log(`Generated examId: ${examId}`);
        
        // Add metadata and examId to each question
        const questionsToInsert = questionsData.questions.map(question => ({
          ...question,
          examId,
          title: metadata.title,
          type: metadata.type,
          vendor: metadata.vendor,
          year: metadata.year
        }));
        
        // Insert questions for this exam
        if (questionsToInsert.length > 0) {
          await Question.insertMany(questionsToInsert);
          totalQuestionsImported += questionsToInsert.length;
          
          // Save exam metadata
          await ExamMetadata.create({
            examId,
            fileName,
            title: metadata.title,
            type: metadata.type,
            vendor: metadata.vendor,
            year: metadata.year,
            fullName: metadata.fullName,
            questionCount: questionsToInsert.length,
            dateImported: new Date()
          });
          
          console.log(`Successfully imported ${questionsToInsert.length} questions for ${metadata.title} - ${metadata.vendor} (${examId}).`);
        } else {
          console.log(`No questions found in ${fileName}.`);
        }
      } catch (error) {
        console.error(`Error processing ${fileName}: ${error.message}`);
      }
    }
    
    // Create a "Flagged Questions" exam for each unique title (only one per title)
    console.log('\nCreating Flagged Questions exams for each title...');
    for (const [title, metadataList] of uniqueTitles.entries()) {
      // Use metadata from the first file of this title
      const baseMetadata = metadataList[0];
      
      // Create flagged exam metadata
      await ExamMetadata.create({
        examId: `${title}_Flagged`,
        fileName: 'virtual',
        title: baseMetadata.title,
        type: 'Flagged Questions',
        vendor: baseMetadata.vendor,
        year: baseMetadata.year,
        fullName: `${baseMetadata.title} Flagged Questions`,
        questionCount: 0, // Will be dynamic based on user flagging
        dateImported: new Date(),
        isFlagged: true
      });
      
      console.log(`Created Flagged Questions exam for ${title}`);
    }

    // Create a "Missed Questions" exam for each unique title (only one per title)
    console.log('\nCreating Missed Questions exams for each title...');
    for (const [title, metadataList] of uniqueTitles.entries()) {
        // Use metadata from the first file of this title
        const baseMetadata = metadataList[0];
        
        // Create missed exam metadata
        await ExamMetadata.create({
            examId: `${title}_Missed`,
            fileName: 'virtual',
            title: baseMetadata.title,
            type: 'Missed Questions',
            vendor: baseMetadata.vendor,
            year: baseMetadata.year,
            fullName: `${baseMetadata.title} Missed Questions`,
            questionCount: 0, // Will be dynamic based on user interaction
            dateImported: new Date(),
            isMissed: true
        });
        
        console.log(`Created Missed Questions exam for ${title}`);
    }
    
    // Display summary information
    console.log('\nImport Summary:');
    console.log(`Total files processed: ${files.length}`);
    console.log(`Total unique titles: ${uniqueTitles.size}`);
    console.log(`Total questions imported: ${totalQuestionsImported}`);
    
    // List titles and their exam counts with vendor breakdown
    console.log('\nExams by Title:');
    for (const [title, metadataList] of uniqueTitles.entries()) {
      console.log(`\n- ${title}: ${metadataList.length} exams + 1 Flagged + 1 Missed`);
      
      // Group by type and vendor
      const examsByType = {};
      metadataList.forEach(metadata => {
        const key = `${metadata.type}_${metadata.vendor}`;
        if (!examsByType[key]) {
          examsByType[key] = [];
        }
        examsByType[key].push(metadata);
      });
      
      // Display breakdown
      Object.keys(examsByType).forEach(key => {
        const [type, vendor] = key.split('_');
        const count = examsByType[key].length;
        console.log(`  • ${type} (${vendor}): ${count} exam${count > 1 ? 's' : ''}`);
      });
    }
    
    console.log('\nImport process complete!');
    console.log('\nNOTE: Each "All Questions" exam from different vendors will now appear as separate buttons.');
    process.exit(0);
  } catch (error) {
    console.error('Error importing questions:', error);
    process.exit(1);
  }
};

// Run the import function
importQuestions();