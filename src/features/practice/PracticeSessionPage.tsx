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
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ExerciseRenderer } from './ExerciseRenderer';

export function PracticeSessionPage() {
  const { activeStudent, refreshAll } = useApp();
  const { unitId } = useParams<{ unitId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = (searchParams.get('mode') as AttemptMode) || 'practice';
  const focus = searchParams.get('focus') as
    | 'vocabulary'
    | 'grammar'
    | 'listening'
    | 'reading'
    | null;

  const [session, setSession] = useState<PracticeSessionState | null>(null);
  const [currentInput, setCurrentInput] = useState<string | Record<string, string>>('');
  const [title, setTitle] = useState('Sesión de práctica');
  const [saved, setSaved] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const activeStudentId = activeStudent?.id;

  const returnPath = useMemo(() => {
    if (unitId === 'bank-irregular-verbs') return '/banks?tab=verbs';
    if (unitId === 'bank-expressions') return '/banks?tab=expressions';
    if (unitId && unitId !== 'mistakes') {
      const unit = getUnitById(unitId);
      if (unit) return `/student?course=${unit.courseId}&unit=${unit.id}`;
    }
    return '/student';
  }, [unitId]);

  const returnLabel =
    unitId === 'bank-irregular-verbs' || unitId === 'bank-expressions'
      ? 'Volver al banco de recursos'
      : 'Volver a mis unidades';

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
          navigate(returnPath);
          return;
        }
        const unit = getUnitById(unitId);
        if (unit) {
          const isListeningEx = (e: ExerciseItem) =>
            e.type === 'listening_choice' || e.type === 'listening_dictation';
          const isReadingEx = (e: ExerciseItem) => e.type === 'reading_comprehension';

          if (focus === 'vocabulary') {
            exercises = unit.exercises.filter(
              (e) =>
                !isListeningEx(e) &&
                !isReadingEx(e) &&
                (e.skill === 'vocabulary' || e.skill === 'expressions'),
            );
            sessionTitle = `${unit.code}: ${unit.title} · Vocabulario`;
          } else if (focus === 'grammar') {
            exercises = unit.exercises.filter(
              (e) =>
                !isListeningEx(e) &&
                !isReadingEx(e) &&
                (e.skill === 'grammar' || e.skill === 'irregular_verbs'),
            );
            sessionTitle = `${unit.code}: ${unit.title} · Gramática`;
          } else if (focus === 'listening') {
            exercises = unit.exercises.filter(isListeningEx);
            sessionTitle = `${unit.code}: ${unit.title} · Listening`;
          } else if (focus === 'reading') {
            exercises = unit.exercises.filter(isReadingEx);
            sessionTitle = `${unit.code}: ${unit.title} · Reading`;
          } else {
            exercises = unit.exercises;
            sessionTitle = `${unit.code}: ${unit.title} · Completo`;
          }
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
  }, [activeStudentId, unitId, mode, focus, navigate, returnPath]);

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

  const isSessionFinished = session?.finished;
  const isQuestionSubmitted = currentQuestion?.submitted;
  const answeredCount = session ? session.questions.filter((q) => q.submitted).length : 0;

  useEffect(() => {
    if (!session || isSessionFinished || !currentQuestion || showExitDialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('header')) return;

      if (isQuestionSubmitted) {
        e.preventDefault();
        setSession((prev) => (prev ? advancePracticeQuestion(prev) : prev));
        setCurrentInput('');
      } else if (hasValidInput && target?.tagName === 'INPUT') {
        e.preventDefault();
        setSession((prev) => (prev ? submitPracticeAnswer(prev, currentInput) : prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    session,
    isSessionFinished,
    currentQuestion,
    isQuestionSubmitted,
    showExitDialog,
    hasValidInput,
    currentInput,
  ]);

  if (!activeStudent || !session) {
    return <div className="p-8 text-center text-slate-600">Cargando sesión...</div>;
  }

  const handleExit = () => {
    if (!session.finished && answeredCount > 0) {
      setShowExitDialog(true);
      return;
    }
    navigate(returnPath);
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
            onClick={() => navigate(returnPath)}
            className="touch-target mt-6 w-full rounded-2xl bg-blue-700 py-3 font-bold text-white hover:bg-blue-800"
          >
            {returnLabel}
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
              onClick={() => navigate(returnPath)}
              className="touch-target w-full rounded-2xl border border-slate-300 bg-white py-3 font-bold text-slate-700 hover:bg-slate-50"
            >
              {returnLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pt-3 pb-4 sm:px-6 sm:pt-4">
        <header className="mb-2.5 flex items-center justify-between gap-3">
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

        <div className="mb-3 h-3 w-full overflow-hidden rounded-full bg-slate-200 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-300"
            style={{ width: `${((session.currentIndex + 1) / session.questions.length) * 100}%` }}
          />
        </div>

        <div className="rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-md sm:p-5">
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
        </div>
      </div>

      <div
        className={`sticky bottom-0 z-10 border-t-2 shadow-[0_-4px_16px_rgba(15,23,42,0.06)] transition-colors ${
          !currentQuestion?.submitted
            ? 'border-slate-200 bg-white/95 backdrop-blur'
            : currentQuestion.evaluation?.isCorrect
              ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
              : 'border-rose-300 bg-rose-50 text-rose-950'
        }`}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-2.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
          {!currentQuestion?.submitted ? (
            <>
              <p className="hidden text-xs font-bold text-slate-400 sm:block">
                Elige o escribe tu respuesta y pulsa Comprobar
              </p>
              <button
                key="submit-answer"
                type="button"
                disabled={!hasValidInput}
                onClick={() => setSession((prev) => (prev ? submitPracticeAnswer(prev, currentInput) : prev))}
                className="btn-duo btn-duo-green w-full py-3 text-base disabled:opacity-40 sm:w-auto sm:min-w-56"
              >
                Comprobar respuesta
              </button>
            </>
          ) : (
            <>
              <div className="min-w-0 flex-1">
                {currentQuestion.evaluation && (
                  <>
                    <div className="flex items-start gap-2 text-sm font-black sm:text-base">
                      {currentQuestion.evaluation.isCorrect ? (
                        <>
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                          <span>¡Genial! Respuesta correcta 🎉</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                          <span>
                            Respuesta correcta: {currentQuestion.evaluation.expectedAnswers.join(' / ')}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs font-semibold leading-snug sm:text-sm">
                      {currentQuestion.evaluation.explanationEs}
                    </p>
                    {currentQuestion.exercise.audioText && (
                      <p className="mt-0.5 text-xs font-extrabold opacity-80">
                        Audio en inglés: &ldquo;{currentQuestion.exercise.audioText}&rdquo;
                      </p>
                    )}
                  </>
                )}
              </div>
              <div className="shrink-0">
                <button
                  key="next-question"
                  type="button"
                  onClick={() => {
                    setSession((prev) => (prev ? advancePracticeQuestion(prev) : prev));
                    setCurrentInput('');
                  }}
                  className="btn-duo btn-duo-blue w-full py-3 text-sm sm:w-auto sm:min-w-48 sm:text-base"
                >
                  {session.currentIndex + 1 === session.questions.length
                    ? 'Ver resultado final 🏆'
                    : 'Siguiente pregunta →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showExitDialog}
        tone="amber"
        title="¿Salir de esta actividad?"
        description={`Llevas ${answeredCount} de ${session.questions.length} ${
          answeredCount === 1 ? 'pregunta contestada' : 'preguntas contestadas'
        }. Si sales ahora perderás el progreso de este intento.`}
        cancelLabel="Seguir practicando"
        confirmLabel="Salir sin guardar"
        onCancel={() => setShowExitDialog(false)}
        onConfirm={() => {
          setShowExitDialog(false);
          navigate(returnPath);
        }}
      />
    </div>
  );
}
