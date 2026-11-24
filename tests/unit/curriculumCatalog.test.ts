import { describe, expect, it } from 'vitest';
import { expressionsBank } from '../../src/data/banks/expressions';
import { irregularVerbsBank } from '../../src/data/banks/irregularVerbs';
import { wordlistBank } from '../../src/data/banks/wordlist';
import { COURSES, getOrderedUnitsForCourse } from '../../src/data/curriculum';
import {
  courseSchema,
  expressionEntrySchema,
  irregularVerbSchema,
  wordlistEntrySchema,
} from '../../src/domain/curriculum.schema';

describe('Curriculum Catalog & Reference Banks (Zod Validation)', () => {
  it('validates all 4 courses (3º, 4º, 5º, 6º) with strict schoolOrder', () => {
    expect(COURSES.map((c) => c.id)).toEqual(['3p', '4p', '5p', '6p']);

    for (const course of COURSES) {
      const parsed = courseSchema.safeParse(course);
      expect(parsed.success, `Course ${course.id} failed Zod validation`).toBe(true);

      const ordered = getOrderedUnitsForCourse(course.id);
      expect(ordered.length).toBe(10);
      expect(ordered[0].code).toBe('STARTER');
      expect(ordered[ordered.length - 1].title).toContain('SUMMER');
      const totalCourseExercises = ordered.reduce((sum, u) => sum + u.exercises.length, 0);
      expect(totalCourseExercises).toBeGreaterThanOrEqual(85);
    }
  });

  it('has globally unique exercise IDs across all courses', () => {
    const ids = COURSES.flatMap((c) =>
      c.terms.flatMap((t) => t.units.flatMap((u) => u.exercises.map((e) => e.id))),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('validates irregular verbs, expressions, and wordlist banks', () => {
    expect(irregularVerbsBank.length).toBeGreaterThanOrEqual(65);
    expect(new Set(irregularVerbsBank.map((v) => v.id)).size).toBe(irregularVerbsBank.length);
    for (const v of irregularVerbsBank) {
      expect(irregularVerbSchema.safeParse(v).success).toBe(true);
    }

    expect(expressionsBank.length).toBeGreaterThanOrEqual(85);
    expect(new Set(expressionsBank.map((e) => e.id)).size).toBe(expressionsBank.length);
    for (const e of expressionsBank) {
      expect(expressionEntrySchema.safeParse(e).success).toBe(true);
    }

    expect(wordlistBank.length).toBeGreaterThanOrEqual(240);
    expect(new Set(wordlistBank.map((w) => w.id)).size).toBe(wordlistBank.length);
    for (const w of wordlistBank) {
      expect(wordlistEntrySchema.safeParse(w).success).toBe(true);
    }
  });
});
