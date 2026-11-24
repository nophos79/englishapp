import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PinKeypad } from '../../components/ui/PinKeypad';
import { useApp } from '../../context/AppContext';
import { familyRepository } from '../../services/familyRepository';
import { isSupabaseConfigured, supabase } from '../../services/supabaseClient';

export function ParentPinGate() {
  const { unlockParent, user } = useApp();
  const navigate = useNavigate();
  const [recoverMode, setRecoverMode] = useState(false);
  const [password, setPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [recoverError, setRecoverError] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);

  const handleVerify = async (pin: string) => {
    const ok = await familyRepository.verifyParentPin(pin);
    if (ok) {
      unlockParent();
      navigate('/parent');
      return true;
    }
    return false;
  };

  const handleRecoverPin = async (e: FormEvent) => {
    e.preventDefault();
    setRecoverError(null);
    if (!/^[0-9]{4,6}$/.test(newPin)) {
      setRecoverError('El nuevo PIN debe tener entre 4 y 6 dígitos.');
      return;
    }
    setRecovering(true);
    try {
      if (isSupabaseConfigured && supabase && user?.email) {
        const { error } = await supabase.auth.signInWithPassword({
          email: user.email,
          password,
        });
        if (error) throw new Error('Contraseña de la cuenta familiar incorrecta.');
      }
      await familyRepository.setParentPin(newPin);
      unlockParent();
      navigate('/parent');
    } catch (err) {
      setRecoverError(err instanceof Error ? err.message : 'No se pudo restablecer el PIN.');
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4">
      {!recoverMode ? (
        <div className="w-full max-w-sm">
          <PinKeypad
            title="Zona Padres"
            subtitle="Introduce tu PIN parental para gestionar alumnos, unidades, exámenes e historial."
            onSubmit={handleVerify}
            onCancel={() => navigate('/')}
          />
          {isSupabaseConfigured && user?.email && (
            <button
              type="button"
              onClick={() => setRecoverMode(true)}
              className="mt-4 w-full text-center text-sm font-semibold text-blue-700 underline"
            >
              ¿Olvidaste tu PIN? Restablecer con tu contraseña
            </button>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleRecoverPin}
          className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-slate-900">Restablecer PIN Parental</h2>
          <p className="mt-1 text-sm text-slate-600">
            Confirma la contraseña de tu cuenta familiar ({user?.email}) para establecer un nuevo PIN.
          </p>
          <div className="mt-4 space-y-3">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña de cuenta familiar"
              className="touch-target w-full rounded-xl border border-slate-300 px-3 py-2.5 text-base"
            />
            <input
              type="password"
              inputMode="numeric"
              required
              pattern="[0-9]{4,6}"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Nuevo PIN (4 a 6 dígitos)"
              className="touch-target w-full rounded-xl border border-slate-300 px-3 py-2.5 text-base"
            />
            {recoverError && (
              <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {recoverError}
              </p>
            )}
            <button
              type="submit"
              disabled={recovering}
              className="touch-target w-full rounded-2xl bg-blue-700 py-3 font-bold text-white hover:bg-blue-800"
            >
              {recovering ? 'Verificando...' : 'Guardar nuevo PIN'}
            </button>
            <button
              type="button"
              onClick={() => setRecoverMode(false)}
              className="touch-target w-full rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700"
            >
              Volver
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
