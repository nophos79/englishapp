import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  BookMarked,
  ClipboardCheck,
  Gift,
  Lock,
  Play,
  RefreshCcw,
  Star,
  Trophy,
} from 'lucide-react';
import {
  getAvatar,
  getStoredStudentThemeId,
  getStudentTheme,
} from '../../components/ui/Avatars';
import { useApp } from '../../context/AppContext';
import {
  COURSES,
  getCourse,
  getExerciseById,
  getOrderedUnitsForCourse,
} from '../../data/curriculum';
import { computeFamilyGoalProgress, computeStudentRewards } from '../../domain/rewardsEngine';
import type {
  AttemptRecord,
  CourseId,
  CustomExam,
  ExerciseItem,
  FamilyRewardGoal,
} from '../../domain/types';
import { familyRepository } from '../../services/familyRepository';

const VALID_COURSE_IDS: readonly CourseId[] = ['3p', '4p', '5p', '6p'];

function isCourseId(value: string | null): value is CourseId {
  return value !== null && (VALID_COURSE_IDS as readonly string[]).includes(value);
}

function courseStorageKey(studentId: string): string {
  return `englishapp_course_${studentId}`;
}

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
  const [searchParams, setSearchParams] = useSearchParams();

  const activeStudentId = activeStudent?.id;
  const defaultCourseId = activeStudent?.courseId ?? '5p';
  const paramCourse = searchParams.get('course');
  const paramUnit = searchParams.get('unit');

  const [selectedCourseId, setSelectedCourseId] = useState<CourseId>(() => {
    if (isCourseId(paramCourse)) return paramCourse;
    if (activeStudentId) {
      try {
        const stored = sessionStorage.getItem(courseStorageKey(activeStudentId));
        if (isCourseId(stored)) return stored;
      } catch {
        // Ignore storage restrictions
      }
    }
    return defaultCourseId;
  });
  const [unitAccess, setUnitAccess] = useState<Record<string, boolean>>({});
  const [exams, setExams] = useState<CustomExam[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [familyRewards, setFamilyRewards] = useState<FamilyRewardGoal[]>([]);
  const [pendingMistakes, setPendingMistakes] = useState(0);
  const scrolledUnitRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeStudentId) return;

    if (isCourseId(paramCourse)) {
      setSelectedCourseId(paramCourse);
      try {
        sessionStorage.setItem(courseStorageKey(activeStudentId), paramCourse);
      } catch {
        // Ignore storage restrictions
      }
      return;
    }

    try {
      const stored = sessionStorage.getItem(courseStorageKey(activeStudentId));
      if (isCourseId(stored)) {
        setSelectedCourseId(stored);
        return;
      }
    } catch {
      // Ignore storage restrictions
    }

    setSelectedCourseId(defaultCourseId);
  }, [activeStudentId, paramCourse, defaultCourseId]);

  const handleSelectCourse = (courseId: CourseId) => {
    setSelectedCourseId(courseId);
    if (activeStudentId) {
      try {
        sessionStorage.setItem(courseStorageKey(activeStudentId), courseId);
      } catch {
        // Ignore storage restrictions
      }
    }
    setSearchParams({ course: courseId }, { replace: true });
  };

  useEffect(() => {
    if (!paramUnit) return;
    const key = `${selectedCourseId}:${paramUnit}`;
    if (scrolledUnitRef.current === key) return;

    const timer = window.setTimeout(() => {
      const el = document.getElementById(`unit-${paramUnit}`);
      if (el) {
        scrolledUnitRef.current = key;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);

    return () => window.clearTimeout(timer);
  }, [paramUnit, selectedCourseId]);

  useEffect(() => {
    if (!activeStudentId) {
      navigate('/');
      return;
    }

    let cancelled = false;
    async function load() {
      await familyRepository.refreshFromRemote();
      const [access, examList, attemptList, mistakes, rewardList] = await Promise.all([
        familyRepository.getUnitAccess(activeStudentId!),
        familyRepository.listExams(activeStudentId!),
        familyRepository.listAttempts(activeStudentId!),
        familyRepository.listPendingMistakes(activeStudentId!),
        familyRepository.listFamilyRewards(activeStudentId!),
      ]);
      if (!cancelled) {
        setUnitAccess(access);
        setExams(examList.filter((e) => e.status === 'pending' || e.status === 'in_progress'));
        setAttempts(attemptList);
        setPendingMistakes(mistakes.length);
        setFamilyRewards(rewardList);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [activeStudentId, navigate]);

  const studentRewards = useMemo(
    () => computeStudentRewards(attempts, { lookupExercise: getExerciseById }),
    [attempts],
  );

  if (!activeStudent) return null;

  const avatar = getAvatar(activeStudent.avatarId);
  const activeTheme = getStudentTheme(getStoredStudentThemeId(activeStudent.id));
  const defaultCourse = getCourse(activeStudent.courseId);
  const course = getCourse(selectedCourseId);
  const activeFamilyGoal = familyRewards.find(
    (g) => g.status === 'active' || g.status === 'claimed',
  );
  const activeGoalProgress = activeFamilyGoal
    ? computeFamilyGoalProgress(activeFamilyGoal, studentRewards)
    : null;

  const getBestStarsForUnit = (unitId: string) => {
    const unitAttempts = attempts.filter((a) => a.unitId === unitId && a.status === 'completed');
    return unitAttempts.reduce((max, a) => Math.max(max, a.stars), 0);
  };

  const totalStars = getOrderedUnitsForCourse(selectedCourseId).reduce(
    (sum, u) => sum + getBestStarsForUnit(u.id),
    0,
  );

  return (
    <div className={`min-h-screen bg-gradient-to-b ${activeTheme.bgClass} pb-12`}>
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

        {/* Explorer Passport & Rewards Strip */}
        <section className="mb-5 rounded-3xl border-2 border-amber-200 bg-white/95 p-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                {studentRewards.rank.emoji}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-black text-slate-900">
                    Nv.{studentRewards.rank.level} · {studentRewards.rank.title}
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-800">
                    ⚡ {studentRewards.totalXp} XP
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-black text-emerald-800">
                    <Award className="h-3 w-3" /> {studentRewards.earnedBadgesCount}/
                    {studentRewards.totalBadgesCount} sellos
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-200 sm:w-36">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                      style={{ width: `${studentRewards.rankProgressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1" aria-label="Meta semanal">
                    {studentRewards.weekDaysStatus.map((d) => (
                      <span
                        key={d.dateKey}
                        title={d.dateKey}
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                          d.practiced
                            ? 'bg-emerald-500 text-white'
                            : d.isToday
                              ? 'border border-sky-400 bg-sky-50 text-sky-700'
                              : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {d.label}
                      </span>
                    ))}
                    <span className="ml-1 text-[11px] font-bold text-slate-500">
                      {studentRewards.weeklyDaysPracticed}/{studentRewards.weeklyTargetDays} días
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={Boolean(activeExamId)}
              onClick={() => navigate('/rewards')}
              className="btn-duo btn-duo-amber inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm disabled:opacity-40"
            >
              <Trophy className="h-4 w-4" /> Mi Pasaporte y Premios
            </button>
          </div>

          {activeFamilyGoal && activeGoalProgress && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                  <Gift className="h-4 w-4 shrink-0 text-amber-600" />
                  <span className="truncate">Premio Familiar: {activeFamilyGoal.title}</span>
                  <span className="ml-auto shrink-0 text-amber-800">
                    {activeGoalProgress.current}/{activeGoalProgress.target}{' '}
                    {activeFamilyGoal.metric === 'stars' ? '★' : 'ses.'}
                  </span>
                </p>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-amber-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500"
                    style={{ width: `${activeGoalProgress.percent}%` }}
                  />
                </div>
              </div>
              {activeFamilyGoal.status === 'active' && activeGoalProgress.reached && (
                <button
                  type="button"
                  onClick={async () => {
                    await familyRepository.claimFamilyReward(activeFamilyGoal.id);
                    const updated = await familyRepository.listFamilyRewards(activeStudent.id);
                    setFamilyRewards(updated);
                    navigate('/rewards?tab=family');
                  }}
                  className="btn-duo btn-duo-green px-3 py-1.5 text-xs"
                >
                  🎉 ¡Reclamar premio!
                </button>
              )}
              {activeFamilyGoal.status === 'claimed' && (
                <button
                  type="button"
                  onClick={() => navigate('/rewards?tab=family')}
                  className="rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-800"
                >
                  🎁 ¡Reclamado! Ver estado
                </button>
              )}
            </div>
          )}
        </section>

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
                  onClick={() => handleSelectCourse(c.id)}
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
                        id={`unit-${unit.id}`}
                        className={`flex scroll-mt-24 flex-col justify-between rounded-3xl border-2 border-b-4 p-5 transition ${
                          enabled
                            ? `${theme.border} bg-white shadow-xs`
                            : 'border-dashed border-slate-200 bg-slate-100/80 opacity-75'
                        } ${paramUnit === unit.id ? 'ring-2 ring-sky-400 ring-offset-2' : ''}`}
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

                        {enabled && (() => {
                          const isListeningEx = (e: ExerciseItem) =>
                            e.type === 'listening_choice' || e.type === 'listening_dictation';
                          const isReadingEx = (e: ExerciseItem) => e.type === 'reading_comprehension';

                          const vocabCount = unit.exercises.filter(
                            (e) =>
                              !isListeningEx(e) &&
                              !isReadingEx(e) &&
                              (e.skill === 'vocabulary' || e.skill === 'expressions'),
                          ).length;
                          const grammarCount = unit.exercises.filter(
                            (e) =>
                              !isListeningEx(e) &&
                              !isReadingEx(e) &&
                              (e.skill === 'grammar' || e.skill === 'irregular_verbs'),
                          ).length;
                          const listeningCount = unit.exercises.filter(isListeningEx).length;
                          const readingCount = unit.exercises.filter(isReadingEx).length;

                          return (
                            <div className="mt-4 space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  disabled={vocabCount === 0}
                                  onClick={() => navigate(`/practice/${unit.id}?focus=vocabulary`)}
                                  className="btn-duo btn-duo-white px-2.5 py-2 text-xs font-black text-emerald-800 hover:border-emerald-400 disabled:opacity-40"
                                >
                                  📘 Vocabulario ({vocabCount})
                                </button>
                                <button
                                  type="button"
                                  disabled={grammarCount === 0}
                                  onClick={() => navigate(`/practice/${unit.id}?focus=grammar`)}
                                  className="btn-duo btn-duo-white px-2.5 py-2 text-xs font-black text-sky-800 hover:border-sky-400 disabled:opacity-40"
                                >
                                  🧩 Gramática ({grammarCount})
                                </button>
                                <button
                                  type="button"
                                  disabled={listeningCount === 0}
                                  onClick={() => navigate(`/practice/${unit.id}?focus=listening`)}
                                  className="btn-duo btn-duo-white px-2.5 py-2 text-xs font-black text-indigo-800 hover:border-indigo-400 disabled:opacity-40"
                                >
                                  🎧 Listening ({listeningCount})
                                </button>
                                <button
                                  type="button"
                                  disabled={readingCount === 0}
                                  onClick={() => navigate(`/practice/${unit.id}?focus=reading`)}
                                  className="btn-duo btn-duo-white px-2.5 py-2 text-xs font-black text-amber-800 hover:border-amber-400 disabled:opacity-40"
                                >
                                  📖 Reading ({readingCount})
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => navigate(`/practice/${unit.id}`)}
                                className={`btn-duo ${theme.btn} inline-flex w-full items-center justify-center gap-2 py-2.5 text-sm`}
                              >
                                <Play className="h-4 w-4 fill-current" /> Reto completo ({unit.exercises.length} ej.)
                              </button>
                            </div>
                          );
                        })()}
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
