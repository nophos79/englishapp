import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, RotateCcw, Star, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  getExerciseById,
  getExpressionExercises,
  getIrregularVerbExercises,
  getUnitById,
} from '../../data/curriculum';
import {
  advancePracticeQuestion,
  buildAttemptRecord,
  createPracticeSession,
  submitPracticeAnswer,
  type PracticeSessionState,
} from '../../domain/sessionMachine';
import type { AnswerDetail, AttemptMode, ExerciseItem } from '../../domain/types';
import { familyRepository, generateUuid } from '../../services/familyRepository';
import { ExerciseRenderer } from './ExerciseRenderer';

export function PracticeSessionPage() {
  const { activeStudent, refreshAll } = useApp();
  const { unitId } = useParams<{ unitId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = (searchParams.get('mode') as AttemptMode) || 'practice';

  const [session, setSession] = useState<PracticeSessionState | null>(null);
  const [currentInput, setCurrentInput] = useState<string | Record<string, string>>('');
  const [title, setTitle] = useState('Sesión de práctica');
  const [saved, setSaved] = useState(false);

  const activeStudentId = activeStudent?.id;

  useEffect(() => {
    if (!activeStudentId) {
      navigate('/');
      return;
    }

    let cancelled = false;
    async function loadSession() {
      let exercises: ExerciseItem[] = [];
      let sessionTitle = 'Sesión de práctica';

      if (mode === 'mistake_review') {
        const pending = await familyRepository.listPendingMistakes(activeStudentId!);
        exercises = pending
          .map((m) => getExerciseById(m.exerciseId))
          .filter((e): e is ExerciseItem => Boolean(e));
        sessionTitle = 'Repasar mis errores';
      } else if (unitId === 'bank-irregular-verbs') {
        exercises = getIrregularVerbExercises().slice(0, 10);
        sessionTitle = 'Práctica: Verbos Irregulares';
      } else if (unitId === 'bank-expressions') {
        exercises = getExpressionExercises().slice(0, 10);
        sessionTitle = 'Práctica: Expresiones Útiles';
      } else if (unitId) {
        const access = await familyRepository.getUnitAccess(activeStudentId!);
        if (!access[unitId]) {
          navigate('/student');
          return;
        }
        const unit = getUnitById(unitId);
        if (unit) {
          exercises = unit.exercises;
          sessionTitle = `${unit.code}: ${unit.title}`;
        }
      }

      if (!cancelled) {
        setTitle(sessionTitle);
        setSession(createPracticeSession(exercises, mode));
        setCurrentInput('');
        setSaved(false);
      }
    }

    void loadSession();
    return () => {
      cancelled = true;
    };
  }, [activeStudentId, unitId, mode, navigate]);

  const currentQuestion = session?.questions[session.currentIndex];

  const hasValidInput = useMemo(() => {
    if (!currentQuestion) return false;
    if (
      currentQuestion.exercise.type === 'matching' ||
      currentQuestion.exercise.type === 'word_builder'
    ) {
      const pairs = currentQuestion.exercise.pairs ?? [];
      const map = typeof currentInput === 'object' && currentInput !== null ? currentInput : {};
      return pairs.every((p) => Boolean(map[p.left]));
    }
    return typeof currentInput === 'string' && currentInput.trim().length > 0;
  }, [currentQuestion, currentInput]);

  // Persist attempt & mistake updates when session finishes
  useEffect(() => {
    if (!session?.finished || saved || !activeStudent || session.questions.length === 0) return;

    async function persist() {
      const answersDetail: AnswerDetail[] = session!.questions.map((q) => ({
        exerciseId: q.exercise.id,
        unitId: q.exercise.unitId,
        submittedAnswer: q.evaluation?.normalizedSubmitted ?? '',
        expectedAnswers: q.evaluation?.expectedAnswers ?? q.exercise.acceptedAnswers,
        isCorrect: Boolean(q.evaluation?.isCorrect),
      }));

      const attempt = buildAttemptRecord({
        id: generateUuid(),
        familyId: activeStudent!.familyId,
        studentId: activeStudent!.id,
        mode: session!.mode,
        unitId: unitId ?? null,
        status: 'completed',
        startedAt: session!.startedAt,
        answersDetail,
        totalQuestions: session!.questions.length,
      });

      await familyRepository.recordAttempt(attempt);

      const missed = answersDetail
        .filter((a) => !a.isCorrect)
        .map((a) => ({ exerciseId: a.exerciseId, unitId: a.unitId }));
      if (missed.length > 0) {
        await familyRepository.recordMistakes(activeStudent!.id, missed);
      }

      if (session!.mode === 'mistake_review') {
        const resolved = answersDetail.filter((a) => a.isCorrect);
        for (const r of resolved) {
          await familyRepository.resolveMistake(activeStudent!.id, r.exerciseId);
        }
      }

      setSaved(true);
      await refreshAll();
    }

    void persist();
  }, [session, saved, activeStudent, unitId, refreshAll]);

  if (!activeStudent || !session) {
    return <div className="p-8 text-center text-slate-600">Cargando sesión...</div>;
  }

  const handleExit = () => {
    if (!session.finished) {
      const ok = window.confirm('¿Seguro que quieres salir antes de terminar la sesión?');
      if (!ok) return;
    }
    navigate('/student');
  };

  if (session.questions.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-3 text-4xl">🎉</div>
          <h1 className="text-2xl font-extrabold text-slate-900">¡Sin errores pendientes!</h1>
          <p className="mt-2 text-sm text-slate-600">
            ¡Genial, {activeStudent.nickname}! Ahora mismo no tienes fallos que repasar. Prueba una nueva Situación de
            Aprendizaje o practica verbos irregulares.
          </p>
          <button
            type="button"
            onClick={() => navigate('/student')}
            className="touch-target mt-6 w-full rounded-2xl bg-blue-700 py-3 font-bold text-white hover:bg-blue-800"
          >
            Volver a mi curso
          </button>
        </div>
      </div>
    );
  }

  if (session.finished) {
    const correctCount = session.questions.filter((q) => q.evaluation?.isCorrect).length;
    const pct = Math.round((correctCount / session.questions.length) * 100);
    const stars = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-slate-100 p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-extrabold text-slate-900">¡Sesión completada!</h1>
          <p className="mt-1 text-sm font-semibold text-slate-600">{title}</p>

          <div className="my-5 flex justify-center gap-2">
            {[1, 2, 3].map((n) => (
              <Star
                key={n}
                className={`h-10 w-10 ${n <= stars ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}`}
              />
            ))}
          </div>

          <p className="text-4xl font-black text-blue-700">
            {correctCount} / {session.questions.length}
          </p>
          <p className="mt-1 text-sm font-bold text-slate-600">{pct}% de aciertos</p>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSession(
                  createPracticeSession(
                    session.questions.map((q) => q.exercise),
                    session.mode,
                  ),
                );
                setCurrentInput('');
                setSaved(false);
              }}
              className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 py-3 font-bold text-white hover:bg-blue-800"
            >
              <RotateCcw className="h-4 w-4" /> Repetir (orden nuevo)
            </button>
            <button
              type="button"
              onClick={() => navigate('/student')}
              className="touch-target w-full rounded-2xl border border-slate-300 bg-white py-3 font-bold text-slate-700 hover:bg-slate-50"
            >
              Volver a mis unidades
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl">
        <header className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleExit}
            className="touch-target inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> Salir
          </button>
          <div className="text-right">
            <p className="text-xs font-bold uppercase text-slate-500">{title}</p>
            <p className="text-sm font-extrabold text-blue-700">
              Pregunta {session.currentIndex + 1} de {session.questions.length}
            </p>
          </div>
        </header>

        <div className="mb-5 h-4 w-full overflow-hidden rounded-full bg-slate-200 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-300"
            style={{ width: `${((session.currentIndex + 1) / session.questions.length) * 100}%` }}
          />
        </div>

        <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-md">
          {currentQuestion && (
            <ExerciseRenderer
              exercise={currentQuestion.exercise}
              shuffledOptions={currentQuestion.shuffledOptions}
              shuffledRightPairs={currentQuestion.shuffledRightPairs}
              shuffledTokens={currentQuestion.shuffledTokens}
              value={currentInput}
              onChange={setCurrentInput}
              disabled={currentQuestion.submitted}
            />
          )}

          {currentQuestion?.submitted && currentQuestion.evaluation && (
            <div
              className={`mt-5 rounded-2xl border-2 p-4 ${
                currentQuestion.evaluation.isCorrect
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                  : 'border-rose-300 bg-rose-50 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2 text-base font-black">
                {currentQuestion.evaluation.isCorrect ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    <span>¡Genial! Respuesta correcta 🎉</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-rose-600" />
                    <span>Respuesta correcta: {currentQuestion.evaluation.expectedAnswers.join(' / ')}</span>
                  </>
                )}
              </div>
              <p className="mt-1.5 text-sm font-semibold">{currentQuestion.evaluation.explanationEs}</p>
            </div>
          )}

          <div className="mt-6">
            {!currentQuestion?.submitted ? (
              <button
                type="button"
                disabled={!hasValidInput}
                onClick={() => setSession((prev) => (prev ? submitPracticeAnswer(prev, currentInput) : prev))}
                className="btn-duo btn-duo-green w-full py-3.5 text-base disabled:opacity-40"
              >
                Comprobar respuesta
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSession((prev) => (prev ? advancePracticeQuestion(prev) : prev));
                  setCurrentInput('');
                }}
                className="btn-duo btn-duo-blue w-full py-3.5 text-base"
              >
                {session.currentIndex + 1 === session.questions.length ? 'Ver resultado final 🏆' : 'Siguiente pregunta →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
