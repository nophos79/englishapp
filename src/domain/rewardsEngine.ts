import type {
  AttemptRecord,
  ExerciseItem,
  FamilyRewardGoal,
  FamilyRewardMetric,
} from './types';

export interface ExplorerRank {
  level: number;
  title: string;
  emoji: string;
  minXp: number;
}

export interface PassportBadge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  earned: boolean;
  progressCurrent: number;
  progressTarget: number;
}

export interface WeekDayStatus {
  label: 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D';
  dateKey: string;
  practiced: boolean;
  isToday: boolean;
}

export type ActivityCategory =
  | 'vocabulary'
  | 'grammar'
  | 'listening'
  | 'reading'
  | 'full'
  | 'bank'
  | 'exam'
  | 'mistakes';

export interface ClassifiedActivity {
  key: string;
  category: ActivityCategory;
}

export interface StudentRewardsSummary {
  totalXp: number;
  rank: ExplorerRank;
  nextRank: ExplorerRank | null;
  xpIntoRank: number;
  xpForNextRank: number;
  rankProgressPercent: number;
  totalEarnedStars: number;
  completedSessionsCount: number;
  totalPracticeDaysCount: number;
  totalCorrectAnswersCount: number;
  distinctActivitiesCount: number;
  completedSkillModesCount: number;
  weekDaysStatus: WeekDayStatus[];
  weeklyDaysPracticed: number;
  weeklyTargetDays: number;
  weeklyQuestions: number;
  badges: PassportBadge[];
  earnedBadgesCount: number;
  totalBadgesCount: number;
}

export interface FamilyGoalProgress {
  current: number;
  target: number;
  percent: number;
  reached: boolean;
}

export interface FamilyRewardMetricMeta {
  id: FamilyRewardMetric;
  label: string;
  shortUnit: string;
  defaultTarget: number;
  maxTarget: number;
  formatGoalText: (target: number) => string;
}

export const FAMILY_REWARD_METRICS: Record<FamilyRewardMetric, FamilyRewardMetricMeta> = {
  distinct_activities: {
    id: 'distinct_activities',
    label: 'Actividades distintas (Vocab, Gram, Listening, Reading...)',
    shortUnit: 'act.',
    defaultTarget: 6,
    maxTarget: 60,
    formatGoalText: (t) =>
      `completar ${t} ${t === 1 ? 'actividad distinta' : 'actividades distintas'}`,
  },
  xp: {
    id: 'xp',
    label: 'Puntos XP nuevos',
    shortUnit: 'XP',
    defaultTarget: 200,
    maxTarget: 2000,
    formatGoalText: (t) => `conseguir ${t} XP nuevos`,
  },
  days: {
    id: 'days',
    label: 'Días distintos de práctica',
    shortUnit: 'días',
    defaultTarget: 4,
    maxTarget: 30,
    formatGoalText: (t) => `practicar ${t} ${t === 1 ? 'día distinto' : 'días distintos'}`,
  },
  correct_answers: {
    id: 'correct_answers',
    label: 'Preguntas acertadas',
    shortUnit: 'aciertos',
    defaultTarget: 40,
    maxTarget: 500,
    formatGoalText: (t) => `acertar ${t} ${t === 1 ? 'pregunta' : 'preguntas'}`,
  },
  stars: {
    id: 'stars',
    label: 'Estrellas nuevas (★)',
    shortUnit: '★',
    defaultTarget: 10,
    maxTarget: 60,
    formatGoalText: (t) => `conseguir ${t} ★ nuevas`,
  },
  sessions: {
    id: 'sessions',
    label: 'Rondas completadas (cualquier actividad)',
    shortUnit: 'rondas',
    defaultTarget: 5,
    maxTarget: 50,
    formatGoalText: (t) =>
      `completar ${t} ${t === 1 ? 'ronda de práctica' : 'rondas de práctica'}`,
  },
};

