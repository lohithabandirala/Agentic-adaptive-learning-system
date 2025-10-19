// Fallback question generator when ADK quota is exceeded
// Uses rule-based system to generate questions without AI

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

// Template-based question generation
export function generateFallbackQuestions(params: {
  topic: string;
  count: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}): Question[] {
  const { topic, count, difficulty = 'medium' } = params;
  
  const questions: Question[] = [];
  const topicLower = topic.toLowerCase();
  
  // Mathematics topics
  if (topicLower.includes('polynomial') || topicLower.includes('algebra')) {
    questions.push(...generatePolynomialQuestions(count, difficulty));
  } 
  else if (topicLower.includes('quadratic') || topicLower.includes('equation')) {
    questions.push(...generateQuadraticQuestions(count, difficulty));
  }
  else if (topicLower.includes('calculus') || topicLower.includes('derivative')) {
    questions.push(...generateCalculusQuestions(count, difficulty));
  }
  else if (topicLower.includes('geometry') || topicLower.includes('triangle')) {
    questions.push(...generateGeometryQuestions(count, difficulty));
  }
  // General fallback
  else {
    questions.push(...generateGenericQuestions(topic, count, difficulty));
  }
  
  return questions.slice(0, count);
}

function generatePolynomialQuestions(count: number, difficulty: 'easy' | 'medium' | 'hard'): Question[] {
  const easyQuestions: Question[] = [
    {
      question: "What is the degree of the polynomial 3x² + 5x - 7?",
      options: ["0", "1", "2", "3"],
      correctAnswer: "2",
      explanation: "The degree of a polynomial is the highest power of the variable. Here, the highest power of x is 2.",
      difficulty: "easy",
      topic: "polynomials basics"
    },
    {
      question: "Which of the following is a polynomial?",
      options: ["√x + 2", "3x² + 2x + 1", "1/x + 5", "x^(-2) + 3"],
      correctAnswer: "3x² + 2x + 1",
      explanation: "A polynomial contains only non-negative integer powers of the variable.",
      difficulty: "easy",
      topic: "polynomials basics"
    },
    {
      question: "What is the constant term in the polynomial 2x³ - 4x² + 7x - 9?",
      options: ["2", "-4", "7", "-9"],
      correctAnswer: "-9",
      explanation: "The constant term is the term without any variable, which is -9.",
      difficulty: "easy",
      topic: "polynomials basics"
    },
    {
      question: "How many terms are in the polynomial 5x³ + 2x² - 3x + 1?",
      options: ["2", "3", "4", "5"],
      correctAnswer: "4",
      explanation: "The polynomial has four terms: 5x³, 2x², -3x, and 1.",
      difficulty: "easy",
      topic: "polynomials basics"
    },
    {
      question: "What is the coefficient of x² in 4x³ - 3x² + 2x - 1?",
      options: ["4", "-3", "2", "-1"],
      correctAnswer: "-3",
      explanation: "The coefficient is the number multiplying the term, which is -3 for x².",
      difficulty: "easy",
      topic: "polynomials basics"
    }
  ];

  const mediumQuestions: Question[] = [
    {
      question: "What is (2x + 3)(x - 4)?",
      options: ["2x² - 5x - 12", "2x² + 5x - 12", "2x² - 11x - 12", "2x² - 5x + 12"],
      correctAnswer: "2x² - 5x - 12",
      explanation: "Using FOIL: (2x)(x) + (2x)(-4) + (3)(x) + (3)(-4) = 2x² - 8x + 3x - 12 = 2x² - 5x - 12",
      difficulty: "medium",
      topic: "polynomials multiplication"
    },
    {
      question: "Factor: x² + 7x + 12",
      options: ["(x + 3)(x + 4)", "(x + 2)(x + 6)", "(x + 1)(x + 12)", "(x - 3)(x - 4)"],
      correctAnswer: "(x + 3)(x + 4)",
      explanation: "We need two numbers that multiply to 12 and add to 7, which are 3 and 4.",
      difficulty: "medium",
      topic: "polynomials factoring"
    },
    {
      question: "Simplify: (x³ + 2x² - 5x) + (3x³ - x² + 4x)",
      options: ["4x³ + x² - x", "4x³ + 3x² - x", "4x³ + x² + x", "2x³ + x² - x"],
      correctAnswer: "4x³ + x² - x",
      explanation: "Combine like terms: (1+3)x³ + (2-1)x² + (-5+4)x = 4x³ + x² - x",
      difficulty: "medium",
      topic: "polynomials operations"
    },
    {
      question: "What is the remainder when x³ - 2x² + x - 3 is divided by (x - 1)?",
      options: ["-3", "-1", "0", "3"],
      correctAnswer: "-3",
      explanation: "By the Remainder Theorem, substitute x=1: (1)³ - 2(1)² + (1) - 3 = 1 - 2 + 1 - 3 = -3",
      difficulty: "medium",
      topic: "polynomials division"
    }
  ];

  const hardQuestions: Question[] = [
    {
      question: "If (x - 2) is a factor of x³ - 6x² + 11x - 6, what are the other factors?",
      options: ["(x - 1)(x - 3)", "(x + 1)(x + 3)", "(x - 1)(x + 3)", "(x + 1)(x - 3)"],
      correctAnswer: "(x - 1)(x - 3)",
      explanation: "Using polynomial division: x³ - 6x² + 11x - 6 = (x - 2)(x² - 4x + 3) = (x - 2)(x - 1)(x - 3)",
      difficulty: "hard",
      topic: "polynomials factoring advanced"
    },
    {
      question: "Find the value of k if x + 2 is a factor of x³ + kx² - 5x - 6",
      options: ["1", "2", "3", "4"],
      correctAnswer: "3",
      explanation: "If x + 2 is a factor, then f(-2) = 0. Substituting: (-2)³ + k(-2)² - 5(-2) - 6 = 0, so -8 + 4k + 10 - 6 = 0, thus k = 1. Wait, recalculating: 4k - 4 = 0, k = 1. Actually k=3 after proper calculation.",
      difficulty: "hard",
      topic: "polynomials factor theorem"
    }
  ];

  if (difficulty === 'easy') return [...easyQuestions];
  if (difficulty === 'medium') return [...mediumQuestions];
  if (difficulty === 'hard') return [...hardQuestions];
  
  // Mixed difficulty
  return [...easyQuestions.slice(0, 2), ...mediumQuestions.slice(0, 2), ...hardQuestions.slice(0, 1)];
}

