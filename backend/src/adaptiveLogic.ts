export type Difficulty = 'easy' | 'medium' | 'hard';

export function getNextDifficulty(current: Difficulty, isCorrect: boolean, stress: number): Difficulty {
  if (isCorrect && stress < 0.5) {
    if (current === 'easy') return 'medium';
    if (current === 'medium') return 'hard';
  } else if (!isCorrect && stress > 0.7) {
    if (current === 'hard') return 'medium';
    if (current === 'medium') return 'easy';
  }
  return current;
}
