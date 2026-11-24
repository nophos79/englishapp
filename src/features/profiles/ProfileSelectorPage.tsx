import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudOff, Lock, RefreshCw, Shield, Sparkles } from 'lucide-react';
import { getAvatar } from '../../components/ui/Avatars';
import { useApp } from '../../context/AppContext';
import { getCourse } from '../../data/curriculum';

export function ProfileSelectorPage() {
  const { students, selectStudent, lockParent, localMode, isOnline, pendingSyncCount } = useApp();
  const navigate = useNavigate();

  // Always lock Parent Zone automatically upon returning to Profile Selector
  useEffect(() => {
    lockParent();
  }, [lockParent]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-emerald-50/40 to-amber-50/40 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src="./icon.svg"
              alt="Mascota EnglishApp"
              className="h-14 w-14 rounded-2xl shadow-md"
            />
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">EnglishApp</h1>
              <p className="text-sm font-bold text-emerald-700">
                ¡Aprende inglés jugando! · 3º a 6º de Primaria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOnline && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-extrabold text-amber-900">
                <CloudOff className="h-3.5 w-3.5" /> Sin conexión
              </span>
            )}
            {pendingSyncCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-100 px-3 py-1.5 text-xs font-extrabold text-sky-900">
                <RefreshCw className="h-3.5 w-3.5" /> {pendingSyncCount} por sincronizar
              </span>
            )}
            <button
              type="button"
              onClick={() => navigate('/parent-pin')}
              className="btn-duo btn-duo-white inline-flex items-center gap-2 px-4 py-2 text-sm font-extrabold text-slate-800"
            >
              <Lock className="h-4 w-4 text-sky-600" />
              Zona Padres
            </button>
          </div>
        </header>

        {localMode && (
          <div className="mb-6 flex items-start gap-3 rounded-3xl border-2 border-sky-200 bg-white/90 p-4 text-sm text-sky-950 shadow-xs">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
            <div>
              <strong>Modo local offline activo.</strong> Todo funciona en este dispositivo. Cuando configures{' '}
              <code className="rounded bg-sky-100 px-1.5 py-0.5 text-xs">.env.local</code> con tu proyecto de Supabase,
              la cuenta familiar sincronizará automáticamente entre dispositivos.
            </div>
          </div>
        )}

        <section>
          <h2 className="mb-5 flex items-center gap-2 text-2xl font-black text-slate-900">
            <Sparkles className="h-6 w-6 text-amber-500" />
            ¿Quién va a practicar hoy?
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="group flex flex-col items-center rounded-3xl border-2 border-b-4 border-sky-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-emerald-400 hover:shadow-md active:translate-y-0"
                >
                  <div
                    className={`mb-3 flex h-24 w-24 items-center justify-center rounded-3xl text-5xl shadow-inner transition group-hover:scale-105 ${avatar.bg}`}
                  >
                    {avatar.emoji}
                  </div>
                  <span className="text-2xl font-black text-slate-900 group-hover:text-emerald-700">
                    {student.nickname}
                  </span>
                  <span className="mt-2 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-extrabold text-emerald-800">
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
