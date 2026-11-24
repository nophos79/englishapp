import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookMarked,
  ClipboardCheck,
  Lock,
  Play,
  RefreshCcw,
  Star,
  Trophy,
} from 'lucide-react';
import { getAvatar } from '../../components/ui/Avatars';
import { useApp } from '../../context/AppContext';
import { COURSES, getCourse, getOrderedUnitsForCourse } from '../../data/curriculum';
import type { AttemptRecord, CourseId, CustomExam } from '../../domain/types';
import { familyRepository } from '../../services/familyRepository';

const TERM_THEMES = {
  1: {
    badge: 'bg-emerald-500 text-white',
    border: 'border-emerald-200 hover:border-emerald-400',
    btn: 'btn-duo-green',
    pill: 'bg-emerald-100 text-emerald-800',
  },
  2: {
    badge: 'bg-sky-500 text-white',
    border: 'border-sky-200 hover:border-sky-400',
    btn: 'btn-duo-blue',
    pill: 'bg-sky-100 text-sky-800',
  },
  3: {
    badge: 'bg-violet-500 text-white',
    border: 'border-violet-200 hover:border-violet-400',
    btn: 'btn-duo-purple',
    pill: 'bg-violet-100 text-violet-800',
  },
} as const;

export function StudentRoadmapPage() {
  const { activeStudent, activeExamId } = useApp();
  const navigate = useNavigate();

  const [selectedCourseId, setSelectedCourseId] = useState<CourseId>(
    activeStudent?.courseId ?? '5p',
  );
  const [unitAccess, setUnitAccess] = useState<Record<string, boolean>>({});
  const [exams, setExams] = useState<CustomExam[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [pendingMistakes, setPendingMistakes] = useState(0);

  useEffect(() => {
    if (activeStudent) {
      setSelectedCourseId(activeStudent.courseId);
    }
  }, [activeStudent]);

  useEffect(() => {
    if (!activeStudent) {
      navigate('/');
      return;
    }

    let cancelled = false;
    async function load() {
      await familyRepository.refreshFromRemote();
      const [access, examList, attemptList, mistakes] = await Promise.all([
        familyRepository.getUnitAccess(activeStudent!.id),
        familyRepository.listExams(activeStudent!.id),
        familyRepository.listAttempts(activeStudent!.id),
        familyRepository.listPendingMistakes(activeStudent!.id),
      ]);
      if (!cancelled) {
        setUnitAccess(access);
        setExams(examList.filter((e) => e.status === 'pending' || e.status === 'in_progress'));
        setAttempts(attemptList);
        setPendingMistakes(mistakes.length);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [activeStudent, navigate]);

  if (!activeStudent) return null;

  const avatar = getAvatar(activeStudent.avatarId);
  const defaultCourse = getCourse(activeStudent.courseId);
  const course = getCourse(selectedCourseId);

  const getBestStarsForUnit = (unitId: string) => {
    const unitAttempts = attempts.filter((a) => a.unitId === unitId && a.status === 'completed');
    return unitAttempts.reduce((max, a) => Math.max(max, a.stars), 0);
  };

  const totalStars = getOrderedUnitsForCourse(selectedCourseId).reduce(
    (sum, u) => sum + getBestStarsForUnit(u.id),
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50/40 pb-12">
      <header className="sticky top-0 z-10 border-b-2 border-sky-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label="Cambiar de perfil"
              className="btn-duo btn-duo-white flex items-center justify-center px-3 text-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-xs ${avatar.bg}`}>
              {avatar.emoji}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">¡Hola, {activeStudent.nickname}!</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-emerald-700">
                  Tu curso: {defaultCourse.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-800">
                  <Trophy className="h-3 w-3 text-amber-600" /> {totalStars} ★
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/practice/mistakes?mode=mistake_review')}
              className="btn-duo btn-duo-amber inline-flex items-center gap-1.5 px-3.5 py-2 text-sm"
            >
              <RefreshCcw className="h-4 w-4" />
              Errores ({pendingMistakes})
            </button>
            <button
              type="button"
              disabled={Boolean(activeExamId)}
              onClick={() => navigate('/banks')}
              className="btn-duo btn-duo-blue inline-flex items-center gap-1.5 px-3.5 py-2 text-sm disabled:opacity-40"
            >
              <BookMarked className="h-4 w-4" />
              Verbos y Expresiones
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-6">
        {/* Pending / In-progress Assigned Exams */}
        {exams.length > 0 && (
          <section className="mb-6 rounded-3xl border-2 border-violet-300 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-black text-violet-950">
              <ClipboardCheck className="h-6 w-6 text-violet-600" />
              ¡Tienes {exams.length} {exams.length === 1 ? 'examen asignado' : 'exámenes asignados'}!
            </h2>
            <div className="mt-3 space-y-2.5">
              {exams.map((ex) => (
                <div
                  key={ex.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-violet-100 bg-white p-4 shadow-xs"
                >
                  <div>
                    <p className="text-base font-black text-slate-900">{ex.title}</p>
                    <p className="text-xs font-bold text-violet-700">
                      {ex.exerciseIds.length} preguntas ·{' '}
                      {ex.status === 'in_progress' ? 'En curso (continuar)' : 'Pendiente de realizar'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/exam/${ex.id}`)}
                    className="btn-duo btn-duo-purple px-5 py-2.5 text-sm"
                  >
                    {ex.status === 'in_progress' ? 'Continuar examen' : 'Empezar examen'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Course Selector for Multi-Course Review */}
        <section className="mb-6">
          <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
            Elige el curso que quieres practicar o repasar:
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {COURSES.map((c) => {
              const isSelected = c.id === selectedCourseId;
              const isDefault = c.id === activeStudent.courseId;
              const unlockedCount = getOrderedUnitsForCourse(c.id).filter(
                (u) => unitAccess[u.id],
              ).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCourseId(c.id)}
                  className={`btn-duo flex flex-col items-center justify-center px-3 py-2.5 text-center ${
                    isSelected ? 'btn-duo-green' : 'btn-duo-white'
                  }`}
                >
                  <span className="text-sm font-black">
                    {c.label} {isDefault ? '★' : ''}
                  </span>
                  <span className={`text-xs font-bold ${isSelected ? 'text-emerald-50' : 'text-slate-500'}`}>
                    {unlockedCount} {unlockedCount === 1 ? 'unidad activa' : 'unidades activas'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Exact School-Year Roadmap */}
        <div className="space-y-8">
          {course.terms.map((term) => {
            const theme = TERM_THEMES[term.number];
            return (
              <section key={term.id}>
                <div className="mb-3.5 flex items-center gap-2.5">
                  <span className={`rounded-2xl px-3.5 py-1 text-xs font-black uppercase shadow-xs ${theme.badge}`}>
                    {term.number}º Trimestre
                  </span>
                  <h2 className="text-xl font-black text-slate-900">{term.label}</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {term.units.map((unit) => {
                    const enabled = Boolean(unitAccess[unit.id]);
                    const bestStars = getBestStarsForUnit(unit.id);

                    return (
                      <div
                        key={unit.id}
                        className={`flex flex-col justify-between rounded-3xl border-2 border-b-4 p-5 transition ${
                          enabled
                            ? `${theme.border} bg-white shadow-xs`
                            : 'border-dashed border-slate-200 bg-slate-100/80 opacity-75'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`rounded-xl px-2.5 py-0.5 text-xs font-black ${
                                enabled ? theme.pill : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {unit.code}
                            </span>
                            {enabled ? (
                              <div className="flex gap-0.5" aria-label={`${bestStars} de 3 estrellas`}>
                                {[1, 2, 3].map((s) => (
                                  <Star
                                    key={s}
                                    className={`h-5 w-5 ${
                                      s <= bestStars ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-500">
                                <Lock className="h-3.5 w-3.5" /> Bloqueada
                              </span>
                            )}
                          </div>

                          <h3 className="mt-2.5 text-lg font-black text-slate-900">{unit.title}</h3>

                          {enabled ? (
                            <div className="mt-2 space-y-1 text-xs font-semibold text-slate-600">
                              <p>
                                <strong className="text-slate-800">Vocabulario:</strong>{' '}
                                {unit.vocabularySummary.join(', ')}
                              </p>
                              <p>
                                <strong className="text-slate-800">Gramática:</strong>{' '}
                                {unit.grammarSummary.join(' · ')}
                              </p>
                            </div>
                          ) : (
                            <p className="mt-2 text-xs font-semibold text-slate-500">
                              Tu padre/madre activará esta unidad cuando lleguéis a ella en el colegio.
                            </p>
                          )}
                        </div>

                        {enabled && (
                          <button
                            type="button"
                            onClick={() => navigate(`/practice/${unit.id}`)}
                            className={`btn-duo ${theme.btn} mt-4 inline-flex w-full items-center justify-center gap-2 py-2.5 text-sm`}
                          >
                            <Play className="h-4 w-4 fill-current" /> ¡Practicar! ({unit.exercises.length} ej.)
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
