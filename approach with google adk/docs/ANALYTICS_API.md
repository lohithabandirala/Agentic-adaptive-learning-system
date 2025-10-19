# Analytics API Reference

## Overview
Complete API documentation for the analytics endpoints that provide insights into student performance and AI agent behavior.

**Base URL:** `http://localhost:3000/api/analytics`

---

## Student Analytics Endpoints

### 1. Get Student Analytics
**Endpoint:** `GET /api/analytics/student/:studentId`

**Description:** Get comprehensive performance analytics for a specific student across all tests.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "studentId": "student123",
      "overallAccuracy": 75,
      "testsCompleted": 5,
      "totalQuestions": 50,
      "averageStress": "3.20",
      "lastUpdated": "2025-10-18T10:30:00Z"
    },
    "performance": {
      "topicPerformance": [
        {
          "topic": "JavaScript",
          "accuracy": 80,
          "testsCount": 3,
          "averageStress": "2.50",
          "lastAttempted": "2025-10-18T09:00:00Z"
        }
      ],
      "difficultyProgression": [
        {
          "timestamp": "2025-10-18T08:00:00Z",
          "difficulty": "medium",
          "accuracy": 70
        }
      ]
    },
    "insights": {
      "strengths": ["JavaScript", "Python"],
      "weaknesses": ["Algorithms"]
    }
  }
}
```

---

### 2. Get Leaderboard
**Endpoint:** `GET /api/analytics/leaderboard?limit=10`

**Description:** Get top performing students ranked by overall accuracy.

**Query Parameters:**
- `limit` (optional): Number of students to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "studentId": "student123",
      "overallAccuracy": 85,
      "testsCompleted": 10,
      "totalQuestions": 100,
      "strengths": ["JavaScript", "Python", "React"]
    }
  ],
  "count": 10
}
```

---

### 3. Get Topic Performance
**Endpoint:** `GET /api/analytics/topic-performance/:topic`

**Description:** Get aggregated performance data across all students for a specific topic.

**Response:**
```json
{
  "success": true,
  "data": {
    "topic": "JavaScript",
    "studentsAttempted": 25,
    "averageAccuracy": 72,
    "totalTests": 60,
    "averageStress": "3.10",
    "distribution": {
      "excellent": 10,
      "good": 12,
      "needsImprovement": 3
    }
  }
}
```

---

## AI Analysis Endpoints

### 4. Get AI Analysis for Attempt
**Endpoint:** `GET /api/analytics/ai/attempt/:attemptId`

**Description:** Get all AI agent interactions for a specific test attempt, including question generation and session analysis.

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": "attempt123",
    "summary": {
      "totalInteractions": 5,
      "successRate": 100,
      "totalProcessingTime": 15000,
      "averageProcessingTime": 3000,
      "toolUsage": {
        "queryPastPerformance": 3,
        "calculateDifficulty": 2
      }
    },
    "interactions": [
      {
        "id": "ai123",
        "timestamp": "2025-10-18T10:00:00Z",
        "analysisType": "question_generation",
        "session": 1,
        "success": true,
        "processingTimeMs": 3200,
        "toolCallsUsed": ["queryPastPerformance"],
        "iterations": 1,
        "questionsGenerated": 5
      }
    ]
  }
}
```

---

### 5. Get Student AI History
**Endpoint:** `GET /api/analytics/ai/student/:studentId?limit=20`

**Description:** Get AI interaction history for a student.

**Query Parameters:**
- `limit` (optional): Number of interactions to return (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "studentId": "student123",
    "summary": {
      "totalInteractions": 20,
      "averageProcessingTime": 2800,
      "successRate": 95,
      "typeDistribution": {
        "question_generation": 12,
        "session_analysis": 8
      }
    },
    "recentInteractions": [
      {
        "id": "ai123",
        "timestamp": "2025-10-18T10:00:00Z",
        "analysisType": "question_generation",
        "success": true,
        "processingTimeMs": 3000,
        "toolCallsUsed": ["queryPastPerformance"],
        "iterations": 1
      }
    ]
  }
}
```

---

### 6. Get AI Performance Metrics
**Endpoint:** `GET /api/analytics/ai/performance?hours=24`

**Description:** Get overall AI agent performance metrics for a time period.

**Query Parameters:**
- `hours` (optional): Time range in hours (default: 24)

**Response:**
```json
{
  "success": true,
  "data": {
    "timeRange": "Last 24 hours",
    "summary": {
      "totalInteractions": 150,
      "successCount": 145,
      "failureCount": 5,
      "successRate": 97,
      "performance": {
        "avgProcessingTime": 2800,
        "maxProcessingTime": 8500,
        "minProcessingTime": 1200,
        "avgIterations": "1.2",
        "maxIterations": 3
      }
    },
    "typeDistribution": {
      "question_generation": 90,
      "session_analysis": 60
    },
    "toolUsage": [
      {
        "tool": "queryPastPerformance",
        "callCount": 85,
        "avgExecutionTime": 450
      },
      {
        "tool": "calculateDifficulty",
        "callCount": 60,
        "avgExecutionTime": 120
      }
    ]
  }
}
```

---

### 7. Get AI Failures
**Endpoint:** `GET /api/analytics/ai/failures?limit=10`

**Description:** Get recent AI agent failures for debugging.

