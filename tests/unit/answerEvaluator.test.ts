import { describe, expect, it } from 'vitest';
import { calculateStars, evaluateAnswer, normalizeText } from '../../src/domain/answerEvaluator';
import type { ExerciseItem } from '../../src/domain/types';

describe('AnswerEvaluator', () => {
  it('normalizes whitespace, case, and typographic apostrophes', () => {
    expect(normalizeText('  ISN’T  ')).toBe("isn't");
    expect(normalizeText('  is   not ')).toBe('is not');
  });

  it('accepts valid contraction variants in fill_blank', () => {
    const item: ExerciseItem = {
      id: 'ex-1',
      courseId: '3p',
      unitId: '3p-sa1-animals',
      skill: 'grammar',
      type: 'fill_blank',
      promptEs: 'Completa en negativo:',
      promptEn: 'No, it ___ a tiger.',
      acceptedAnswers: ["isn't", 'is not'],
      explanationEs: 'Negativo singular.',
      allowAudioInExam: false,
    };

    expect(evaluateAnswer(item, "  ISN’T ").isCorrect).toBe(true);
    expect(evaluateAnswer(item, 'is not').isCorrect).toBe(true);
    expect(evaluateAnswer(item, "aren't").isCorrect).toBe(false);
  });

  it('evaluates matching exercises requiring all pairs to match', () => {
    const item: ExerciseItem = {
      id: 'ex-match',
      courseId: '5p',
      unitId: '5p-sa4-my-weekend',
      skill: 'irregular_verbs',
      type: 'matching',
      promptEs: 'Empareja:',
      pairs: [
        { left: 'eat', right: 'ate' },
        { left: 'buy', right: 'bought' },
        { left: 'have', right: 'had' },
      ],
      acceptedAnswers: ['eat → ate | buy → bought | have → had'],
      explanationEs: 'Pasados irregulares.',
      allowAudioInExam: true,
    };

    expect(evaluateAnswer(item, { eat: 'ate', buy: 'bought', have: 'had' }).isCorrect).toBe(true);
    expect(evaluateAnswer(item, { eat: 'ate', buy: 'had', have: 'bought' }).isCorrect).toBe(false);
  });

  it('calculates star ratings accurately', () => {
    expect(calculateStars(10, 10)).toBe(3);
    expect(calculateStars(9, 10)).toBe(3);
    expect(calculateStars(7, 10)).toBe(2);
    expect(calculateStars(5, 10)).toBe(1);
    expect(calculateStars(4, 10)).toBe(0);
  });
});
