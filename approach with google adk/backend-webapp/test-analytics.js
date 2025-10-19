#!/usr/bin/env node

/**
 * Analytics API Test Script
 * Tests all analytics endpoints to verify functionality
 */

const BASE_URL = 'http://localhost:3000/api/analytics';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    console.log(`\n${colors.cyan}Testing: ${name}${colors.reset}`);
    console.log(`URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.status === expectedStatus) {
      console.log(`${colors.green}✅ SUCCESS (${response.status})${colors.reset}`);
      console.log('Response:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
      return { success: true, data };
    } else {
      console.log(`${colors.red}❌ FAILED (Expected ${expectedStatus}, got ${response.status})${colors.reset}`);
      console.log('Response:', JSON.stringify(data, null, 2));
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR: ${error.message}${colors.reset}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log(`${colors.blue}
╔═══════════════════════════════════════════════════════╗
║         Analytics API Test Suite                      ║
║         Testing all endpoints...                      ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}`);

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Test 1: Leaderboard (should work even with no data)
  let result = await testEndpoint(
    'Leaderboard',
    `${BASE_URL}/leaderboard?limit=5`
  );
  results.total++;
  if (result.success) results.passed++;
  else results.failed++;

  // Test 2: AI Performance (should work even with no data)
  result = await testEndpoint(
    'AI Performance Metrics',
    `${BASE_URL}/ai/performance?hours=24`
  );
  results.total++;
  if (result.success) results.passed++;
  else results.failed++;

  // Test 3: AI Failures
  result = await testEndpoint(
    'AI Failures',
    `${BASE_URL}/ai/failures?limit=5`
  );
  results.total++;
  if (result.success) results.passed++;
  else results.failed++;

  // Test 4: Student Analytics (expected to fail with 404 if no student exists)
  result = await testEndpoint(
    'Student Analytics (test student)',
    `${BASE_URL}/student/test_student_123`,
    404 // Expecting 404 if no data exists
  );
  results.total++;
  if (result.success) results.passed++;
  else results.failed++;

  // Test 5: Topic Performance (expected to fail with 404 if no topic exists)
  result = await testEndpoint(
    'Topic Performance (JavaScript)',
    `${BASE_URL}/topic-performance/JavaScript`,
    404 // Expecting 404 if no data exists
  );
  results.total++;
  if (result.success) results.passed++;
  else results.failed++;

  // Test 6: Dashboard (expected to fail with 404 if no student exists)
  result = await testEndpoint(
    'Dashboard (test student)',
    `${BASE_URL}/dashboard/test_student_123`,
    404 // Expecting 404 if no data exists
  );
  results.total++;
  if (result.success) results.passed++;
  else results.failed++;

  // Test 7: AI Attempt Analysis (expected to fail with 404)
  result = await testEndpoint(
    'AI Attempt Analysis',
    `${BASE_URL}/ai/attempt/test_attempt_123`,
    404 // Expecting 404 if no data exists
  );
  results.total++;
  if (result.success) results.passed++;
  else results.failed++;

  // Test 8: AI Student History (expected to fail with 404)
  result = await testEndpoint(
    'AI Student History',
    `${BASE_URL}/ai/student/test_student_123?limit=5`,
    404 // Expecting 404 if no data exists
  );
  results.total++;
  if (result.success) results.passed++;
  else results.failed++;

  // Print summary
  console.log(`\n${colors.blue}
╔═══════════════════════════════════════════════════════╗
║                 TEST SUMMARY                          ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}`);

  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);

  if (results.failed === 0) {
    console.log(`\n${colors.green}✅ ALL TESTS PASSED!${colors.reset}`);
    console.log(`\n${colors.yellow}Note: Some endpoints returned 404 because no test data exists yet.`);
    console.log(`This is expected. Run a complete test to generate data, then run this script again.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}❌ SOME TESTS FAILED${colors.reset}`);
    console.log(`\nPlease check:`);
    console.log(`1. Is the backend server running? (npm run dev)`);
    console.log(`2. Is MongoDB connected?`);
    console.log(`3. Are the analytics routes registered correctly?`);
  }

  console.log(`\n${colors.cyan}Next Steps:${colors.reset}`);
  console.log(`1. Complete a test to generate StudentAnalytics and AIAnalysis data`);
  console.log(`2. Run this script again to verify data collection`);
  console.log(`3. Check MongoDB collections:`);
  console.log(`   - db.studentanalytics.find().pretty()`);
  console.log(`   - db.aianalyses.find().sort({ timestamp: -1 }).limit(5).pretty()`);
}

// Run tests
runTests().catch(err => {
  console.error(`${colors.red}Fatal error: ${err.message}${colors.reset}`);
  process.exit(1);
});
