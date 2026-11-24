import { useState, type FormEvent } from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export function FamilyAuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setMessage('Cuenta familiar creada. Si tu proyecto exige confirmación por email, revisa tu bandeja.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-slate-100 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-md">
            <BookOpen className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">EnglishApp Primaria</h1>
          <p className="mt-1 text-sm text-slate-600">
            Acceso de cuenta familiar (solo para el Padre/Madre; los alumnos entran con perfil interno sin email).
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`touch-target rounded-xl text-sm font-bold transition ${
              mode === 'login' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`touch-target rounded-xl text-sm font-bold transition ${
              mode === 'register' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="family-email" className="mb-1 block text-sm font-semibold text-slate-700">
              Email del Padre / Madre
            </label>
            <input
              id="family-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="familia@ejemplo.com"
              className="touch-target w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="family-password" className="mb-1 block text-sm font-semibold text-slate-700">
              Contraseña
            </label>
            <input
              id="family-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="touch-target w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base focus:border-blue-600 focus:outline-none"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="touch-target w-full rounded-2xl bg-blue-700 px-4 py-3 text-base font-bold text-white transition hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Conectando...' : mode === 'login' ? 'Entrar a la cuenta familiar' : 'Registrar cuenta familiar'}
          </button>
        </form>

        <div className="mt-6 flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>Privacidad garantizada: cero anuncios, cero rastreo y perfiles infantiles sin datos personales.</span>
        </div>
      </div>
    </div>
  );
}
