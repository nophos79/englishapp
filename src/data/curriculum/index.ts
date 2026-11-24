import type { Course, CourseId, ExerciseItem, LearningUnit } from '../../domain/types';
import { expressionsBank } from '../banks/expressions';
import { irregularVerbsBank } from '../banks/irregularVerbs';
import { course3p } from './course-3p';
import { course4p } from './course-4p';
import { course5p } from './course-5p';
import { course6p } from './course-6p';
import { VARIED_EXERCISES } from './variedExercises';

function withVariedExercises(course: Course): Course {
  return {
    ...course,
    terms: course.terms.map((term) => ({
      ...term,
      units: term.units.map((unit) => {
        const extras = VARIED_EXERCISES.filter((e) => e.unitId === unit.id);
        return extras.length > 0 ? { ...unit, exercises: [...unit.exercises, ...extras] } : unit;
      }),
    })),
  };
}

const enriched3p = withVariedExercises(course3p);
const enriched4p = withVariedExercises(course4p);
const enriched5p = withVariedExercises(course5p);
const enriched6p = withVariedExercises(course6p);

export const COURSES: Course[] = [enriched3p, enriched4p, enriched5p, enriched6p];

export const COURSE_MAP: Record<CourseId, Course> = {
  '3p': enriched3p,
  '4p': enriched4p,
  '5p': enriched5p,
  '6p': enriched6p,
};

export function getCourse(courseId: CourseId): Course {
  return COURSE_MAP[courseId];
}

export function getOrderedUnitsForCourse(courseId: CourseId): LearningUnit[] {
  return COURSE_MAP[courseId].terms
    .flatMap((t) => t.units)
    .sort((a, b) => a.schoolOrder - b.schoolOrder);
}

export function getUnitById(unitId: string): LearningUnit | undefined {
  for (const course of COURSES) {
    for (const term of course.terms) {
      const found = term.units.find((u) => u.id === unitId);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Generates interactive exercises from the Irregular Verbs bank for practice & custom exams.
 */
export function getIrregularVerbExercises(): ExerciseItem[] {
  return irregularVerbsBank.map((verb) => {
    const accepted = verb.pastSimple
      .split(/[,/]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      id: `bank-iv-${verb.id}`,
      courseId: verb.minCycle === 2 ? '4p' : '5p',
      unitId: 'bank-irregular-verbs',
      skill: 'irregular_verbs',
      type: 'fill_blank',
      promptEs: `Escribe el Past Simple del verbo "${verb.infinitive}" (${verb.spanish}):`,
      promptEn: `${verb.infinitive} → ___`,
      acceptedAnswers: accepted,
      explanationEs: `${verb.infinitive} → ${verb.pastSimple} → ${verb.pastParticiple} (${verb.spanish}).`,
      allowAudioInExam: false,
    };
  });
}

/**
 * Generates interactive exercises from the Useful Expressions bank for practice & custom exams.
 */
export function getExpressionExercises(): ExerciseItem[] {
  return expressionsBank.map((exp, idx) => {
    const distractors = expressionsBank
      .filter((other) => other.id !== exp.id)
      .slice((idx * 3) % Math.max(1, expressionsBank.length - 4), ((idx * 3) % Math.max(1, expressionsBank.length - 4)) + 3)
      .map((d) => d.english);
    return {
      id: `bank-exp-${exp.id}`,
      courseId: exp.minCycle === 2 ? '4p' : '5p',
      unitId: 'bank-expressions',
      skill: 'expressions',
      type: 'multiple_choice',
      promptEs: `¿Cómo se dice en inglés: "${exp.spanish}"?`,
      options: [exp.english, ...distractors],
      acceptedAnswers: [exp.english],
      explanationEs: `"${exp.english}" significa "${exp.spanish}".`,
      allowAudioInExam: true,
    };
  });
}

export function getAllExercises(): ExerciseItem[] {
  const courseExercises = COURSES.flatMap((c) => c.terms.flatMap((t) => t.units.flatMap((u) => u.exercises)));
  return [...courseExercises, ...getIrregularVerbExercises(), ...getExpressionExercises()];
}

export function getExerciseById(exerciseId: string): ExerciseItem | undefined {
  return getAllExercises().find((e) => e.id === exerciseId);
}
