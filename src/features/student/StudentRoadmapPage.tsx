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
} from 'lucide-react';
import { getAvatar } from '../../components/ui/Avatars';
import { useApp } from '../../context/AppContext';
import { COURSES, getCourse, getOrderedUnitsForCourse } from '../../data/curriculum';
import type { AttemptRecord, CourseId, CustomExam } from '../../domain/types';
import { familyRepository } from '../../services/familyRepository';

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

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label="Cambiar de perfil"
              className="touch-target flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${avatar.bg}`}>
              {avatar.emoji}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">¡Hola, {activeStudent.nickname}!</h1>
              <p className="text-xs font-bold text-blue-700">Tu curso: {defaultCourse.label}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/practice/mistakes?mode=mistake_review')}
              className="touch-target inline-flex items-center gap-1.5 rounded-2xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-sm font-bold text-amber-900 hover:bg-amber-100"
            >
              <RefreshCcw className="h-4 w-4" />
              Repasar errores ({pendingMistakes})
            </button>
            <button
              type="button"
              disabled={Boolean(activeExamId)}
              onClick={() => navigate('/banks')}
              className="touch-target inline-flex items-center gap-1.5 rounded-2xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-bold text-blue-900 hover:bg-blue-100 disabled:opacity-40"
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
          <section className="mb-6 rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-5">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-indigo-950">
              <ClipboardCheck className="h-5 w-5 text-indigo-700" />
              Tienes {exams.length} {exams.length === 1 ? 'examen asignado' : 'exámenes asignados'}
            </h2>
            <div className="mt-3 space-y-2.5">
              {exams.map((ex) => (
                <div
                  key={ex.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-xs"
                >
                  <div>
                    <p className="font-extrabold text-slate-900">{ex.title}</p>
                    <p className="text-xs text-slate-600">
                      {ex.exerciseIds.length} preguntas ·{' '}
                      {ex.status === 'in_progress' ? 'En curso (continuar)' : 'Pendiente de realizar'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/exam/${ex.id}`)}
                    className="touch-target rounded-2xl bg-indigo-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-800"
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
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Elige el curso que quieres practicar o repasar:
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                  className={`touch-target flex flex-col items-center justify-center rounded-2xl border-2 px-3 py-2.5 text-center transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-700 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300'
                  }`}
                >
                  <span className="text-sm font-extrabold">
                    {c.label} {isDefault ? '★' : ''}
                  </span>
                  <span className={`text-xs font-semibold ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                    {unlockedCount} {unlockedCount === 1 ? 'unidad activa' : 'unidades activas'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Exact School-Year Roadmap */}
        <div className="space-y-8">
          {course.terms.map((term) => (
            <section key={term.id}>
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-xl bg-blue-700 px-3 py-1 text-xs font-extrabold uppercase text-white">
                  {term.number}º Trimestre
                </span>
                <h2 className="text-lg font-extrabold text-slate-900">{term.label}</h2>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                {term.units.map((unit) => {
                  const enabled = Boolean(unitAccess[unit.id]);
                  const bestStars = getBestStarsForUnit(unit.id);

                  return (
                    <div
                      key={unit.id}
                      className={`flex flex-col justify-between rounded-3xl border-2 p-5 transition ${
                        enabled
                          ? 'border-slate-200 bg-white shadow-xs hover:border-blue-400'
                          : 'border-dashed border-slate-200 bg-slate-100/80 opacity-75'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-extrabold text-slate-700">
                            {unit.code}
                          </span>
                          {enabled ? (
                            <div className="flex gap-0.5" aria-label={`${bestStars} de 3 estrellas`}>
                              {[1, 2, 3].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-4 w-4 ${
                                    s <= bestStars ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                              <Lock className="h-3.5 w-3.5" /> Bloqueada
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2 text-lg font-extrabold text-slate-900">{unit.title}</h3>

                        {enabled ? (
                          <div className="mt-2 space-y-1 text-xs text-slate-600">
                            <p>
                              <strong>Vocabulario:</strong> {unit.vocabularySummary.join(', ')}
                            </p>
                            <p>
                              <strong>Gramática:</strong> {unit.grammarSummary.join(' · ')}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-slate-500">
                            Tu padre/madre activará esta unidad cuando lleguéis a ella en el colegio.
                          </p>
                        )}
                      </div>

                      {enabled && (
                        <button
                          type="button"
                          onClick={() => navigate(`/practice/${unit.id}`)}
                          className="touch-target mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
                        >
                          <Play className="h-4 w-4" /> Practicar ({unit.exercises.length} ejercicios)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
