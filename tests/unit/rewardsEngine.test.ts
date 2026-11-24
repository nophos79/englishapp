import { describe, expect, it } from 'vitest';
import { getExerciseById } from '../../src/data/curriculum';
import {
  calculateAttemptXp,
  classifyAttemptActivity,
  computeFamilyGoalProgress,
  computeStudentRewards,
  getMetricCurrentValue,
} from '../../src/domain/rewardsEngine';
import type { AnswerDetail, AttemptRecord, FamilyRewardGoal } from '../../src/domain/types';

function makeAttempt(overrides: Partial<AttemptRecord> = {}): AttemptRecord {
  return {
    id: 'att-1',
    familyId: 'fam-1',
    studentId: 'stu-1',
    mode: 'practice',
    unitId: '5p-sa1-school',
    examId: null,
    status: 'completed',
    totalQuestions: 5,
    correctCount: 5,
    scorePercent: 100,
    stars: 3,
    startedAt: '2026-11-24T10:00:00',
    finishedAt: '2026-11-24T10:05:00',
    durationSeconds: 300,
    answersDetail: [],
    ...overrides,
  };
}

describe('RewardsEngine', () => {
  it('calculates XP with completion, perfect, exam, mistake-review bonuses and anti-farming dampening', () => {
    const perfectPractice = makeAttempt({ correctCount: 5, scorePercent: 100, totalQuestions: 5 });
    // 5*10 + 10 (complete) + 15 (100%) = 75 XP
    expect(calculateAttemptXp(perfectPractice, 0)).toBe(75);
    expect(calculateAttemptXp(perfectPractice, 1)).toBe(75);
    // 3rd+ same-day repeat is dampened to ~30%
    expect(calculateAttemptXp(perfectPractice, 2)).toBe(23);

    const examAttempt = makeAttempt({
      mode: 'exam',
      unitId: null,
      examId: 'ex-1',
      totalQuestions: 4,
      correctCount: 3,
      scorePercent: 75,
    });
    // 3*10 + 25 (passed exam) = 55 XP
    expect(calculateAttemptXp(examAttempt, 0)).toBe(55);

    const mistakeAttempt = makeAttempt({
      mode: 'mistake_review',
      unitId: 'mistakes',
      totalQuestions: 3,
      correctCount: 2,
      scorePercent: 67,
    });
    // 2*10 + 10 (complete) + 2*15 (mistake bonus) = 60 XP
    expect(calculateAttemptXp(mistakeAttempt, 0)).toBe(60);

    const abandoned = makeAttempt({ status: 'abandoned', correctCount: 2, scorePercent: 40 });
    expect(calculateAttemptXp(abandoned, 0)).toBe(0);
  });

  it('tracks ranks from Starter Explorer upward cleanly', () => {
    const now = new Date(2026, 10, 25, 12, 0, 0);
    const low = computeStudentRewards([makeAttempt({ finishedAt: '2026-11-25T10:00:00' })], { now });
    expect(low.totalXp).toBe(75);
    expect(low.rank.level).toBe(1);
    expect(low.nextRank?.level).toBe(2);

    const level2 = computeStudentRewards(
      [
        makeAttempt({ id: 'a1', unitId: '5p-starter', finishedAt: '2026-11-23T10:00:00' }),
        makeAttempt({ id: 'a2', unitId: '5p-sa1-school', finishedAt: '2026-11-24T10:00:00' }),
      ],
      { now },
    );
    expect(level2.totalXp).toBe(150);
    expect(level2.rank.level).toBe(2);
    expect(level2.rank.title).toBe('London Walker');
  });

  it('tracks friendly 7-day weekly goal and unlocks Listening, Reading, Mistake, Exam & Star stamps', () => {
    const now = new Date(2026, 10, 25, 18, 0, 0); // Wednesday 25 Nov 2026
    const listeningDetail: AnswerDetail[] = Array.from({ length: 10 }, () => ({
      exerciseId: '5p-sa1-lc1',
      unitId: '5p-sa1-school',
      submittedAnswer: 'x',
      expectedAnswers: ['x'],
      isCorrect: true,
    }));
    const readingDetail: AnswerDetail[] = Array.from({ length: 10 }, () => ({
      exerciseId: '5p-sa1-rd1',
      unitId: '5p-sa1-school',
      submittedAnswer: 'x',
      expectedAnswers: ['x'],
      isCorrect: true,
    }));

    const attempts: AttemptRecord[] = [
      makeAttempt({
        id: 'mon',
        unitId: '5p-starter',
        stars: 3,
        finishedAt: '2026-11-23T16:00:00',
        answersDetail: listeningDetail,
      }),
      makeAttempt({
        id: 'tue',
        unitId: '5p-sa1-school',
        stars: 3,
        finishedAt: '2026-11-24T16:00:00',
        answersDetail: readingDetail,
      }),
      makeAttempt({
        id: 'wed-units-3',
        unitId: '5p-sa2-in-nature',
        stars: 3,
        finishedAt: '2026-11-25T10:00:00',
      }),
      makeAttempt({
        id: 'wed-units-4',
        unitId: '5p-sa3-carnival',
        stars: 3,
        finishedAt: '2026-11-25T11:00:00',
      }),
      makeAttempt({
        id: 'wed-units-5',
        unitId: '5p-sa4-my-weekend',
        stars: 3,
        finishedAt: '2026-11-25T12:00:00',
      }),
      makeAttempt({
        id: 'wed-mistakes',
        mode: 'mistake_review',
        unitId: 'mistakes',
        totalQuestions: 3,
        correctCount: 3,
        scorePercent: 100,
        stars: 3,
        finishedAt: '2026-11-25T13:00:00',
      }),
      makeAttempt({
        id: 'wed-exam',
        mode: 'exam',
        unitId: null,
        examId: 'ex-1',
        totalQuestions: 5,
        correctCount: 4,
        scorePercent: 80,
        stars: 2,
        finishedAt: '2026-11-25T14:00:00',
      }),
    ];

    const summary = computeStudentRewards(attempts, { now, lookupExercise: getExerciseById });

    expect(summary.weeklyDaysPracticed).toBe(3);
    expect(summary.totalEarnedStars).toBe(17); // 5 units * 3 + 2 exam stars
    expect(summary.badges.find((b) => b.id === 'first_step')?.earned).toBe(true);
    expect(summary.badges.find((b) => b.id === 'perfect_score')?.earned).toBe(true);
    expect(summary.badges.find((b) => b.id === 'listening_ear')?.earned).toBe(true);
    expect(summary.badges.find((b) => b.id === 'bookworm')?.earned).toBe(true);
    expect(summary.badges.find((b) => b.id === 'mistake_hunter')?.earned).toBe(true);
    expect(summary.badges.find((b) => b.id === 'weekly_champ')?.earned).toBe(true);
    expect(summary.badges.find((b) => b.id === 'exam_hero')?.earned).toBe(true);
    expect(summary.badges.find((b) => b.id === 'star_collector')?.earned).toBe(true);
    expect(summary.badges.find((b) => b.id === 'multi_explorer')?.earned).toBe(true);

    const goal: FamilyRewardGoal = {
      id: 'g1',
      familyId: 'fam-1',
      studentId: 'stu-1',
      title: 'Elegir la película del viernes',
      metric: 'stars',
      targetValue: 10,
      baselineValue: 7,
      status: 'active',
      createdAt: '2026-11-23T09:00:00',
    };

    const progress = computeFamilyGoalProgress(goal, summary);
    expect(progress.current).toBe(10);
    expect(progress.percent).toBe(100);
    expect(progress.reached).toBe(true);
  });

  it('classifies distinct activity modes, ignores repeats, unlocks Todo Terreno, and evaluates all 6 metrics', () => {
    const detail = (exerciseId: string): AnswerDetail => ({
      exerciseId,
      unitId: '3p-sa1-animals',
      submittedAnswer: 'x',
      expectedAnswers: ['x'],
      isCorrect: true,
    });

    const vocabAttempt = makeAttempt({
      id: 'd-vocab',
      unitId: '3p-sa1-animals',
      totalQuestions: 2,
      correctCount: 2,
      scorePercent: 100,
      finishedAt: '2026-11-23T10:00:00',
      answersDetail: [detail('3p-sa1-v1'), detail('3p-sa1-v2')],
    });
    const grammarAttempt = makeAttempt({
      id: 'd-grammar',
      unitId: '3p-sa1-animals',
      totalQuestions: 2,
      correctCount: 2,
      scorePercent: 100,
      finishedAt: '2026-11-23T11:00:00',
      answersDetail: [detail('3p-sa1-g1'), detail('3p-sa1-g2')],
    });
    const listeningAttempt1 = makeAttempt({
      id: 'd-listen-1',
      unitId: '3p-sa1-animals',
      totalQuestions: 2,
      correctCount: 2,
      scorePercent: 100,
      finishedAt: '2026-11-24T10:00:00',
      answersDetail: [detail('3p-sa1-lc1'), detail('3p-sa1-ld1')],
    });
    const listeningRepeatSameUnit = makeAttempt({
      id: 'd-listen-2',
      unitId: '3p-sa1-animals',
      totalQuestions: 2,
      correctCount: 2,
      scorePercent: 100,
      finishedAt: '2026-11-24T12:00:00',
      answersDetail: [detail('3p-sa1-lc1'), detail('3p-sa1-ld1')],
    });
    const readingAttempt = makeAttempt({
      id: 'd-read',
      unitId: '3p-sa1-animals',
      totalQuestions: 2,
      correctCount: 1,
      scorePercent: 50,
      stars: 1,
      finishedAt: '2026-11-25T10:00:00',
      answersDetail: [detail('3p-sa1-rd1'), { ...detail('3p-sa1-rd2'), isCorrect: false }],
    });

    expect(classifyAttemptActivity(vocabAttempt, getExerciseById)).toEqual({
      key: '3p-sa1-animals:vocabulary',
      category: 'vocabulary',
    });
    expect(classifyAttemptActivity(grammarAttempt, getExerciseById)).toEqual({
      key: '3p-sa1-animals:grammar',
      category: 'grammar',
    });
    expect(classifyAttemptActivity(listeningAttempt1, getExerciseById)).toEqual({
      key: '3p-sa1-animals:listening',
      category: 'listening',
    });
    expect(classifyAttemptActivity(readingAttempt, getExerciseById)).toEqual({
      key: '3p-sa1-animals:reading',
      category: 'reading',
    });

    const summary = computeStudentRewards(
      [vocabAttempt, grammarAttempt, listeningAttempt1, listeningRepeatSameUnit, readingAttempt],
      { now: new Date(2026, 10, 25, 12, 0, 0), lookupExercise: getExerciseById },
    );

    // 5 sessions total, but listening repeat does NOT inflate distinctActivitiesCount (remains 4)
    expect(summary.completedSessionsCount).toBe(5);
    expect(summary.distinctActivitiesCount).toBe(4);
    expect(summary.totalPracticeDaysCount).toBe(3);
    expect(summary.totalCorrectAnswersCount).toBe(9);
    expect(summary.completedSkillModesCount).toBe(4);
    expect(summary.badges.find((b) => b.id === 'all_rounder')?.earned).toBe(true);

    expect(getMetricCurrentValue('distinct_activities', summary)).toBe(4);
    expect(getMetricCurrentValue('days', summary)).toBe(3);
    expect(getMetricCurrentValue('correct_answers', summary)).toBe(9);
    expect(getMetricCurrentValue('xp', summary)).toBe(summary.totalXp);

    const distinctGoal: FamilyRewardGoal = {
      id: 'g2',
      familyId: 'fam-1',
      studentId: 'stu-1',
      title: 'Hacer un postre juntos',
      metric: 'distinct_activities',
      targetValue: 4,
      baselineValue: 0,
      status: 'active',
      createdAt: '2026-11-23T09:00:00',
    };
    const distinctProgress = computeFamilyGoalProgress(distinctGoal, summary);
    expect(distinctProgress.reached).toBe(true);
    expect(distinctProgress.percent).toBe(100);
  });
});
