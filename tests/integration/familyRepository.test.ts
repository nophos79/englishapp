import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/services/supabaseClient', () => ({
  isSupabaseConfigured: false,
  supabase: null,
}));

import { buildAttemptRecord } from '../../src/domain/sessionMachine';
import { familyRepository, generateUuid } from '../../src/services/familyRepository';
import { clearFamilySnapshot } from '../../src/services/localDb';

describe('FamilyRepository (PIN, Students, Unit Access, Exams, Attempts & Mistakes)', () => {
  beforeEach(async () => {
    await clearFamilySnapshot();
  });

  it('sets and verifies parental PIN securely and rejects invalid PINs', async () => {
    expect(await familyRepository.hasParentPin()).toBe(false);
    await familyRepository.setParentPin('4829');
    expect(await familyRepository.hasParentPin()).toBe(true);
    expect(await familyRepository.verifyParentPin('4829')).toBe(true);
    expect(await familyRepository.verifyParentPin('1234')).toBe(false);
  });

  it('manages multiple isolated students, unit access, exams, immutable attempts, and mistakes', async () => {
    await familyRepository.setParentPin('1357');
    const s1 = await familyRepository.createStudent({
      nickname: 'Lucía',
      avatarId: 'owl',
      courseId: '5p',
    });
    const s2 = await familyRepository.createStudent({
      nickname: 'Mateo',
      avatarId: 'fox',
      courseId: '3p',
    });

    const students = await familyRepository.listStudents();
    expect(students.length).toBe(2);

    // Parental unit pacing
    await familyRepository.setUnitAccess(s1.id, { '5p-starter': true, '5p-sa1-school': true });
    expect((await familyRepository.getUnitAccess(s1.id))['5p-sa1-school']).toBe(true);
    expect((await familyRepository.getUnitAccess(s2.id))['5p-sa1-school']).toBeUndefined();

    // Custom exam lifecycle
    const exam = await familyRepository.createExam({
      studentId: s1.id,
      title: 'Repaso SA 1',
      courseId: '5p',
      unitIds: ['5p-sa1-school'],
      skillFocus: 'mixed',
      exerciseIds: ['5p-sa1-v1', '5p-sa1-g1'],
    });
    expect(exam.status).toBe('pending');
    await familyRepository.transitionExamStatus(exam.id, 'in_progress');
    await familyRepository.transitionExamStatus(exam.id, 'completed');
    const updatedExams = await familyRepository.listExams(s1.id);
    expect(updatedExams[0].status).toBe('completed');

    // Immutable attempt recording (idempotent by ID)
    const attemptId = generateUuid();
    const attempt = buildAttemptRecord({
      id: attemptId,
      familyId: s1.familyId,
      studentId: s1.id,
      mode: 'exam',
      examId: exam.id,
      status: 'completed',
      startedAt: new Date(Date.now() - 60_000).toISOString(),
      answersDetail: [
        {
          exerciseId: '5p-sa1-v1',
          unitId: '5p-sa1-school',
          submittedAnswer: 'Educación Física',
          expectedAnswers: ['Educación Física'],
          isCorrect: true,
        },
        {
          exerciseId: '5p-sa1-g1',
          unitId: '5p-sa1-school',
          submittedAnswer: 'study',
          expectedAnswers: ['studies'],
          isCorrect: false,
        },
      ],
      totalQuestions: 2,
      focusLossCount: 2,
      focusLossSeconds: 18,
    });
    await familyRepository.recordAttempt(attempt);
    await familyRepository.recordAttempt(attempt); // duplicate id ignored
    const savedAttempts = await familyRepository.listAttempts(s1.id);
    expect(savedAttempts.length).toBe(1);
    expect(savedAttempts[0].focusLossCount).toBe(2);
    expect(savedAttempts[0].focusLossSeconds).toBe(18);

    // Mistake queue recording & resolution (without touching attempt history)
    await familyRepository.recordMistakes(s1.id, [
      { exerciseId: '5p-sa1-g1', unitId: '5p-sa1-school' },
    ]);
    expect((await familyRepository.listPendingMistakes(s1.id)).length).toBe(1);
    await familyRepository.resolveMistake(s1.id, '5p-sa1-g1');
    expect((await familyRepository.listPendingMistakes(s1.id)).length).toBe(0);
    expect((await familyRepository.listAttempts(s1.id)).length).toBe(1);

    // Reset requires valid PIN
    await expect(familyRepository.resetStudentProgress(s1.id, '0000')).rejects.toThrow();
    await familyRepository.resetStudentProgress(s1.id, '1357');
    expect((await familyRepository.listAttempts(s1.id)).length).toBe(0);
  });
});
