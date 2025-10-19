# Analytics Implementation Guide

## Overview
This document describes the production-ready analytics system added to track student performance across multiple tests and debug AI agent interactions.

## Features Implemented

### 1. StudentAnalytics Collection
**Purpose**: Track aggregate student performance across ALL tests for cross-test adaptive learning

**Location**: `backend-webapp/src/db/models/StudentAnalytics.ts`

**Key Features**:
- Overall accuracy tracking across all tests
- Tests completed count
- Topic-wise performance breakdown
- Difficulty progression over time
- Strengths identification (topics >80% accuracy)
- Weaknesses identification (topics <50% accuracy)
- Average stress levels from emotion tracking

**Schema**:
```typescript
{
  studentId: string;           // Unique student identifier
  overallAccuracy: number;     // 0-1 scale across all tests
  testsCompleted: number;      // Total tests taken
  totalQuestions: number;      // All questions attempted
  averageStress: number;       // 0-10 self-reported stress
  averageEmotionStress: number; // 0-1 emotion-detected stress
  topicPerformance: [{
    topic: string;
    accuracy: number;
    testsCount: number;
    averageStress: number;
    lastAttempted: Date;
  }];
  difficultyProgression: [{
    timestamp: Date;
    difficulty: 'easy' | 'medium' | 'hard';
    testId: string;
    accuracy: number;
  }];
  strengths: string[];         // Topics >80% accuracy
  weaknesses: string[];        // Topics <50% accuracy
  lastUpdated: Date;
}
```

**Auto-Update Method**:
```typescript
await analytics.updateFromAttempt(attempt, test);
```
This method automatically:
- Recalculates overall accuracy
- Updates topic performance
- Adds difficulty progression entry
- Identifies strengths/weaknesses
- Updates average stress levels

**Integration**: Automatically called when tests complete in `routes/tests.ts` (line ~530)

### 2. AIAnalysis Collection
**Purpose**: Debug and optimize AI agent by tracking all ADK interactions

**Location**: `backend-webapp/src/db/models/AIAnalysis.ts`

**Key Features**:
- Full prompt and response logging
- Tool call tracking (which tools, arguments, results)
- Performance metrics (processing time, iterations)
- Success/failure tracking with error details
- Separate tracking for question generation vs session analysis

**Schema**:
```typescript
{
  attemptId: string;
  studentId: string;
  session?: number;
  analysisType: 'question_generation' | 'session_analysis';
  
  // Input
  prompt: string;                    // Full prompt sent to ADK
  inputData: any;                    // Context data provided
  model: string;                     // ADK model used
  
  // Execution
  toolCallsUsed: [{
    toolName: string;
    arguments: any;
    result: any;
    executionTimeMs?: number;
  }];
  iterations: number;
  processingTimeMs: number;
  
  // Output
  response: any;                     // Full ADK response
  questionsGenerated?: number;       // For question generation
  success: boolean;
  error?: string;                    // Error details if failed
  
  timestamp: Date;
}
```

**Auto-Tracking**: ADK agent functions (`adkAgent.ts`) automatically save AI analysis:
- `generateQuestionsWithFullADK()` - Tracks question generation
- `analyzeSessionWithFullADK()` - Tracks session analysis

**What Gets Tracked**:
✅ Every prompt sent to ADK
✅ Every tool call made (queryPastPerformance, etc.)
✅ Processing time for each interaction
✅ Success/failure status
✅ Error messages for debugging
✅ Number of iterations used

## Usage Examples

### Query Student Analytics
```typescript
// Get student's aggregate performance
const analytics = await StudentAnalytics.findOne({ studentId: 'student123' });

console.log(`Overall Accuracy: ${(analytics.overallAccuracy * 100).toFixed(1)}%`);
console.log(`Tests Completed: ${analytics.testsCompleted}`);
console.log(`Strengths: ${analytics.strengths.join(', ')}`);
console.log(`Weaknesses: ${analytics.weaknesses.join(', ')}`);

// Topic breakdown
analytics.topicPerformance.forEach(tp => {
  console.log(`${tp.topic}: ${(tp.accuracy * 100).toFixed(1)}% (${tp.testsCount} tests)`);
});

// Difficulty progression
const recent = analytics.difficultyProgression.slice(-5);
console.log('Recent progression:', recent.map(d => d.difficulty));
```