**Query Parameters:**
- `limit` (optional): Number of failures to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "failures": [
      {
        "timestamp": "2025-10-18T09:30:00Z",
        "attemptId": "attempt123",
        "studentId": "student123",
        "analysisType": "question_generation",
        "error": "API quota exceeded",
        "processingTimeMs": 5000,
        "toolCallsAttempted": ["queryPastPerformance"]
      }
    ]
  }
}
```

---

### 8. Get AI Detail
**Endpoint:** `GET /api/analytics/ai/detail/:id`

**Description:** Get full details of a specific AI interaction for debugging (includes prompts and responses).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ai123",
    "attemptId": "attempt123",
    "studentId": "student123",
    "session": 1,
    "timestamp": "2025-10-18T10:00:00Z",
    "analysisType": "question_generation",
    "model": "gemini-2.0-flash-exp",
    "prompt": "Generate 5 JavaScript questions for a student with 70% accuracy...",
    "inputData": {
      "topic": "JavaScript",
      "difficulty": "medium",
      "numQuestions": 5
    },
    "toolCallsUsed": [
      {
        "toolName": "queryPastPerformance",
        "arguments": { "studentId": "student123", "topic": "JavaScript" },
        "result": { "accuracy": 0.7, "testsCompleted": 3 },
        "success": true,
        "executionTimeMs": 450
      }
    ],
    "iterations": 1,
    "response": "Generated 5 questions successfully...",
    "questionsGenerated": 5,
    "processingTimeMs": 3200,
    "success": true
  }
}
```

---

## Combined Analytics Endpoint

### 9. Get Dashboard Data
**Endpoint:** `GET /api/analytics/dashboard/:studentId`

**Description:** Get combined analytics dashboard data for a student (performance + AI insights).

**Response:**
```json
{
  "success": true,
  "data": {
    "student": {
      "studentId": "student123",
      "overallAccuracy": 75,
      "testsCompleted": 5,
      "strengths": ["JavaScript", "Python"],
      "weaknesses": ["Algorithms"]
    },
    "recentTopics": [
      {
        "topic": "JavaScript",
        "accuracy": 80,
        "testsCount": 3
      }
    ],
    "difficultyTrend": [
      {
        "difficulty": "medium",
        "accuracy": 70,
        "timestamp": "2025-10-18T08:00:00Z"
      }
    ],
    "aiInsights": {
      "totalInteractions": 5,
      "averageProcessingTime": 2800
    }
  }
}
```

---

## Usage Examples

### JavaScript (Fetch)
```javascript
// Get student analytics
const response = await fetch('http://localhost:3000/api/analytics/student/student123');
const data = await response.json();
console.log('Overall Accuracy:', data.data.overview.overallAccuracy);

// Get AI performance metrics
const aiMetrics = await fetch('http://localhost:3000/api/analytics/ai/performance?hours=48');
const metrics = await aiMetrics.json();
console.log('Success Rate:', metrics.data.summary.successRate);
```

### cURL Examples
```bash
# Get student analytics
curl http://localhost:3000/api/analytics/student/student123

# Get leaderboard (top 5)
curl http://localhost:3000/api/analytics/leaderboard?limit=5

# Get AI failures
curl http://localhost:3000/api/analytics/ai/failures?limit=5

# Get dashboard data
curl http://localhost:3000/api/analytics/dashboard/student123
```

### Python Example
```python
import requests

# Get student analytics
response = requests.get('http://localhost:3000/api/analytics/student/student123')
data = response.json()
print(f"Overall Accuracy: {data['data']['overview']['overallAccuracy']}%")

# Get AI performance
ai_response = requests.get('http://localhost:3000/api/analytics/ai/performance', 
                          params={'hours': 24})
ai_data = ai_response.json()
print(f"AI Success Rate: {ai_data['data']['summary']['successRate']}%")
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `404` - Resource not found
- `500` - Internal server error

---

## Testing Queries

### MongoDB Shell Queries
```javascript
// View all student analytics
db.studentanalytics.find().pretty()

// View AI analysis for a student
db.aianalyses.find({ studentId: "student123" }).sort({ timestamp: -1 }).limit(5).pretty()

// Find failed AI interactions
db.aianalyses.find({ success: false }).pretty()

// Get processing time statistics
db.aianalyses.aggregate([
  {
    $group: {
      _id: "$analysisType",
      avgTime: { $avg: "$processingTimeMs" },
      count: { $sum: 1 }
    }
  }
])
```

---

## Next Steps

1. **Create a Dashboard UI** - Build React components to visualize this data
2. **Add Authentication** - Secure endpoints with JWT authentication
3. **Add Filtering** - Add date range and filter parameters
4. **Real-time Updates** - Implement WebSocket for live analytics
5. **Export Functionality** - Add CSV/PDF export for reports

---

## Benefits

### For Students
- Track progress across all topics
- See strengths and weaknesses
- Monitor difficulty progression
- Understand learning patterns

### For Teachers
- View class-wide performance
- Identify struggling students
- Compare topic difficulty
- Track engagement metrics

### For Developers
- Debug AI agent behavior
- Optimize prompts and processing
- Monitor system performance
- Identify bottlenecks

---

**Documentation Version:** 1.0.0  
**Last Updated:** October 18, 2025  
**API Version:** v1
