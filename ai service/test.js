import { generateQuestions } from './questionGenerator.js';

console.log('🧪 Testing Question Generator...\n');

async function test() {
  try {
    console.log('📝 Generating 3 questions on "Photosynthesis"...');
    console.log('⏳ Please wait (this may take 10-30 seconds)...\n');
    
    const result = await generateQuestions({
      topic: 'Photosynthesis',
      questionCount: 3
    });

    if (result.success) {
      console.log('✅ SUCCESS! Questions generated!\n');
      
      // Debug: Show the actual data structure
      console.log('📦 Data structure received:');
      console.log(JSON.stringify(result.data, null, 2));
      console.log('\n' + '='.repeat(60));
      
      const totalQuestions = result.data.totalQuestions || result.data.questions?.length || 0;
      console.log('📊 Total Questions:', totalQuestions);
      console.log('\n' + '='.repeat(60));
      console.log('Generated Questions:');
      console.log('='.repeat(60));
      
      if (!result.data.questions || !Array.isArray(result.data.questions)) {
        console.log('⚠️  No questions array found in response');
        console.log('Available keys:', Object.keys(result.data));
        return;
      }
      
      result.data.questions.forEach((q, index) => {
        console.log(`\nQuestion ${index + 1}:`);
        console.log(`  ID: ${q.questionId}`);
        console.log(`  Topic: ${q.topic}`);
        console.log(`  Difficulty: ${q.difficulty}/5`);
        console.log(`  Type: ${q.type}`);
        console.log(`  Bloom Level: ${q.bloomLevel || 'N/A'}`);
        console.log(`  Question: ${q.questionText}`);
        if (q.options && q.options.length > 0) {
          console.log(`  Options:`);
          q.options.forEach((opt, idx) => {
            // Handle both string options and object options
            if (typeof opt === 'string') {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D...
              console.log(`    ${letter}. ${opt}`);
            } else {
              const optId = opt.optionId || opt.id || opt.label || String.fromCharCode(65 + idx);
              const optText = opt.text || opt.option || opt.value || JSON.stringify(opt);
              console.log(`    ${optId}. ${optText}`);
            }
          });
          console.log(`  Correct Answer: ${q.correctAnswer}`);
        }
        if (q.explanation) {
          console.log(`  Explanation: ${q.explanation}`);
        }
      });
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ Test completed successfully!');
      console.log('='.repeat(60));
    } else {
      console.log('❌ FAILED!');
      console.log('Error:', result.error);
      if (result.rawResponse) {
        console.log('\nRaw Response (first 500 chars):');
        console.log(result.rawResponse.substring(0, 500));
      }
    }
  } catch (error) {
    console.error('\n❌ UNEXPECTED ERROR:', error.message);
    console.error('\nStack Trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

test();