export const FAMILY_REWARD_METRIC_OPTIONS: readonly FamilyRewardMetricMeta[] = [
  FAMILY_REWARD_METRICS.distinct_activities,
  FAMILY_REWARD_METRICS.xp,
  FAMILY_REWARD_METRICS.days,
  FAMILY_REWARD_METRICS.correct_answers,
  FAMILY_REWARD_METRICS.stars,
  FAMILY_REWARD_METRICS.sessions,
];

export const EXPLORER_RANKS: readonly ExplorerRank[] = [
  { level: 1, title: 'Starter Explorer', emoji: '🌱', minXp: 0 },
  { level: 2, title: 'London Walker', emoji: '🚌', minXp: 150 },
  { level: 3, title: 'Big Ben Scout', emoji: '🕰️', minXp: 400 },
  { level: 4, title: 'Thames Navigator', emoji: '⛵', minXp: 800 },
  { level: 5, title: 'Royal Guard', emoji: '💂', minXp: 1400 },
  { level: 6, title: 'English Master', emoji: '👑', minXp: 2200 },
];

const WEEK_LABELS: readonly WeekDayStatus['label'][] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMondayStart(date: Date): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - offset);
  return copy;
}

export function classifyAttemptActivity(
  attempt: AttemptRecord,
  lookupExercise?: (id: string) => ExerciseItem | undefined,
): ClassifiedActivity {
  if (attempt.mode === 'exam') {
    return { key: `exam:${attempt.examId ?? attempt.id}`, category: 'exam' };
  }
  if (attempt.mode === 'mistake_review') {
    return {
      key: `mistakes:${toLocalDateKey(new Date(attempt.finishedAt))}`,
      category: 'mistakes',
    };
  }
  if (attempt.mode === 'bank_practice') {
    return { key: `bank:${attempt.unitId ?? 'bank'}`, category: 'bank' };
  }

  let category: ActivityCategory = 'full';
  if (attempt.answersDetail.length > 0) {
    const isListening = attempt.answersDetail.every((ans) => {
      const ex = lookupExercise?.(ans.exerciseId);
      return ex
        ? ex.type === 'listening_choice' || ex.type === 'listening_dictation'
        : ans.exerciseId.includes('-lc') || ans.exerciseId.includes('-ld');
    });

    const isReading = attempt.answersDetail.every((ans) => {
      const ex = lookupExercise?.(ans.exerciseId);
      return ex ? ex.type === 'reading_comprehension' : ans.exerciseId.includes('-rd');
    });

    const isVocabulary = attempt.answersDetail.every((ans) => {
      const ex = lookupExercise?.(ans.exerciseId);
      if (ex) {
        return (
          ex.type !== 'listening_choice' &&
          ex.type !== 'listening_dictation' &&
          ex.type !== 'reading_comprehension' &&
          (ex.skill === 'vocabulary' || ex.skill === 'expressions')
        );
      }
      return /-v\d|-m\d/.test(ans.exerciseId);
    });

    const isGrammar = attempt.answersDetail.every((ans) => {
      const ex = lookupExercise?.(ans.exerciseId);
      if (ex) {
        return (
          ex.type !== 'listening_choice' &&
          ex.type !== 'listening_dictation' &&
          ex.type !== 'reading_comprehension' &&
          (ex.skill === 'grammar' || ex.skill === 'irregular_verbs')
        );
      }
      return /-g\d/.test(ans.exerciseId);
    });

    if (isListening) category = 'listening';
    else if (isReading) category = 'reading';
    else if (isVocabulary) category = 'vocabulary';
    else if (isGrammar) category = 'grammar';
  }

  return {
    key: `${attempt.unitId ?? 'unit'}:${category}`,
    category,
  };
}

/**
 * Calculates Explorer XP for a completed attempt.
 * Same-day practice repeats beyond the 2nd run receive dampened XP to discourage farming.
 */
