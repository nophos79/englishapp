import { describe, expect, it } from 'vitest';
import { getAllExercises } from '../../src/data/curriculum';
import { generateExamExercises } from '../../src/domain/examGenerator';

describe('ExamGenerator', () => {
  const pool = getAllExercises();

  it('selects balanced questions across multiple selected units without duplicates', () => {
    const result = generateExamExercises({
      courseId: '5p',
      unitIds: ['5p-sa1-school', '5p-sa2-in-nature'],
      skillFocus: 'mixed',
      questionCount: 6,
      pool,
      rng: () => 0.42,
    });

    expect(result.exerciseIds.length).toBe(6);
    expect(new Set(result.exerciseIds).size).toBe(6);
    expect(result.adjusted).toBe(false);
  });

  it('adjusts cleanly when requested questionCount exceeds available exercises', () => {
    const result = generateExamExercises({
      courseId: '3p',
      unitIds: ['3p-fest-t3'],
      skillFocus: 'mixed',
      questionCount: 50,
      pool,
      rng: () => 0.5,
    });

    expect(result.adjusted).toBe(true);
    expect(result.exerciseIds.length).toBe(result.availableCount);
    expect(result.exerciseIds.length).toBeGreaterThan(0);
  });

  it('includes irregular verbs bank when selected alongside course units', () => {
    const result = generateExamExercises({
      courseId: '5p',
      unitIds: ['5p-sa4-my-weekend', 'bank-irregular-verbs'],
      skillFocus: 'grammar',
      questionCount: 8,
      pool,
      rng: () => 0.3,
    });

    expect(result.exerciseIds.length).toBe(8);
    expect(result.exerciseIds.some((id) => id.startsWith('bank-iv-'))).toBe(true);
  });
});
