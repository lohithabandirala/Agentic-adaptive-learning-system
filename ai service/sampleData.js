/**
 * Sample student data for testing
 */
export const sampleStudentData = {
  studentId: "STU_2045",
  name: "Aarav Mehta",
  grade: 10,
  subjects: ["Mathematics", "Physics"],
  recentActivity: {
    lastLogin: "2025-10-15T14:30:00Z",
    totalTestsTaken: 8,
    averageCompletionTimeSec: 1420
  },
  performanceSummary: {
    overallAccuracy: 0.76,
    averageSpeedSec: 28,
    averageDifficultyLevel: 3,
    trend: "improving"
  },
  topicWisePerformance: {
    Algebra: {
      accuracy: 0.85,
      avgDifficulty: 3,
      recentErrors: ["simplifying expressions", "solving equations"]
    },
    "Quadratic Equations": {
      accuracy: 0.55,
      avgDifficulty: 3,
      recentErrors: ["discriminant interpretation", "root formula confusion"]
    },
    Geometry: {
      accuracy: 0.70,
      avgDifficulty: 2,
      recentErrors: ["circle theorems", "area calculation"]
    },
    Trigonometry: {
      accuracy: 0.62,
      avgDifficulty: 3,
      recentErrors: ["identities", "angle conversions"]
    }
  },
  emotionTracking: {
    averageFocusScore: 0.82,
    averageConfidenceScore: 0.68,
    stressLevel: "medium",
    notes: "Shows mild frustration on long problems."
  },
  learningPreferences: {
    preferredDifficulty: 3,
    preferredQuestionType: "MCQ",
    preferredMode: "Visual",
    studyTime: "Evening"
  },
  goals: {
    targetAccuracy: 0.85,
    focusTopics: ["Quadratic Equations", "Trigonometry"],
    examDate: "2025-11-30"
  }
};

/**
 * Sample topics for testing
 */
export const sampleTopics = {
  math: {
    algebra: "Algebraic Expressions and Equations",
    geometry: "Triangles and Circles",
    trigonometry: "Trigonometric Ratios and Identities",
    calculus: "Derivatives and Integrals"
  },
  science: {
    physics: "Newton's Laws of Motion",
    chemistry: "Chemical Bonding and Molecular Structure",
    biology: "Photosynthesis and Plant Biology"
  },
  other: {
    history: "World War II and Its Impact",
    geography: "Climate Zones and Weather Patterns",
    literature: "Shakespeare's Tragedies"
  }
};

export default {
  sampleStudentData,
  sampleTopics
};
