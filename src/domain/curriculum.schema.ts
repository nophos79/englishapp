import { z } from 'zod';

export const courseIdSchema = z.enum(['3p', '4p', '5p', '6p']);
export const cycleSchema = z.union([z.literal(2), z.literal(3)]);
export const termNumberSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export const skillAreaSchema = z.enum(['vocabulary', 'grammar', 'expressions', 'irregular_verbs']);
export const exerciseTypeSchema = z.enum([
  'multiple_choice',
  'fill_blank',
  'matching',
  'sentence_order',
  'word_builder',
  'odd_one_out',
  'true_false',
]);

export const matchingPairSchema = z.object({
  left: z.string().min(1),
  right: z.string().min(1),
});

export const exerciseItemSchema = z
  .object({
    id: z.string().min(3),
    courseId: courseIdSchema,
    unitId: z.string().min(2),
    skill: skillAreaSchema,
    type: exerciseTypeSchema,
    promptEs: z.string().min(3),
    promptEn: z.string().min(1).optional(),
    options: z.array(z.string().min(1)).min(2).optional(),
    pairs: z.array(matchingPairSchema).min(3).max(5).optional(),
    tokens: z.array(z.string().min(1)).min(3).optional(),
    acceptedAnswers: z.array(z.string().min(1)).min(1),
    explanationEs: z.string().min(5),
    allowAudioInExam: z.boolean(),
  })
  .superRefine((item, ctx) => {
    if (item.type === 'multiple_choice' || item.type === 'odd_one_out') {
      if (!item.options || item.options.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${item.type} requires at least 3 options`,
          path: ['options'],
        });
      } else if (!item.acceptedAnswers.some((ans) => item.options?.includes(ans))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'acceptedAnswers must include at least one exact option',
          path: ['acceptedAnswers'],
        });
      }
    }
    if (item.type === 'true_false') {
      if (!item.options || item.options.length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'true_false requires exactly 2 options',
          path: ['options'],
        });
      }
    }
    if ((item.type === 'matching' || item.type === 'word_builder') && (!item.pairs || item.pairs.length < 3)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${item.type} requires at least 3 pairs`,
        path: ['pairs'],
      });
    }
    if (item.type === 'sentence_order' && (!item.tokens || item.tokens.length < 3)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'sentence_order requires at least 3 tokens',
        path: ['tokens'],
      });
    }
  });

export const learningUnitSchema = z.object({
  id: z.string().min(3),
  courseId: courseIdSchema,
  termNumber: termNumberSchema,
  schoolOrder: z.number().int().min(1).max(20),
  code: z.string().min(1),
  title: z.string().min(1),
  vocabularySummary: z.array(z.string().min(1)).min(1),
  grammarSummary: z.array(z.string().min(1)).min(1),
  exercises: z.array(exerciseItemSchema).min(1),
});

export const termSchema = z.object({
  id: z.string().min(3),
  number: termNumberSchema,
  label: z.enum(['First Term', 'Second Term', 'Third Term']),
  units: z.array(learningUnitSchema).min(1),
});

export const courseSchema = z
  .object({
    id: courseIdSchema,
    cycle: cycleSchema,
    label: z.string().min(3),
    terms: z.array(termSchema).length(3),
  })
  .superRefine((course, ctx) => {
    const orders = course.terms.flatMap((t) => t.units.map((u) => u.schoolOrder));
    for (let i = 1; i < orders.length; i++) {
      if (orders[i] <= orders[i - 1]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `schoolOrder must be strictly increasing across terms in ${course.id}`,
          path: ['terms'],
        });
        break;
      }
    }
  });

export const irregularVerbSchema = z.object({
  id: z.string().min(2),
  infinitive: z.string().min(1),
  pastSimple: z.string().min(1),
  pastParticiple: z.string().min(1),
  spanish: z.string().min(1),
  minCycle: cycleSchema,
});

export const expressionEntrySchema = z.object({
  id: z.string().min(2),
  english: z.string().min(2),
  spanish: z.string().min(2),
  category: z.string().min(2),
  minCycle: cycleSchema,
});

export const wordlistEntrySchema = z.object({
  id: z.string().min(2),
  english: z.string().min(1),
  spanish: z.string().min(1),
  category: z.string().min(2),
  minCycle: cycleSchema,
  unitIds: z.array(z.string()).optional(),
});
