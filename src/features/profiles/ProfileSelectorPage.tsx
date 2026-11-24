import { useNavigate } from 'react-router-dom';
import { CloudOff, Lock, RefreshCw, Shield } from 'lucide-react';
import { getAvatar } from '../../components/ui/Avatars';
import { useApp } from '../../context/AppContext';
import { getCourse } from '../../data/curriculum';

export function ProfileSelectorPage() {
  const { students, selectStudent, localMode, isOnline, pendingSyncCount } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-100 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">EnglishApp</h1>
            <p className="text-sm font-medium text-slate-600">
              Práctica y evaluación de inglés · 3º a 6º de Primaria
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isOnline && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900">
                <CloudOff className="h-3.5 w-3.5" /> Sin conexión
              </span>
            )}
            {pendingSyncCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-900">
                <RefreshCw className="h-3.5 w-3.5" /> {pendingSyncCount} por sincronizar
              </span>
            )}
            <button
              type="button"
              onClick={() => navigate('/parent-pin')}
              className="touch-target inline-flex items-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-blue-600 hover:text-blue-700"
            >
              <Lock className="h-4 w-4" />
              Zona Padres
            </button>
          </div>
        </header>

        {localMode && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
            <div>
              <strong>Modo local offline activo.</strong> Todo funciona en este dispositivo. Cuando configures{' '}
              <code className="rounded bg-blue-100 px-1.5 py-0.5 text-xs">.env.local</code> con tu proyecto de Supabase,
              la cuenta familiar sincronizará automáticamente entre dispositivos.
            </div>
          </div>
        )}

        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-800">¿Quién va a practicar hoy?</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => {
              const avatar = getAvatar(student.avatarId);
              const course = getCourse(student.courseId);
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => {
                    selectStudent(student);
                    navigate('/student');
                  }}
                  className="group flex flex-col items-center rounded-3xl border-2 border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-md"
                >
                  <div
                    className={`mb-3 flex h-20 w-20 items-center justify-center rounded-3xl text-4xl shadow-inner ${avatar.bg}`}
                  >
                    {avatar.emoji}
                  </div>
                  <span className="text-xl font-extrabold text-slate-900 group-hover:text-blue-700">
                    {student.nickname}
                  </span>
                  <span className="mt-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {course.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
