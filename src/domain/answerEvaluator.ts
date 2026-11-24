import type { ExerciseItem } from './types';

export interface EvaluationResult {
  isCorrect: boolean;
  normalizedSubmitted: string;
  expectedAnswers: string[];
  explanationEs: string;
}

export function normalizeText(input: string): string {
  return input
    .trim()
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function evaluateAnswer(
  item: ExerciseItem,
  submitted: string | Record<string, string>,
): EvaluationResult {
  if (item.type === 'matching' || item.type === 'word_builder') {
    const pairs = item.pairs ?? [];
    const submittedMap = typeof submitted === 'object' && submitted !== null ? submitted : {};
    const allMatch =
      pairs.length > 0 &&
      pairs.every((pair) => {
        const chosen = submittedMap[pair.left] ?? '';
        return normalizeText(chosen) === normalizeText(pair.right);
      });

    const sep = item.type === 'word_builder' ? ' + ' : ' → ';
    const formattedSubmitted = pairs
      .map((p) => `${p.left}${sep}${submittedMap[p.left] ?? '—'}`)
      .join(' | ');
    const formattedExpected = pairs
      .map((p) => (item.type === 'word_builder' ? `${p.left}${p.right}` : `${p.left} → ${p.right}`))
      .join(' | ');

    return {
      isCorrect: allMatch,
      normalizedSubmitted: formattedSubmitted,
      expectedAnswers: [formattedExpected],
      explanationEs: item.explanationEs,
    };
  }

  const rawText = typeof submitted === 'string' ? submitted : '';
  const normalizedSubmitted = normalizeText(rawText);
  const normalizedAccepted = item.acceptedAnswers.map(normalizeText);
  const isCorrect = normalizedSubmitted.length > 0 && normalizedAccepted.includes(normalizedSubmitted);

  return {
    isCorrect,
    normalizedSubmitted: rawText.trim(),
    expectedAnswers: item.acceptedAnswers,
    explanationEs: item.explanationEs,
  };
}

export function calculateScorePercent(correctCount: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return Math.round((correctCount / totalQuestions) * 100);
}

export function calculateStars(correctCount: number, totalQuestions: number): 0 | 1 | 2 | 3 {
  const pct = calculateScorePercent(correctCount, totalQuestions);
  if (pct >= 90) return 3;
  if (pct >= 70) return 2;
  if (pct >= 50) return 1;
  return 0;
}
