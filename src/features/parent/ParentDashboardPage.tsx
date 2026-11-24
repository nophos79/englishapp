import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookCheck,
  CheckCircle2,
  ClipboardList,
  History,
  Lock,
  LogOut,
  Plus,
  RotateCcw,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { AVATARS, getAvatar } from '../../components/ui/Avatars';
import { useApp } from '../../context/AppContext';
import { COURSES, getAllExercises, getCourse, getOrderedUnitsForCourse } from '../../data/curriculum';
import { generateExamExercises } from '../../domain/examGenerator';
import type { AttemptRecord, CourseId, CustomExam, SkillFocus } from '../../domain/types';
import { familyRepository } from '../../services/familyRepository';

type ParentTab = 'students' | 'units' | 'exams' | 'history';

export function ParentDashboardPage() {
  const { students, refreshAll, signOutFamily, localMode } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState<ParentTab>('units');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id ?? '');
  const [managingCourseId, setManagingCourseId] = useState<CourseId>(students[0]?.courseId ?? '5p');
  const [unitAccess, setUnitAccess] = useState<Record<string, boolean>>({});
  const [exams, setExams] = useState<CustomExam[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Add student form
  const [newNickname, setNewNickname] = useState('');
  const [newAvatar, setNewAvatar] = useState<string>(AVATARS[1].id);
  const [newCourse, setNewCourse] = useState<CourseId>('3p');

  // Exam generator form
  const [examTitle, setExamTitle] = useState('');
  const [selectedExamUnits, setSelectedExamUnits] = useState<string[]>([]);
  const [skillFocus, setSkillFocus] = useState<SkillFocus>('mixed');
  const [questionCount, setQuestionCount] = useState(10);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) ?? students[0] ?? null,
    [students, selectedStudentId],
  );

  useEffect(() => {
    if (!selectedStudent && students[0]) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudent]);

  useEffect(() => {
    if (!selectedStudent) return;
    setManagingCourseId(selectedStudent.courseId);
    let active = true;
    async function loadStudentData() {
      await familyRepository.refreshFromRemote();
      const [access, examList, attemptList] = await Promise.all([
        familyRepository.getUnitAccess(selectedStudent!.id),
        familyRepository.listExams(selectedStudent!.id),
        familyRepository.listAttempts(selectedStudent!.id),
      ]);
      if (!active) return;
      setUnitAccess(access);
      setExams(examList);
      setAttempts(attemptList);
      setSelectedExamUnits([]);
    }
    void loadStudentData();
    return () => {
      active = false;
    };
  }, [selectedStudent, tab]);

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    window.setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const courseUnits = selectedStudent ? getOrderedUnitsForCourse(managingCourseId) : [];
  const allExercises = useMemo(() => getAllExercises(), []);

  const handleToggleUnit = async (unitId: string) => {
    if (!selectedStudent) return;
    const next = !unitAccess[unitId];
    setUnitAccess((prev) => ({ ...prev, [unitId]: next }));
    await familyRepository.setUnitAccess(selectedStudent.id, { [unitId]: next });
  };

  const handleEnableUpTo = async (schoolOrder: number) => {
    if (!selectedStudent) return;
    const updates: Record<string, boolean> = {};
    for (const u of courseUnits) {
      updates[u.id] = u.schoolOrder <= schoolOrder;
    }
    setUnitAccess((prev) => ({ ...prev, ...updates }));
    await familyRepository.setUnitAccess(selectedStudent.id, updates);
    showToast(
      `Unidades de ${getCourse(managingCourseId).label} activadas hasta el bloque ${schoolOrder}.`,
    );
  };

  const handleSetWholeCourse = async (enabled: boolean) => {
    if (!selectedStudent) return;
    const updates: Record<string, boolean> = {};
    for (const u of courseUnits) {
      updates[u.id] = enabled;
    }
    setUnitAccess((prev) => ({ ...prev, ...updates }));
    await familyRepository.setUnitAccess(selectedStudent.id, updates);
    showToast(
      enabled
        ? `Todo ${getCourse(managingCourseId).label} activado para repaso.`
        : `Todo ${getCourse(managingCourseId).label} bloqueado.`,
    );
  };

  const handleAddStudent = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNickname.trim()) return;
    const created = await familyRepository.createStudent({
      nickname: newNickname,
      avatarId: newAvatar,
      courseId: newCourse,
    });
    const units = getOrderedUnitsForCourse(newCourse);
    const defaults: Record<string, boolean> = {};
    units.forEach((u, i) => {
      defaults[u.id] = i < 2;
    });
    await familyRepository.setUnitAccess(created.id, defaults);
    setNewNickname('');
    await refreshAll();
    setSelectedStudentId(created.id);
    showToast(`Perfil de ${created.nickname} creado.`);
  };

  const handleResetProgress = async (studentId: string, nickname: string) => {
    const pin = window.prompt(`Introduce tu PIN parental para reiniciar TODO el progreso de ${nickname}:`);
    if (!pin) return;
    try {
      await familyRepository.resetStudentProgress(studentId, pin);
      setAttempts([]);
      setExams([]);
      showToast(`Progreso de ${nickname} reiniciado.`);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'PIN incorrecto.');
    }
  };

  const handleDeleteStudent = async (studentId: string, nickname: string) => {
    if (students.length <= 1) {
      window.alert('Debe existir al menos un perfil de alumno.');
      return;
    }
    const pin = window.prompt(`Introduce tu PIN parental para ELIMINAR el perfil de ${nickname}:`);
    if (!pin) return;
    try {
      await familyRepository.deleteStudent(studentId, pin);
      await refreshAll();
      showToast(`Perfil de ${nickname} eliminado.`);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'PIN incorrecto.');
    }
  };

  const toggleExamUnit = (unitId: string) => {
    setSelectedExamUnits((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId],
    );
  };

  const handleGenerateExam = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || selectedExamUnits.length === 0) return;

    const generated = generateExamExercises({
      courseId: managingCourseId,
      unitIds: selectedExamUnits,
      skillFocus,
      questionCount,
      pool: allExercises,
    });

    if (generated.exerciseIds.length === 0) {
      showToast('No hay ejercicios para esa combinación de unidades y enfoque. Prueba con "Mixto".');
      return;
    }

    const defaultTitle =
      examTitle.trim() ||
      `Examen ${getCourse(managingCourseId).label} (${selectedExamUnits.length} ${
        selectedExamUnits.length === 1 ? 'unidad' : 'unidades'
      })`;

    const created = await familyRepository.createExam({
      studentId: selectedStudent.id,
      title: defaultTitle,
      courseId: managingCourseId,
      unitIds: selectedExamUnits,
      skillFocus,
      exerciseIds: generated.exerciseIds,
    });

    setExams((prev) => [created, ...prev]);
    setExamTitle('');
    setSelectedExamUnits([]);
    showToast(
      generated.adjusted
        ? `Examen asignado con el máximo disponible (${generated.availableCount} preguntas).`
        : `Examen "${created.title}" asignado a ${selectedStudent.nickname} (${created.exerciseIds.length} preguntas).`,
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              <Lock className="h-3 w-3" /> Zona Padres
            </span>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Panel de Control Familiar</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigate('/', { replace: true });
              }}
              className="touch-target rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Salir a Perfiles
            </button>
            {!localMode && (
              <button
                type="button"
                onClick={async () => {
                  await signOutFamily();
                  navigate('/');
                }}
                className="touch-target inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-sm font-bold text-white hover:bg-slate-900"
              >
                <LogOut className="h-4 w-4" /> Cerrar cuenta
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6">
        {feedbackMsg && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            {feedbackMsg}
          </div>
        )}

        {/* Student Selector Bar */}
        {students.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3">
            <span className="px-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Alumno seleccionado:
            </span>
            {students.map((st) => {
              const av = getAvatar(st.avatarId);
              const active = selectedStudent?.id === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStudentId(st.id)}
                  className={`touch-target inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition ${
                    active
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{av.emoji}</span>
                  <span>{st.nickname}</span>
                  <span className="text-xs opacity-80">({getCourse(st.courseId).label})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Navigation Tabs */}
        <nav className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { id: 'units', label: 'Ritmo escolar (SA)', icon: BookCheck },
            { id: 'exams', label: 'Crear Exámenes', icon: ClipboardList },
            { id: 'history', label: 'Historial y Notas', icon: History },
            { id: 'students', label: 'Alumnos', icon: Users },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id as ParentTab)}
                className={`touch-target flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                  active
                    ? 'border-blue-600 bg-blue-700 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* TAB 1: UNIT ACCESS IN EXACT SCHOOL ORDER */}
        {tab === 'units' && selectedStudent && (
          <section className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Unidades activas para {selectedStudent.nickname}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Puedes activar unidades de su curso actual ({getCourse(selectedStudent.courseId).label}) o de otros
                    cursos para repaso.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetWholeCourse(true)}
                    className="touch-target rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    Activar todo {getCourse(managingCourseId).label}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetWholeCourse(false)}
                    className="touch-target rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Bloquear todo
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {COURSES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setManagingCourseId(c.id)}
                    className={`touch-target rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
                      managingCourseId === c.id
                        ? 'border-blue-600 bg-blue-700 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {c.label} {c.id === selectedStudent.courseId ? '★' : ''}
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-6">
                {getCourse(managingCourseId).terms.map((term) => (
                  <div key={term.id}>
                    <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wider text-blue-800">
                      {term.number}º Trimestre · {term.label}
                    </h3>
                    <div className="space-y-2">
                      {term.units.map((unit) => {
                        const enabled = Boolean(unitAccess[unit.id]);
                        return (
                          <div
                            key={unit.id}
                            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-bold text-slate-700 shadow-xs">
                                  #{unit.schoolOrder} · {unit.code}
                                </span>
                                <span className="font-bold text-slate-900">{unit.title}</span>
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                {unit.grammarSummary.join(' · ')}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEnableUpTo(unit.schoolOrder)}
                                className="touch-target whitespace-nowrap rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                              >
                                Activar hasta aquí
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleUnit(unit.id)}
                                className={`touch-target w-24 whitespace-nowrap rounded-xl px-3 py-1.5 text-center text-xs font-bold transition ${
                                  enabled
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-slate-300 text-slate-800 hover:bg-slate-400'
                                }`}
                              >
                                {enabled ? 'Activa' : 'Bloqueada'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: CUSTOM EXAM GENERATOR */}
        {tab === 'exams' && selectedStudent && (
          <section className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={handleGenerateExam} className="rounded-3xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-extrabold text-slate-900">
                Generar examen para {selectedStudent.nickname}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Elige las unidades a evaluar. El alumno no podrá ver soluciones ni bancos de consulta durante el examen.
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Curso del examen
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                    {COURSES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setManagingCourseId(c.id);
                          setSelectedExamUnits([]);
                        }}
                        className={`touch-target rounded-xl border px-2 py-1.5 text-xs font-extrabold transition ${
                          managingCourseId === c.id
                            ? 'border-blue-600 bg-blue-700 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="exam-title" className="mb-1 block text-sm font-semibold text-slate-700">
                    Título del examen (opcional)
                  </label>
                  <input
                    id="exam-title"
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="Ej. Repaso 1er Trimestre (SA 1 + SA 2)"
                    className="touch-target w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Unidades y bancos incluidos ({selectedExamUnits.length} seleccionados)
                  </span>
                  <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-2xl border border-slate-200 p-2.5">
                    {courseUnits.map((u) => (
                      <label
                        key={u.id}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedExamUnits.includes(u.id)}
                          onChange={() => toggleExamUnit(u.id)}
                          className="h-5 w-5 rounded border-slate-300 text-blue-700"
                        />
                        <span className="text-sm font-medium text-slate-800">
                          <strong>{u.code}:</strong> {u.title}{' '}
                          <span className="text-xs text-slate-500">({u.exercises.length} ej.)</span>
                        </span>
                      </label>
                    ))}
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={selectedExamUnits.includes('bank-irregular-verbs')}
                        onChange={() => toggleExamUnit('bank-irregular-verbs')}
                        className="h-5 w-5 rounded border-slate-300 text-blue-700"
                      />
                      <span className="text-sm font-medium text-slate-800">
                        <strong>BANCO:</strong> Verbos Irregulares (Past Simple)
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={selectedExamUnits.includes('bank-expressions')}
                        onChange={() => toggleExamUnit('bank-expressions')}
                        className="h-5 w-5 rounded border-slate-300 text-blue-700"
                      />
                      <span className="text-sm font-medium text-slate-800">
                        <strong>BANCO:</strong> Expresiones Útiles
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="exam-focus" className="mb-1 block text-sm font-semibold text-slate-700">
                      Enfoque
                    </label>
                    <select
                      id="exam-focus"
                      value={skillFocus}
                      onChange={(e) => setSkillFocus(e.target.value as SkillFocus)}
                      className="touch-target w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="mixed">Mixto (Todo)</option>
                      <option value="vocabulary">Solo Vocabulario</option>
                      <option value="grammar">Solo Gramática / Verbos</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="exam-count" className="mb-1 block text-sm font-semibold text-slate-700">
                      Nº preguntas
                    </label>
                    <input
                      id="exam-count"
                      type="number"
                      min={3}
                      max={30}
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="touch-target w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={selectedExamUnits.length === 0}
                  className="touch-target w-full rounded-2xl bg-blue-700 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-40"
                >
                  Generar y asignar examen
                </button>
              </div>
            </form>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-extrabold text-slate-900">Exámenes asignados</h3>
              {exams.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">Todavía no has creado exámenes para este alumno.</p>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {exams.map((ex) => (
                    <div key={ex.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">{ex.title}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            ex.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ex.status === 'abandoned'
                                ? 'bg-rose-100 text-rose-800'
                                : ex.status === 'in_progress'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {ex.status === 'pending'
                            ? 'Pendiente'
                            : ex.status === 'in_progress'
                              ? 'En curso'
                              : ex.status === 'completed'
                                ? 'Entregado'
                                : 'Abandonado'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        {ex.exerciseIds.length} preguntas · Creado el {new Date(ex.createdAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 3: IMMUTABLE ATTEMPT HISTORY */}
        {tab === 'history' && selectedStudent && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-extrabold text-slate-900">
              Historial inmutable de {selectedStudent.nickname}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Todos los intentos de práctica, exámenes entregados y abandonos quedan registrados con fecha y hora.
            </p>

            {attempts.length === 0 ? (
              <p className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                Aún no hay sesiones ni exámenes registrados para este alumno.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {attempts.map((att) => {
                  const isExpanded = expandedAttemptId === att.id;
                  return (
                    <div key={att.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <button
                        type="button"
                        onClick={() => setExpandedAttemptId(isExpanded ? null : att.id)}
                        className="flex w-full flex-wrap items-center justify-between gap-2 text-left"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-blue-100 px-2 py-0.5 text-xs font-bold uppercase text-blue-800">
                              {att.mode === 'exam'
                                ? 'Examen'
                                : att.mode === 'mistake_review'
                                  ? 'Repaso errores'
                                  : att.mode === 'bank_practice'
                                    ? 'Banco'
                                    : 'Práctica SA'}
                            </span>
                            {att.status === 'abandoned' && (
                              <span className="rounded-lg bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">
                                ABANDONADO
                              </span>
                            )}
                            {att.mode === 'exam' && (att.focusLossCount ?? 0) > 0 && (
                              <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                                ⚠️ Salió de la app {att.focusLossCount}{' '}
                                {att.focusLossCount === 1 ? 'vez' : 'veces'} ({att.focusLossSeconds ?? 0}s)
                              </span>
                            )}
                            {att.mode === 'exam' && (att.focusLossCount ?? 0) === 0 && att.status === 'completed' && (
                              <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                                ✓ Sin salidas de la app
                              </span>
                            )}
                            <span className="text-sm font-bold text-slate-900">
                              {att.correctCount}/{att.totalQuestions} aciertos ({att.scorePercent}%)
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-600">
                            {new Date(att.finishedAt).toLocaleString('es-ES')} · Duración: {att.durationSeconds}s
                          </p>
                        </div>
                        <span className="text-xs font-bold text-blue-700">
                          {isExpanded ? 'Ocultar detalle ▲' : 'Ver respuestas ▼'}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                          {att.answersDetail.map((ans, idx) => (
                            <div
                              key={`${att.id}-${idx}`}
                              className="flex items-start gap-2 rounded-xl bg-white p-2.5 text-xs"
                            >
                              {ans.isCorrect ? (
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                              ) : (
                                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                              )}
                              <div>
                                <p className="font-semibold text-slate-800">
                                  Respuesta alumno: <span className="font-mono">{ans.submittedAnswer || '(vacía)'}</span>
                                </p>
                                {!ans.isCorrect && (
                                  <p className="text-emerald-700">
                                    Esperada: <span className="font-mono">{ans.expectedAnswers.join(' / ')}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 4: STUDENT PROFILES MANAGER */}
        {tab === 'students' && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-extrabold text-slate-900">Perfiles de Alumno</h2>
              <div className="mt-4 space-y-3">
                {students.map((st) => {
                  const av = getAvatar(st.avatarId);
                  return (
                    <div
                      key={st.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{av.emoji}</span>
                        <div>
                          <p className="font-bold text-slate-900">{st.nickname}</p>
                          <p className="text-xs text-slate-600">{getCourse(st.courseId).label}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleResetProgress(st.id, st.nickname)}
                          title="Reiniciar progreso (requiere PIN)"
                          className="touch-target inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(st.id, st.nickname)}
                          title="Eliminar perfil (requiere PIN)"
                          className="touch-target inline-flex items-center gap-1 rounded-xl border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleAddStudent} className="rounded-3xl border border-slate-200 bg-white p-5">
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                <Plus className="h-5 w-5 text-blue-700" /> Añadir otro alumno
              </h2>
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  required
                  maxLength={30}
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder="Apodo del alumno"
                  className="touch-target w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-6 gap-1.5">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setNewAvatar(av.id)}
                      className={`touch-target rounded-xl border-2 text-xl ${
                        newAvatar === av.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
                      }`}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
                <select
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value as CourseId)}
                  className="touch-target w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  {COURSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="touch-target w-full rounded-2xl bg-blue-700 py-2.5 text-sm font-bold text-white hover:bg-blue-800"
                >
                  Crear perfil
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
