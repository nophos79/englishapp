import { calculateScorePercent, calculateStars, evaluateAnswer, type EvaluationResult } from './answerEvaluator';
import { shuffleArray } from './randomizer';
import type { AnswerDetail, AttemptMode, AttemptRecord, ExerciseItem } from './types';

export interface PracticeQuestionState {
  exercise: ExerciseItem;
  shuffledOptions?: string[];
  shuffledRightPairs?: string[];
  submitted: boolean;
  evaluation?: EvaluationResult;
}

export interface PracticeSessionState {
  mode: AttemptMode;
  questions: PracticeQuestionState[];
  currentIndex: number;
  startedAt: string;
  finished: boolean;
}

export function createPracticeSession(
  exercises: ExerciseItem[],
  mode: AttemptMode,
  rng: () => number = Math.random,
  startedAt: string = new Date().toISOString(),
): PracticeSessionState {
  const ordered = shuffleArray(exercises, rng);
  const questions: PracticeQuestionState[] = ordered.map((exercise) => ({
    exercise,
    shuffledOptions: exercise.options ? shuffleArray(exercise.options, rng) : undefined,
    shuffledRightPairs: exercise.pairs
      ? shuffleArray(
          exercise.pairs.map((p) => p.right),
          rng,
        )
      : undefined,
    submitted: false,
  }));

  return {
    mode,
    questions,
    currentIndex: 0,
    startedAt,
    finished: questions.length === 0,
  };
}

/**
 * Anti-cheat rule: once a question is submitted in practice mode, it CANNOT be re-submitted or altered.
 */
export function submitPracticeAnswer(
  state: PracticeSessionState,
  submitted: string | Record<string, string>,
): PracticeSessionState {
  const current = state.questions[state.currentIndex];
  if (!current || current.submitted) {
    return state;
  }

  const evaluation = evaluateAnswer(current.exercise, submitted);
  const updatedQuestions = state.questions.map((q, idx) =>
    idx === state.currentIndex ? { ...q, submitted: true, evaluation } : q,
  );

  return {
    ...state,
    questions: updatedQuestions,
  };
}

export function advancePracticeQuestion(state: PracticeSessionState): PracticeSessionState {
  const current = state.questions[state.currentIndex];
  if (!current || !current.submitted) {
    return state;
  }

  const nextIndex = state.currentIndex + 1;
  if (nextIndex >= state.questions.length) {
    return {
      ...state,
      finished: true,
    };
  }

  return {
    ...state,
    currentIndex: nextIndex,
  };
}

export function buildAttemptRecord(params: {
  id: string;
  familyId: string;
  studentId: string;
  mode: AttemptMode;
  unitId?: string | null;
  examId?: string | null;
  status: 'completed' | 'abandoned';
  startedAt: string;
  finishedAt?: string;
  answersDetail: AnswerDetail[];
  totalQuestions: number;
}): AttemptRecord {
  const finishedAt = params.finishedAt ?? new Date().toISOString();
  const correctCount = params.answersDetail.filter((a) => a.isCorrect).length;
  const totalQuestions = Math.max(1, params.totalQuestions);
  const durationSeconds = Math.max(
    0,
    Math.round((new Date(finishedAt).getTime() - new Date(params.startedAt).getTime()) / 1000),
  );

  return {
    id: params.id,
    familyId: params.familyId,
    studentId: params.studentId,
    mode: params.mode,
    unitId: params.unitId ?? null,
    examId: params.examId ?? null,
    status: params.status,
    totalQuestions,
    correctCount,
    scorePercent: calculateScorePercent(correctCount, totalQuestions),
    stars: calculateStars(correctCount, totalQuestions),
    startedAt: params.startedAt,
    finishedAt,
    durationSeconds,
    answersDetail: params.answersDetail,
  };
}
