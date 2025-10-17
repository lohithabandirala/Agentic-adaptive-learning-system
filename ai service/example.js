import { generateQuestions, generateQuestionsStream } from './questionGenerator.js';
import { sampleStudentData, sampleTopics } from './sampleData.js';

/**
 * Example 1: Generate questions with topic only
 */
async function example1() {
  console.log('\n=== Example 1: Topic Only ===\n');
  
  const result = await generateQuestions({
    topic: 'Photosynthesis',
    questionCount: 3
  });

  if (result.success) {
    console.log('Generated Questions:');
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    console.error('Error:', result.error);
  }
}

/**
 * Example 2: Generate questions with topic and student data
 */
async function example2() {
  console.log('\n=== Example 2: Topic + Student Data ===\n');
  
  const result = await generateQuestions({
    topic: sampleTopics.math.algebra,
    studentData: sampleStudentData,
    questionCount: 5
  });

  if (result.success) {
    console.log('Generated Questions:');
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    console.error('Error:', result.error);
  }
}

/**
 * Example 3: Generate questions with streaming
 */
async function example3() {
  console.log('\n=== Example 3: Streaming Response ===\n');
  
  const result = await generateQuestionsStream({
    topic: 'Newton\'s Laws of Motion',
    studentData: sampleStudentData,
    questionCount: 4,
    onChunk: (text) => {
      process.stdout.write(text); // Stream output as it comes
    }
  });

  console.log('\n\n--- Final Result ---');
  if (result.success) {
    console.log('Questions generated successfully!');
  } else {
    console.error('Error:', result.error);
  }
}

/**
 * Example 4: Generate questions from custom student data
 */
async function example4() {
  console.log('\n=== Example 4: Custom Student Data ===\n');
  
  const customStudent = {
    studentId: "STU_3001",
    name: "Priya Sharma",
    grade: 8,
    subjects: ["Biology", "Chemistry"],
    performanceSummary: {
      overallAccuracy: 0.65,
      averageDifficultyLevel: 2,
      trend: "stable"
    },
    learningPreferences: {
      preferredDifficulty: 2,
      preferredQuestionType: "Short Answer",
      preferredMode: "Reading"
    }
  };

  const result = await generateQuestions({
    topic: 'Cell Structure and Functions',
    studentData: customStudent,
    questionCount: 3
  });

  if (result.success) {
    console.log('Generated Questions:');
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    console.error('Error:', result.error);
  }
}

// Run examples
async function main() {
  console.log('🚀 AI Question Generator Examples\n');
  console.log('Choose an example to run:');
  console.log('1. Topic only');
  console.log('2. Topic + Student data');
  console.log('3. Streaming response');
  console.log('4. Custom student data\n');

  // Get command line argument or default to example 2
  const exampleNumber = process.argv[2] || '2';

  switch (exampleNumber) {
    case '1':
      await example1();
      break;
    case '2':
      await example2();
      break;
    case '3':
      await example3();
      break;
    case '4':
      await example4();
      break;
    default:
      console.log('Running default example (2)...\n');
      await example2();
  }
}

// Run main function
main().catch(console.error);
