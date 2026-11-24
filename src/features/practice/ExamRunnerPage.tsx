import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, EyeOff, ShieldAlert, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getExerciseById } from '../../data/curriculum';
import { evaluateAnswer } from '../../domain/answerEvaluator';
import { shuffleArray } from '../../domain/randomizer';
import { buildAttemptRecord } from '../../domain/sessionMachine';
import type { ActiveExamSession, AnswerDetail, AttemptRecord, CustomExam, ExerciseItem } from '../../domain/types';
import { familyRepository, generateUuid } from '../../services/familyRepository';
import {
  deleteActiveExamSession,
  getActiveExamSession,
  saveActiveExamSession,
} from '../../services/localDb';
import { ExerciseRenderer } from './ExerciseRenderer';

export function ExamRunnerPage() {
  const { activeStudent, setActiveExamId, refreshAll } = useApp();
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<CustomExam | null>(null);
  const [session, setSession] = useState<ActiveExamSession | null>(null);
  const [submittedAttempt, setSubmittedAttempt] = useState<AttemptRecord | null>(null);
  const hiddenAtRef = useRef<number | null>(null);
  const sessionRef = useRef<ActiveExamSession | null>(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Detect tab/app switching during active exam (anti-cheat telemetry)
  useEffect(() => {
    if (submittedAttempt) return;

    const handleVisibilityChange = () => {
      const active = sessionRef.current;
      if (!active) return;

      if (document.hidden) {
        hiddenAtRef.current = Date.now();
      } else if (hiddenAtRef.current !== null) {
        const awaySec = Math.max(1, Math.round((Date.now() - hiddenAtRef.current) / 1000));
        hiddenAtRef.current = null;
        const next: ActiveExamSession = {
          ...active,
          focusLossCount: (active.focusLossCount ?? 0) + 1,
          focusLossSeconds: (active.focusLossSeconds ?? 0) + awaySec,
        };
        setSession(next);
        void saveActiveExamSession(next);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [submittedAttempt]);

  const activeStudentId = activeStudent?.id;

  useEffect(() => {
    if (!activeStudentId || !examId) {
      navigate('/');
      return;
    }

    let cancelled = false;
    async function initExam() {
      const exams = await familyRepository.listExams(activeStudentId!);
      const target = exams.find((e) => e.id === examId);
      if (!target || target.status === 'completed' || target.status === 'abandoned') {
        navigate('/student');
        return;
      }

      // Restore in-progress session across browser reloads (anti-cheat rule)
      let activeSess = await getActiveExamSession(target.id);
      if (!activeSess) {
        const optionOrderByExercise: Record<string, string[]> = {};
        for (const id of target.exerciseIds) {
          const ex = getExerciseById(id);
          if (ex?.options && ex.type !== 'true_false') optionOrderByExercise[id] = shuffleArray(ex.options);
          if (ex?.pairs) optionOrderByExercise[id] = shuffleArray(ex.pairs.map((p) => p.right));
          if (ex?.tokens) optionOrderByExercise[id] = shuffleArray(ex.tokens);
        }
        activeSess = {
          examId: target.id,
          studentId: activeStudentId!,
          startedAt: new Date().toISOString(),
          currentIndex: 0,
          exerciseIds: target.exerciseIds,
          optionOrderByExercise,
          answers: {},
        };
        await saveActiveExamSession(activeSess);
        await familyRepository.transitionExamStatus(target.id, 'in_progress');
      }

      if (!cancelled) {
        setExam(target);
        setSession(activeSess);
        setActiveExamId(target.id);
      }
    }

    void initExam();
    return () => {
      cancelled = true;
    };
  }, [activeStudentId, examId, navigate, setActiveExamId]);

  const exercises = useMemo(() => {
    if (!session) return [];
    return session.exerciseIds
      .map((id) => getExerciseById(id))
      .filter((e): e is ExerciseItem => Boolean(e));
  }, [session]);

  const currentExercise = session ? exercises[session.currentIndex] : undefined;

  const updateAnswer = async (val: string | Record<string, string>) => {
    if (!session || !currentExercise) return;
    const next: ActiveExamSession = {
      ...session,
      answers: {
        ...session.answers,
        [currentExercise.id]: val,
      },
    };
    setSession(next);
    await saveActiveExamSession(next);
  };

  const goToIndex = async (idx: number) => {
    if (!session) return;
    const next: ActiveExamSession = { ...session, currentIndex: idx };
    setSession(next);
    await saveActiveExamSession(next);
  };

  const finalizeExam = async (status: 'completed' | 'abandoned') => {
    if (!session || !exam || !activeStudent) return;

    const answersDetail: AnswerDetail[] = exercises.map((ex) => {
      const submitted = session.answers[ex.id] ?? '';
      const evalRes = evaluateAnswer(ex, submitted);
      return {
        exerciseId: ex.id,
        unitId: ex.unitId,
        submittedAnswer: evalRes.normalizedSubmitted,
        expectedAnswers: evalRes.expectedAnswers,
        isCorrect: evalRes.isCorrect,
      };
    });

    const attempt = buildAttemptRecord({
      id: generateUuid(),
      familyId: activeStudent.familyId,
      studentId: activeStudent.id,
      mode: 'exam',
      examId: exam.id,
      status,
      startedAt: session.startedAt,
      answersDetail,
      totalQuestions: exercises.length,
      focusLossCount: session.focusLossCount ?? 0,
      focusLossSeconds: session.focusLossSeconds ?? 0,
    });

    await familyRepository.recordAttempt(attempt);
    await familyRepository.transitionExamStatus(exam.id, status);

    const missed = answersDetail
      .filter((a) => !a.isCorrect)
      .map((a) => ({ exerciseId: a.exerciseId, unitId: a.unitId }));
    if (missed.length > 0) {
      await familyRepository.recordMistakes(activeStudent.id, missed);
    }

    await deleteActiveExamSession(exam.id);
    setActiveExamId(null);
    await refreshAll();

    if (status === 'abandoned') {
      navigate('/student');
    } else {
      setSubmittedAttempt(attempt);
    }
  };

  const handleDeliver = async () => {
    const answeredCount = exercises.filter((ex) => {
      const v = session?.answers[ex.id];
      if (!v) return false;
      if (typeof v === 'string') return v.trim().length > 0;
      return Object.values(v).some(Boolean);
    }).length;

    const msg =
      answeredCount < exercises.length
        ? `Te faltan ${exercises.length - answeredCount} preguntas por contestar. ¿Entregar examen igualmente? No podrás cambiar tus respuestas.`
        : '¿Seguro que quieres entregar el examen? Una vez entregado quedará guardado para tus padres.';
    if (!window.confirm(msg)) return;
    await finalizeExam('completed');
  };

  const handleAbandon = async () => {
    const ok = window.confirm(
      'Si abandonas el examen, quedará registrado como ABANDONADO en el historial de tus padres. ¿Continuar?',
    );
    if (!ok) return;
    await finalizeExam('abandoned');
  };

  if (submittedAttempt && exam) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
          <div className="text-center">
            <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              Examen entregado y registrado
            </span>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900">{exam.title}</h1>
            <p className="mt-3 text-4xl font-black text-blue-700">{submittedAttempt.scorePercent}%</p>
            <p className="text-sm font-bold text-slate-600">
              {submittedAttempt.correctCount} de {submittedAttempt.totalQuestions} aciertos · Intento cerrado
            </p>
          </div>

          <div className="mt-6 space-y-2.5">
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">
              Revisión de tus respuestas
            </h2>
            {submittedAttempt.answersDetail.map((ans, idx) => {
              const ex = getExerciseById(ans.exerciseId);
              return (
                <div
                  key={ans.exerciseId}
                  className={`rounded-2xl border p-3.5 text-sm ${
                    ans.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {ans.isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                    )}
                    <div>
                      <p className="font-bold text-slate-900">
                        {idx + 1}. {ex?.promptEs}
                      </p>
                      <p className="mt-1 text-xs text-slate-700">
                        Tu respuesta: <strong>{ans.submittedAnswer || '(sin responder)'}</strong>
                      </p>
                      {!ans.isCorrect && (
                        <>
                          <p className="text-xs font-bold text-emerald-800">
                            Correcta: {ans.expectedAnswers.join(' / ')}
                          </p>
                          {ex && <p className="mt-1 text-xs text-slate-600">{ex.explanationEs}</p>}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => navigate('/student')}
            className="touch-target mt-6 w-full rounded-2xl bg-blue-700 py-3.5 font-bold text-white hover:bg-blue-800"
          >
            Volver a mi curso
          </button>
        </div>
      </div>
    );
  }

  if (!exam || !session || !currentExercise) {
    return <div className="p-8 text-center text-slate-600">Preparando examen...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-900">
          <span className="inline-flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" /> Modo Examen: bancos bloqueados · Sin pistas · Salidas de pantalla registradas
          </span>
          <button
            type="button"
            onClick={handleAbandon}
            className="inline-flex items-center gap-1 text-rose-700 underline"
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Abandonar
          </button>
        </div>

        {(session.focusLossCount ?? 0) > 0 && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-800"
          >
            <EyeOff className="h-4 w-4 shrink-0" />
            <span>
              Aviso: has salido de la pantalla del examen {session.focusLossCount}{' '}
              {session.focusLossCount === 1 ? 'vez' : 'veces'} ({session.focusLossSeconds ?? 0}s). Quedará registrado
              en el historial de tus padres.
            </span>
          </div>
        )}

        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-extrabold text-slate-900">{exam.title}</h1>
          <span className="text-sm font-extrabold text-blue-700">
            {session.currentIndex + 1} / {exercises.length}
          </span>
        </header>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {exercises.map((ex, idx) => {
            const answered = Boolean(session.answers[ex.id]);
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => void goToIndex(idx)}
                className={`h-9 w-9 rounded-xl text-xs font-bold transition ${
                  idx === session.currentIndex
                    ? 'bg-blue-700 text-white'
                    : answered
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-white text-slate-600 border border-slate-300'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <ExerciseRenderer
            exercise={currentExercise}
            shuffledOptions={
              currentExercise.type === 'multiple_choice' ||
              currentExercise.type === 'odd_one_out' ||
              currentExercise.type === 'listening_choice'
                ? session.optionOrderByExercise[currentExercise.id]
                : undefined
            }
            shuffledRightPairs={
              currentExercise.type === 'matching' || currentExercise.type === 'word_builder'
                ? session.optionOrderByExercise[currentExercise.id]
                : undefined
            }
            shuffledTokens={
              currentExercise.type === 'sentence_order'
                ? session.optionOrderByExercise[currentExercise.id]
                : undefined
            }
            value={session.answers[currentExercise.id] ?? ''}
            onChange={(v) => void updateAnswer(v)}
            disabled={false}
            isExamMode
          />

          <div className="mt-6 flex flex-wrap justify-between gap-2">
            <button
              type="button"
              disabled={session.currentIndex === 0}
              onClick={() => void goToIndex(session.currentIndex - 1)}
              className="touch-target rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 disabled:opacity-40"
            >
              Anterior
            </button>

            {session.currentIndex + 1 < exercises.length ? (
              <button
                type="button"
                onClick={() => void goToIndex(session.currentIndex + 1)}
                className="touch-target rounded-2xl bg-blue-700 px-6 py-3 text-sm font-bold text-white hover:bg-blue-800"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleDeliver()}
                className="touch-target rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Entregar examen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
