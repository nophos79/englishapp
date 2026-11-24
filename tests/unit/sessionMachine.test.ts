import { describe, expect, it } from 'vitest';
import { getUnitById } from '../../src/data/curriculum';
import {
  advancePracticeQuestion,
  createPracticeSession,
  submitPracticeAnswer,
} from '../../src/domain/sessionMachine';

describe('SessionMachine (Anti-Cheat Rules)', () => {
  const unit = getUnitById('5p-sa1-school')!;

  it('prevents editing or re-submitting an answer once evaluated', () => {
    let session = createPracticeSession(unit.exercises, 'practice', () => 0.1);
    const first = session.questions[0];
    expect(first.submitted).toBe(false);

    // Submit wrong answer
    session = submitPracticeAnswer(session, 'definitely-wrong-answer');
    expect(session.questions[0].submitted).toBe(true);
    expect(session.questions[0].evaluation?.isCorrect).toBe(false);

    // Attempt to re-submit the correct answer (cheating attempt) -> must be ignored!
    const correctAnswer = first.exercise.acceptedAnswers[0];
    session = submitPracticeAnswer(session, correctAnswer);
    expect(session.questions[0].evaluation?.isCorrect).toBe(false);
  });

  it('does not advance until the current question is submitted', () => {
    const session = createPracticeSession(unit.exercises, 'practice', () => 0.2);
    const blockedAdvance = advancePracticeQuestion(session);
    expect(blockedAdvance.currentIndex).toBe(0);

    const submitted = submitPracticeAnswer(session, 'anything');
    const advanced = advancePracticeQuestion(submitted);
    expect(advanced.currentIndex).toBe(1);
  });
});
