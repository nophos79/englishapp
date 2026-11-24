import type { CourseId, ExerciseItem, MatchingPair, SkillArea } from '../../domain/types';

export function mc(
  id: string,
  courseId: CourseId,
  unitId: string,
  skill: SkillArea,
  promptEs: string,
  options: string[],
  correct: string,
  explanationEs: string,
  promptEn?: string,
): ExerciseItem {
  return {
    id,
    courseId,
    unitId,
    skill,
    type: 'multiple_choice',
    promptEs,
    promptEn,
    options,
    acceptedAnswers: [correct],
    explanationEs,
    allowAudioInExam: true,
  };
}

export function fb(
  id: string,
  courseId: CourseId,
  unitId: string,
  skill: SkillArea,
  promptEs: string,
  promptEn: string,
  acceptedAnswers: string[],
  explanationEs: string,
): ExerciseItem {
  return {
    id,
    courseId,
    unitId,
    skill,
    type: 'fill_blank',
    promptEs,
    promptEn,
    acceptedAnswers,
    explanationEs,
    allowAudioInExam: false,
  };
}

export function match(
  id: string,
  courseId: CourseId,
  unitId: string,
  skill: SkillArea,
  promptEs: string,
  pairs: MatchingPair[],
  explanationEs: string,
): ExerciseItem {
  return {
    id,
    courseId,
    unitId,
    skill,
    type: 'matching',
    promptEs,
    pairs,
    acceptedAnswers: [pairs.map((p) => `${p.left} → ${p.right}`).join(' | ')],
    explanationEs,
    allowAudioInExam: true,
  };
}
