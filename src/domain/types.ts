export type CourseId = '3p' | '4p' | '5p' | '6p';
export type CycleNumber = 2 | 3;
export type TermNumber = 1 | 2 | 3;

export type SkillArea = 'vocabulary' | 'grammar' | 'expressions' | 'irregular_verbs';
export type ExerciseType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'matching'
  | 'sentence_order'
  | 'word_builder'
  | 'odd_one_out'
  | 'true_false'
  | 'listening_choice'
  | 'listening_dictation'
  | 'reading_comprehension';
export type SkillFocus = 'vocabulary' | 'grammar' | 'mixed';

export type ExamStatus = 'pending' | 'in_progress' | 'completed' | 'abandoned';
export type AttemptMode = 'practice' | 'exam' | 'mistake_review' | 'bank_practice';
export type AttemptStatus = 'completed' | 'abandoned';

export interface MatchingPair {
  left: string;
  right: string;
}

export interface ExerciseItem {
  id: string;
  courseId: CourseId;
  unitId: string;
  skill: SkillArea;
  type: ExerciseType;
  promptEs: string;
  promptEn?: string;
  readingTitle?: string;
  readingPassage?: string;
  audioText?: string;
  options?: string[];
  pairs?: MatchingPair[];
  tokens?: string[];
  acceptedAnswers: string[];
  explanationEs: string;
  allowAudioInExam: boolean;
}

export interface LearningUnit {
  id: string;
  courseId: CourseId;
  termNumber: TermNumber;
  schoolOrder: number;
  code: string;
  title: string;
  vocabularySummary: string[];
  grammarSummary: string[];
  exercises: ExerciseItem[];
}

export interface Term {
  id: string;
  number: TermNumber;
  label: 'First Term' | 'Second Term' | 'Third Term';
  units: LearningUnit[];
}

export interface Course {
  id: CourseId;
  cycle: CycleNumber;
  label: string;
  terms: Term[];
}

export interface IrregularVerbEntry {
  id: string;
  infinitive: string;
  pastSimple: string;
  pastParticiple: string;
  spanish: string;
  minCycle: CycleNumber;
}

export interface ExpressionEntry {
  id: string;
  english: string;
  spanish: string;
  category: string;
  minCycle: CycleNumber;
}

export interface WordlistEntry {
  id: string;
  english: string;
  spanish: string;
  category: string;
  minCycle: CycleNumber;
  unitIds?: string[];
}

export interface StudentProfile {
  id: string;
  familyId: string;
  nickname: string;
  avatarId: string;
  courseId: CourseId;
  createdAt: string;
}

export interface CustomExam {
  id: string;
  familyId: string;
  studentId: string;
  title: string;
  courseId: CourseId;
  unitIds: string[];
  skillFocus: SkillFocus;
  exerciseIds: string[];
  status: ExamStatus;
  createdAt: string;
}

export interface AnswerDetail {
  exerciseId: string;
  unitId: string;
  submittedAnswer: string;
  expectedAnswers: string[];
  isCorrect: boolean;
}

export interface AttemptRecord {
  id: string;
  familyId: string;
  studentId: string;
  mode: AttemptMode;
  unitId?: string | null;
  examId?: string | null;
  status: AttemptStatus;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  stars: 0 | 1 | 2 | 3;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  answersDetail: AnswerDetail[];
  focusLossCount?: number;
  focusLossSeconds?: number;
}

export interface StudentMistake {
  studentId: string;
  exerciseId: string;
  familyId: string;
  unitId: string;
  missCount: number;
  resolved: boolean;
  lastMissedAt: string;
  resolvedAt?: string | null;
}

export interface ActiveExamSession {
  examId: string;
  studentId: string;
  startedAt: string;
  currentIndex: number;
  exerciseIds: string[];
  optionOrderByExercise: Record<string, string[]>;
  answers: Record<string, string | Record<string, string>>;
  focusLossCount?: number;
  focusLossSeconds?: number;
}

export type FamilyRewardMetric =
  | 'stars'
  | 'sessions'
  | 'xp'
  | 'days'
  | 'correct_answers'
  | 'distinct_activities';
export type FamilyRewardStatus = 'active' | 'claimed' | 'redeemed';

export interface FamilyRewardGoal {
  id: string;
  familyId: string;
  studentId: string;
  title: string;
  metric: FamilyRewardMetric;
  targetValue: number;
  baselineValue: number;
  status: FamilyRewardStatus;
  createdAt: string;
  claimedAt?: string | null;
  redeemedAt?: string | null;
}