### Query AI Analysis for Debugging
```typescript
// Get all AI interactions for a test
const analyses = await AIAnalysis.find({ attemptId: 'attempt123' })
  .sort({ timestamp: 1 });

// Check question generation performance
const questionGen = analyses.filter(a => a.analysisType === 'question_generation');
console.log(`Avg processing time: ${questionGen.reduce((s, a) => s + a.processingTimeMs, 0) / questionGen.length}ms`);

// Find failed interactions
const failed = analyses.filter(a => !a.success);
console.log(`Failed attempts: ${failed.length}`);
failed.forEach(f => console.log(`Error: ${f.error}`));

// Tool usage statistics
const toolCalls = analyses.flatMap(a => a.toolCallsUsed);
const toolStats = toolCalls.reduce((acc, tc) => {
  acc[tc.toolName] = (acc[tc.toolName] || 0) + 1;
  return acc;
}, {});
console.log('Tool usage:', toolStats);
```

## Database Indexes

### StudentAnalytics Indexes
- `studentId` (unique) - Fast student lookup
- `overallAccuracy` - For leaderboards
- `testsCompleted` - Find active students
- `lastUpdated` - Recent activity queries

### AIAnalysis Indexes
- `attemptId` - All AI for a test
- `studentId` - All AI for a student
- `timestamp` - Chronological queries
- `analysisType` - Filter by type
- `{studentId, timestamp}` - Student history
- `{attemptId, analysisType}` - Test breakdown

## Benefits

### For Students
- **Personalized Learning**: ADK can see "This student improved from 60% to 80% in Java across 3 tests"
- **Better Adaptation**: System knows persistent weaknesses vs one-time struggles
- **Progress Tracking**: Students see improvement over time

### For AI Agent
- **Smarter Decisions**: Access to full student history via queryStudentAnalytics tool
- **Cross-Test Learning**: "Student struggled with recursion in Test 1, avoid in Test 2"
- **Better Question Selection**: Target weaknesses identified across all tests

### For Developers
- **Debug Tool Calls**: See which tools succeeded/failed
- **Optimize Prompts**: Track which prompts generate best questions
- **Performance Monitoring**: Identify slow ADK interactions
- **Error Analysis**: Understand why ADK failed

## Future Enhancements

### Planned Features
1. **StudentAnalytics Query Tool for ADK**: 
   - Add `queryStudentAnalytics()` function in `adkAgent.ts`
   - Let ADK access aggregate performance data
   - Enable true cross-test adaptive learning

2. **Analytics API Endpoints**:
   - `GET /api/analytics/student/:studentId` - View student analytics
   - `GET /api/analytics/ai/:attemptId` - Debug AI interactions
   - `GET /api/analytics/leaderboard` - Top performers

3. **Analytics Dashboard**:
   - Visual charts for student progress
   - Topic performance heatmaps
   - AI performance metrics

4. **Optimization Insights**:
   - Identify slow prompts
   - Find most-used tools
   - Track ADK quota usage

## Integration Checklist

✅ Created StudentAnalytics model with auto-calculation
✅ Created AIAnalysis model with tool tracking
✅ Exported both models in `db/models/index.ts`
✅ Updated ADK agent to auto-save AI analysis
✅ Integrated StudentAnalytics update on test completion
✅ Added session parameter to all ADK function calls
⬜ Add queryStudentAnalytics tool to ADK agent
⬜ Create analytics API endpoints
⬜ Test with real data
⬜ Push to GitHub

## Testing

### Test StudentAnalytics
1. Complete a test
2. Check MongoDB for StudentAnalytics document
3. Verify accuracy calculations
4. Complete another test with different topic
5. Verify topic performance updates

### Test AIAnalysis
1. Start a test (triggers question generation)
2. Complete a session (triggers analysis)
3. Check MongoDB for AIAnalysis documents
4. Verify tool calls are recorded
5. Verify processing times are captured

### Sample Queries
```bash
# MongoDB shell
use agentic_adaptive_learning

# View student analytics
db.studentanalytics.find({ studentId: "student123" }).pretty()

# View AI analysis for a test
db.aianalyses.find({ attemptId: "attempt123" }).sort({ timestamp: 1 }).pretty()

# Find failed AI interactions
db.aianalyses.find({ success: false }).pretty()

# Get processing time stats
db.aianalyses.aggregate([
  { $group: { 
    _id: "$analysisType",
    avgTime: { $avg: "$processingTimeMs" },
    count: { $sum: 1 }
  }}
])
```

## Summary

This analytics implementation provides production-ready monitoring for:
- **Student Performance**: Track learning progress across all tests
- **AI Debugging**: Understand and optimize ADK agent behavior
- **System Optimization**: Identify bottlenecks and improve performance

All data collection happens automatically with zero additional code required at the route level (except the initial integration).
