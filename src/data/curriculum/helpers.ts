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

export function order(
  id: string,
  courseId: CourseId,
  unitId: string,
  skill: SkillArea,
  promptEs: string,
  tokens: string[],
  explanationEs: string,
): ExerciseItem {
  const sentence = tokens.join(' ');
  return {
    id,
    courseId,
    unitId,
    skill,
    type: 'sentence_order',
    promptEs,
    tokens,
    acceptedAnswers: [sentence],
    explanationEs,
    allowAudioInExam: false,
  };
}

export function builder(
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
    type: 'word_builder',
    promptEs,
    pairs,
    acceptedAnswers: [pairs.map((p) => `${p.left}${p.right}`).join(' | ')],
    explanationEs,
    allowAudioInExam: false,
  };
}

export function odd(
  id: string,
  courseId: CourseId,
  unitId: string,
  skill: SkillArea,
  promptEs: string,
  options: string[],
  intruder: string,
  explanationEs: string,
): ExerciseItem {
  return {
    id,
    courseId,
    unitId,
    skill,
    type: 'odd_one_out',
    promptEs,
    options,
    acceptedAnswers: [intruder],
    explanationEs,
    allowAudioInExam: true,
  };
}

export function tf(
  id: string,
  courseId: CourseId,
  unitId: string,
  skill: SkillArea,
  promptEn: string,
  isCorrectSentence: boolean,
  explanationEs: string,
): ExerciseItem {
  const correctLabel = isCorrectSentence ? 'Correcta' : 'Tiene un fallo';
  return {
    id,
    courseId,
    unitId,
    skill,
    type: 'true_false',
    promptEs: '¿Esta frase en inglés es correcta o tiene un fallo?',
    promptEn,
    options: ['Correcta', 'Tiene un fallo'],
    acceptedAnswers: [correctLabel],
    explanationEs,
    allowAudioInExam: true,
  };
}
