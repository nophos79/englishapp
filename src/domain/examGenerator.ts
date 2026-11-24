import { shuffleArray } from './randomizer';
import type { CourseId, ExerciseItem, SkillFocus } from './types';

export interface ExamGenerationInput {
  courseId: CourseId;
  unitIds: string[];
  skillFocus: SkillFocus;
  questionCount: number;
  pool: ExerciseItem[];
  rng?: () => number;
}

export interface ExamGenerationResult {
  exerciseIds: string[];
  availableCount: number;
  adjusted: boolean;
}

export function generateExamExercises(input: ExamGenerationInput): ExamGenerationResult {
  const rng = input.rng ?? Math.random;
  const selectedUnits = new Set(input.unitIds);

  const eligible = input.pool.filter((item) => {
    const unitMatch = selectedUnits.has(item.unitId);
    if (!unitMatch) return false;
    const isBank = item.unitId.startsWith('bank-');
    if (!isBank && item.courseId !== input.courseId) return false;
    if (input.skillFocus === 'vocabulary') {
      return item.skill === 'vocabulary' || item.skill === 'expressions';
    }
    if (input.skillFocus === 'grammar') {
      return item.skill === 'grammar' || item.skill === 'irregular_verbs';
    }
    return true;
  });

  const availableCount = eligible.length;
  const targetCount = Math.max(0, Math.min(input.questionCount, availableCount));
  const adjusted = input.questionCount > availableCount;

  // Group by unit for balanced selection across multiple selected units
  const buckets = new Map<string, ExerciseItem[]>();
  for (const unitId of input.unitIds) {
    const itemsForUnit = eligible.filter((e) => e.unitId === unitId);
    if (itemsForUnit.length > 0) {
      buckets.set(unitId, shuffleArray(itemsForUnit, rng));
    }
  }

  const picked: ExerciseItem[] = [];
  const unitKeys = shuffleArray(Array.from(buckets.keys()), rng);

  let round = 0;
  while (picked.length < targetCount && unitKeys.length > 0) {
    let addedInRound = false;
    for (const key of unitKeys) {
      if (picked.length >= targetCount) break;
      const bucket = buckets.get(key);
      if (bucket && round < bucket.length) {
        picked.push(bucket[round]);
        addedInRound = true;
      }
    }
    if (!addedInRound) break;
    round++;
  }

  const finalOrder = shuffleArray(picked, rng);
  return {
    exerciseIds: finalOrder.map((e) => e.id),
    availableCount,
    adjusted,
  };
}