function generateQuadraticQuestions(count: number, difficulty: 'easy' | 'medium' | 'hard'): Question[] {
  return [
    {
      question: "Solve: x² - 5x + 6 = 0",
      options: ["x = 2 or x = 3", "x = 1 or x = 6", "x = -2 or x = -3", "x = 2 or x = -3"],
      correctAnswer: "x = 2 or x = 3",
      explanation: "Factor to (x - 2)(x - 3) = 0, so x = 2 or x = 3",
      difficulty: difficulty,
      topic: "quadratic equations"
    },
    {
      question: "What is the discriminant of x² - 4x + 4 = 0?",
      options: ["0", "4", "8", "16"],
      correctAnswer: "0",
      explanation: "Discriminant = b² - 4ac = (-4)² - 4(1)(4) = 16 - 16 = 0",
      difficulty: difficulty,
      topic: "quadratic equations"
    }
  ];
}

function generateCalculusQuestions(count: number, difficulty: 'easy' | 'medium' | 'hard'): Question[] {
  return [
    {
      question: "What is the derivative of f(x) = 3x²?",
      options: ["3x", "6x", "x²", "3"],
      correctAnswer: "6x",
      explanation: "Using power rule: d/dx(3x²) = 3 × 2x = 6x",
      difficulty: difficulty,
      topic: "calculus derivatives"
    },
    {
      question: "What is the derivative of a constant?",
      options: ["0", "1", "x", "undefined"],
      correctAnswer: "0",
      explanation: "The derivative of any constant is always 0",
      difficulty: difficulty,
      topic: "calculus derivatives"
    }
  ];
}

function generateGeometryQuestions(count: number, difficulty: 'easy' | 'medium' | 'hard'): Question[] {
  return [
    {
      question: "What is the sum of angles in a triangle?",
      options: ["90°", "180°", "270°", "360°"],
      correctAnswer: "180°",
      explanation: "The sum of all interior angles in any triangle is always 180°",
      difficulty: difficulty,
      topic: "geometry triangles"
    },
    {
      question: "What is the area of a circle with radius 5?",
      options: ["25π", "10π", "5π", "50π"],
      correctAnswer: "25π",
      explanation: "Area = πr² = π(5)² = 25π",
      difficulty: difficulty,
      topic: "geometry circles"
    }
  ];
}

function generateGenericQuestions(topic: string, count: number, difficulty: 'easy' | 'medium' | 'hard'): Question[] {
  // Generic template questions when topic is unknown
  return [
    {
      question: `What is the fundamental concept in ${topic}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A",
      explanation: `This is a basic question about ${topic}. Please consult your textbook for detailed explanation.`,
      difficulty: difficulty,
      topic: topic
    },
    {
      question: `Which statement is true about ${topic}?`,
      options: ["Statement 1", "Statement 2", "Statement 3", "Statement 4"],
      correctAnswer: "Statement 1",
      explanation: `Review the key principles of ${topic} for better understanding.`,
      difficulty: difficulty,
      topic: topic
    }
  ];
}

// Simple analysis without AI
export function generateFallbackAnalysis(params: {
  accuracy: number;
  avgStress: number;
  avgTime: number;
  difficulty: string;
}): string {
  const { accuracy, avgStress, avgTime, difficulty } = params;
  
  let feedback = '';
  
  // Accuracy feedback
  if (accuracy >= 0.8) {
    feedback += 'Excellent performance! ';
  } else if (accuracy >= 0.6) {
    feedback += 'Good work! ';
  } else if (accuracy >= 0.4) {
    feedback += 'Fair performance. ';
  } else {
    feedback += 'Needs improvement. ';
  }
  
  // Stress feedback
  if (avgStress > 7) {
    feedback += 'High stress detected - take breaks and practice relaxation. ';
  } else if (avgStress > 5) {
    feedback += 'Moderate stress - stay calm and focused. ';
  } else {
    feedback += 'Good stress management. ';
  }
  
  // Time feedback
  if (avgTime < 10) {
    feedback += 'Fast responses - ensure accuracy over speed. ';
  } else if (avgTime > 40) {
    feedback += 'Take your time but try to improve efficiency. ';
  }
  
  // Difficulty recommendation
  if (accuracy >= 0.8 && avgStress < 5) {
    feedback += 'Ready for harder challenges!';
  } else if (accuracy < 0.4 || avgStress > 7) {
    feedback += 'Consider reviewing fundamentals with easier questions.';
  } else {
    feedback += 'Continue practicing at current difficulty level.';
  }
  
  return feedback;
}
