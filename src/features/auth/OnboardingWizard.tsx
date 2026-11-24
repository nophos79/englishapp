import { useState, type FormEvent } from 'react';
import { AVATARS } from '../../components/ui/Avatars';
import { PinKeypad } from '../../components/ui/PinKeypad';
import { useApp } from '../../context/AppContext';
import { COURSES, getOrderedUnitsForCourse } from '../../data/curriculum';
import type { CourseId } from '../../domain/types';
import { familyRepository } from '../../services/familyRepository';

export function OnboardingWizard() {
  const { refreshAll } = useApp();
  const [step, setStep] = useState<'pin' | 'student'>('pin');
  const [nickname, setNickname] = useState('');
  const [avatarId, setAvatarId] = useState<string>(AVATARS[0].id);
  const [courseId, setCourseId] = useState<CourseId>('5p');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePinCreate = async (pin: string) => {
    await familyRepository.setParentPin(pin);
    setStep('student');
  };

  const handleCreateStudent = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const student = await familyRepository.createStudent({
        nickname,
        avatarId,
        courseId,
      });
      // Enable First Term units (Starter + SA 1) by default so the child can start immediately
      const units = getOrderedUnitsForCourse(courseId);
      const initialAccess: Record<string, boolean> = {};
      units.forEach((u, idx) => {
        initialAccess[u.id] = idx < 2;
      });
      await familyRepository.setUnitAccess(student.id, initialAccess);
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-slate-100 p-4">
      <div className="mb-6 text-center">
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-800">
          Configuración inicial · Paso {step === 'pin' ? '1 de 2' : '2 de 2'}
        </span>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Bienvenido a EnglishApp</h1>
      </div>

      {step === 'pin' ? (
        <PinKeypad
          title="Crea tu PIN Parental"
          subtitle="Protege la Zona Padres, el generador de exámenes y el historial de notas (4 a 6 dígitos)."
          submitLabel="Guardar PIN y continuar"
          enableCooldown={false}
          onSubmit={handlePinCreate}
        />
      ) : (
        <form
          onSubmit={handleCreateStudent}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-slate-900">Crea el primer perfil de Alumno</h2>
          <p className="mt-1 text-sm text-slate-600">
            Solo usamos un apodo, un avatar y su curso escolar (podrás añadir más hijos desde la Zona Padres).
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="student-nickname" className="mb-1 block text-sm font-semibold text-slate-700">
                Nombre o apodo del alumno
              </label>
              <input
                id="student-nickname"
                type="text"
                required
                maxLength={30}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ej. Lucía, Mateo..."
                className="touch-target w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Elige un avatar</span>
              <div className="grid grid-cols-3 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatarId(av.id)}
                    className={`touch-target flex flex-col items-center justify-center rounded-2xl border-2 p-2.5 transition ${
                      avatarId === av.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">{av.emoji}</span>
                    <span className="mt-1 text-xs font-semibold text-slate-700">{av.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="student-course" className="mb-1 block text-sm font-semibold text-slate-700">
                Curso escolar
              </label>
              <select
                id="student-course"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value as CourseId)}
                className="touch-target w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base focus:border-blue-600 focus:outline-none"
              >
                {COURSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} ({c.cycle}º Ciclo)
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving || !nickname.trim()}
              className="touch-target w-full rounded-2xl bg-blue-700 px-4 py-3 text-base font-bold text-white hover:bg-blue-800 disabled:opacity-40"
            >
              {saving ? 'Guardando...' : 'Empezar a practicar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