export function calculateAttemptXp(attempt: AttemptRecord, sameDayRepeatIndex = 0): number {
  if (attempt.status !== 'completed') return 0;

  const base = attempt.correctCount * 10;
  const completionBonus = attempt.mode === 'exam' && attempt.scorePercent >= 50 ? 25 : 10;
  const perfectBonus = attempt.scorePercent === 100 && attempt.totalQuestions >= 2 ? 15 : 0;
  const mistakeBonus = attempt.mode === 'mistake_review' ? attempt.correctCount * 15 : 0;

  const raw = base + completionBonus + perfectBonus + mistakeBonus;

  if (attempt.mode === 'practice' && sameDayRepeatIndex >= 2) {
    const dampened = Math.round(raw * 0.3);
    return attempt.correctCount > 0 ? Math.max(5, dampened) : dampened;
  }

  return raw;
}

export function computeStudentRewards(
  attempts: AttemptRecord[],
  options?: {
    now?: Date;
    lookupExercise?: (id: string) => ExerciseItem | undefined;
  },
): StudentRewardsSummary {
  const now = options?.now ?? new Date();
  const lookup = options?.lookupExercise;

  const completed = attempts
    .filter((a) => a.status === 'completed')
    .slice()
    .sort((a, b) => new Date(a.finishedAt).getTime() - new Date(b.finishedAt).getTime());

  const repeatCounter = new Map<string, number>();
  let totalXp = 0;

  const bestStarsByUnit = new Map<string, number>();
  let examStarsSum = 0;

  const allPracticeDays = new Set<string>();
  const daysByWeekStart = new Map<string, Set<string>>();
  const currentMonday = getMondayStart(now);
  const currentMondayKey = toLocalDateKey(currentMonday);
  const todayKey = toLocalDateKey(now);

  let weeklyQuestions = 0;
  let totalCorrectAnswersCount = 0;
  let listeningCorrect = 0;
  let readingCorrect = 0;
  let irregularVerbCorrect = 0;
  let mistakesCorrected = 0;
  let perfectSessions = 0;
  let passedExams = 0;
  const distinctUnits = new Set<string>();
  const distinctActivityKeys = new Set<string>();
  const distinctSkillCategories = new Set<'vocabulary' | 'grammar' | 'listening' | 'reading'>();

  for (const attempt of completed) {
    const finishDate = new Date(attempt.finishedAt);
    const dayKey = toLocalDateKey(finishDate);
    allPracticeDays.add(dayKey);

    const repeatKey = `${dayKey}:${attempt.unitId ?? attempt.mode}`;
    const repeatIdx = repeatCounter.get(repeatKey) ?? 0;
    repeatCounter.set(repeatKey, repeatIdx + 1);

    totalXp += calculateAttemptXp(attempt, repeatIdx);
    totalCorrectAnswersCount += attempt.correctCount;

    const classified = classifyAttemptActivity(attempt, lookup);
    distinctActivityKeys.add(classified.key);
    if (
      classified.category === 'vocabulary' ||
      classified.category === 'grammar' ||
      classified.category === 'listening' ||
      classified.category === 'reading'
    ) {
      distinctSkillCategories.add(classified.category);
    }

    if (attempt.mode === 'exam') {
      examStarsSum += attempt.stars;
      if (attempt.scorePercent >= 70) passedExams++;
    } else if (attempt.unitId && attempt.unitId !== 'mistakes') {
      const prevBest = bestStarsByUnit.get(attempt.unitId) ?? 0;
      if (attempt.stars > prevBest) {
        bestStarsByUnit.set(attempt.unitId, attempt.stars);
      }
      if (!attempt.unitId.startsWith('bank-')) {
        distinctUnits.add(attempt.unitId);
      }
    }

    if (attempt.scorePercent === 100 && attempt.totalQuestions >= 2) {
      perfectSessions++;
    }

    if (attempt.mode === 'mistake_review') {
      mistakesCorrected += attempt.correctCount;
    }

    const weekKey = toLocalDateKey(getMondayStart(finishDate));
    let weekDays = daysByWeekStart.get(weekKey);
    if (!weekDays) {
      weekDays = new Set<string>();
      daysByWeekStart.set(weekKey, weekDays);
    }
    weekDays.add(dayKey);

    if (weekKey === currentMondayKey) {
      weeklyQuestions += attempt.totalQuestions;
    }

    for (const ans of attempt.answersDetail) {
      if (!ans.isCorrect) continue;
      const ex = lookup?.(ans.exerciseId);
      if (ex) {
        if (ex.type === 'listening_choice' || ex.type === 'listening_dictation') {
          listeningCorrect++;
        }
        if (ex.type === 'reading_comprehension') {
          readingCorrect++;
        }
        if (ex.skill === 'irregular_verbs' || ans.unitId === 'bank-irregular-verbs') {
          irregularVerbCorrect++;
        }
      } else {
        if (ans.unitId === 'bank-irregular-verbs') {
          irregularVerbCorrect++;
        }
        if (ans.exerciseId.includes('-lc') || ans.exerciseId.includes('-ld')) {
          listeningCorrect++;
        }
        if (ans.exerciseId.includes('-rd')) {
          readingCorrect++;
        }
      }
    }
  }

  let totalUnitStars = 0;
  for (const s of bestStarsByUnit.values()) totalUnitStars += s;
  const totalEarnedStars = totalUnitStars + examStarsSum;

  let rankIdx = 0;
  for (let i = EXPLORER_RANKS.length - 1; i >= 0; i--) {
    if (totalXp >= EXPLORER_RANKS[i].minXp) {
      rankIdx = i;
      break;
    }
  }
  const rank = EXPLORER_RANKS[rankIdx];
  const nextRank = rankIdx + 1 < EXPLORER_RANKS.length ? EXPLORER_RANKS[rankIdx + 1] : null;
  const xpIntoRank = totalXp - rank.minXp;
  const xpForNextRank = nextRank ? nextRank.minXp - rank.minXp : 0;
  const rankProgressPercent = nextRank
    ? Math.min(100, Math.round((xpIntoRank / xpForNextRank) * 100))
    : 100;

  const thisWeekDays = daysByWeekStart.get(currentMondayKey) ?? new Set<string>();
  const weekDaysStatus: WeekDayStatus[] = WEEK_LABELS.map((label, idx) => {
    const d = new Date(
      currentMonday.getFullYear(),
      currentMonday.getMonth(),
      currentMonday.getDate() + idx,
    );
    const dateKey = toLocalDateKey(d);
    return {
      label,
      dateKey,
      practiced: thisWeekDays.has(dateKey),
      isToday: dateKey === todayKey,
    };
  });

  const weeklyDaysPracticed = weekDaysStatus.filter((d) => d.practiced).length;
  const weeklyTargetDays = 3;

  let bestDaysInAnyWeek = 0;
  for (const set of daysByWeekStart.values()) {
    if (set.size > bestDaysInAnyWeek) bestDaysInAnyWeek = set.size;
  }

  const badges: PassportBadge[] = [
    {
      id: 'first_step',
      title: 'Primer Paso',
      description: 'Completa tu primera sesión de inglés.',
      emoji: '🌟',
      earned: completed.length >= 1,
      progressCurrent: Math.min(1, completed.length),
      progressTarget: 1,
    },
    {
      id: 'perfect_score',
      title: '100 % Perfecto',
      description: 'Completa una sesión sin ni un solo fallo.',
      emoji: '💯',
      earned: perfectSessions >= 1,
      progressCurrent: Math.min(1, perfectSessions),
      progressTarget: 1,
    },
    {
      id: 'listening_ear',
      title: 'Oído Fino',
      description: 'Acierta 10 preguntas de Listening.',
      emoji: '🎧',
      earned: listeningCorrect >= 10,
      progressCurrent: Math.min(10, listeningCorrect),
      progressTarget: 10,
    },
    {
      id: 'bookworm',
      title: 'Lector Curioso',
      description: 'Acierta 10 preguntas de Reading.',
      emoji: '📖',
      earned: readingCorrect >= 10,
      progressCurrent: Math.min(10, readingCorrect),
      progressTarget: 10,
    },
    {
      id: 'mistake_hunter',
      title: 'Cazador de Errores',
      description: 'Corrige 3 fallos en Repasar Errores.',
      emoji: '🛠️',
      earned: mistakesCorrected >= 3,
      progressCurrent: Math.min(3, mistakesCorrected),
      progressTarget: 3,
    },
    {
      id: 'verb_master',
      title: 'Maestro de Verbos',
      description: 'Acierta 15 verbos irregulares.',
      emoji: '⚡',
      earned: irregularVerbCorrect >= 15,
      progressCurrent: Math.min(15, irregularVerbCorrect),
      progressTarget: 15,
    },
    {
      id: 'weekly_champ',
      title: 'Constancia Semanal',
      description: 'Practica 3 días distintos en la misma semana.',
      emoji: '📅',
      earned: bestDaysInAnyWeek >= 3,
      progressCurrent: Math.min(3, Math.max(weeklyDaysPracticed, bestDaysInAnyWeek)),
      progressTarget: 3,
    },
    {
      id: 'exam_hero',
      title: 'Héroe de Examen',
      description: 'Aprueba un examen asignado con al menos 70 %.',
      emoji: '🏆',
      earned: passedExams >= 1,
      progressCurrent: Math.min(1, passedExams),
      progressTarget: 1,
    },
    {
      id: 'star_collector',
      title: 'Cazador de Estrellas',
      description: 'Consigue 15 estrellas en tus unidades y exámenes.',
      emoji: '⭐',
      earned: totalEarnedStars >= 15,
      progressCurrent: Math.min(15, totalEarnedStars),
      progressTarget: 15,
    },
    {
      id: 'multi_explorer',
      title: 'Explorador Completo',
      description: 'Practica al menos 5 unidades distintas.',
      emoji: '🗺️',
      earned: distinctUnits.size >= 5,
      progressCurrent: Math.min(5, distinctUnits.size),
      progressTarget: 5,
    },
    {
      id: 'all_rounder',
      title: 'Todo Terreno',
      description: 'Completa al menos 1 actividad de Vocabulario, Gramática, Listening y Reading.',
      emoji: '🌈',
      earned: distinctSkillCategories.size >= 4,
      progressCurrent: distinctSkillCategories.size,
      progressTarget: 4,
    },
  ];

  return {
    totalXp,
    rank,
    nextRank,
    xpIntoRank,
    xpForNextRank,
    rankProgressPercent,
    totalEarnedStars,
    completedSessionsCount: completed.length,
    totalPracticeDaysCount: allPracticeDays.size,
    totalCorrectAnswersCount,
    distinctActivitiesCount: distinctActivityKeys.size,
    completedSkillModesCount: distinctSkillCategories.size,
    weekDaysStatus,
    weeklyDaysPracticed,
    weeklyTargetDays,
    weeklyQuestions,
    badges,
    earnedBadgesCount: badges.filter((b) => b.earned).length,
    totalBadgesCount: badges.length,
  };
}

export function getMetricCurrentValue(
  metric: FamilyRewardMetric,
  rewards: StudentRewardsSummary,
): number {
  switch (metric) {
    case 'stars':
      return rewards.totalEarnedStars;
    case 'sessions':
      return rewards.completedSessionsCount;
    case 'xp':
      return rewards.totalXp;
    case 'days':
      return rewards.totalPracticeDaysCount;
    case 'correct_answers':
      return rewards.totalCorrectAnswersCount;
    case 'distinct_activities':
      return rewards.distinctActivitiesCount;
  }
}

export function computeFamilyGoalProgress(
  goal: FamilyRewardGoal,
  rewards: StudentRewardsSummary,
): FamilyGoalProgress {
  const metricTotal = getMetricCurrentValue(goal.metric, rewards);
  const current = Math.max(0, metricTotal - goal.baselineValue);
  const target = Math.max(1, goal.targetValue);
  const percent = Math.min(100, Math.round((current / target) * 100));
  return {
    current,
    target,
    percent,
    reached: current >= target,
  };
}
