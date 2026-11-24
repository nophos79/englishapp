import { useCallback, useEffect, useState } from 'react';
import { Delete, Lock } from 'lucide-react';

interface PinKeypadProps {
  title: string;
  subtitle?: string;
  minLength?: number;
  maxLength?: number;
  onSubmit: (pin: string) => Promise<boolean | void>;
  onCancel?: () => void;
  submitLabel?: string;
  enableCooldown?: boolean;
}

export function PinKeypad({
  title,
  subtitle,
  minLength = 4,
  maxLength = 6,
  onSubmit,
  onCancel,
  submitLabel = 'Confirmar PIN',
  enableCooldown = true,
}: PinKeypadProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  const appendDigit = useCallback(
    (digit: string) => {
      if (cooldownSeconds > 0 || submitting) return;
      setPin((prev) => (prev.length < maxLength ? prev + digit : prev));
      setError(null);
    },
    [cooldownSeconds, submitting, maxLength],
  );

  const removeDigit = useCallback(() => {
    if (submitting) return;
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  }, [submitting]);

  const handleConfirm = useCallback(async () => {
    if (cooldownSeconds > 0 || pin.length < minLength || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await onSubmit(pin);
      if (result === false) {
        const nextFails = failedAttempts + 1;
        setFailedAttempts(nextFails);
        setPin('');
        if (enableCooldown && nextFails >= 5) {
          setCooldownSeconds(30);
          setError('Demasiados intentos fallidos. Espera 30 segundos.');
        } else {
          setError(`PIN incorrecto (${nextFails}/5).`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al comprobar el PIN.');
      setPin('');
    } finally {
      setSubmitting(false);
    }
  }, [cooldownSeconds, pin, minLength, submitting, onSubmit, failedAttempts, enableCooldown]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        appendDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        removeDigit();
      } else if (e.key === 'Delete') {
        e.preventDefault();
        if (!submitting) {
          setPin('');
          setError(null);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        void handleConfirm();
      } else if (e.key === 'Escape' && onCancel) {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [appendDigit, removeDigit, handleConfirm, onCancel, submitting]);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="mb-4 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>

      <div className="mb-4 flex justify-center gap-2.5" aria-label="PIN introducido">
        {Array.from({ length: maxLength }).map((_, idx) => (
          <div
            key={idx}
            className={`flex h-11 w-10 items-center justify-center rounded-xl border-2 text-lg font-bold ${
              idx < pin.length
                ? 'border-blue-600 bg-blue-50 text-blue-900'
                : 'border-slate-200 bg-slate-50 text-slate-300'
            }`}
          >
            {idx < pin.length ? '●' : ''}
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-center text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      {cooldownSeconds > 0 && (
        <p className="mb-3 text-center text-sm font-semibold text-amber-700">
          Bloqueado temporalmente: {cooldownSeconds}s
        </p>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        {digits.map((d) => (
          <button
            key={d}
            type="button"
            disabled={cooldownSeconds > 0 || submitting}
            onClick={() => appendDigit(d)}
            className="touch-target rounded-2xl border border-slate-200 bg-slate-50 py-3 text-xl font-bold text-slate-900 transition hover:bg-slate-100 active:scale-95 disabled:opacity-40"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPin('')}
          disabled={submitting}
          className="touch-target rounded-2xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
        >
          Borrar
        </button>
        <button
          type="button"
          disabled={cooldownSeconds > 0 || submitting}
          onClick={() => appendDigit('0')}
          className="touch-target rounded-2xl border border-slate-200 bg-slate-50 py-3 text-xl font-bold text-slate-900 transition hover:bg-slate-100 active:scale-95 disabled:opacity-40"
        >
          0
        </button>
        <button
          type="button"
          onClick={removeDigit}
          disabled={submitting}
          aria-label="Eliminar último dígito"
          className="touch-target flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 py-3 text-slate-700 hover:bg-slate-100"
        >
          <Delete className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={pin.length < minLength || cooldownSeconds > 0 || submitting}
          className="touch-target w-full rounded-2xl bg-blue-700 px-4 py-3 text-base font-bold text-white transition hover:bg-blue-800 disabled:opacity-40"
        >
          {submitting ? 'Comprobando...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="touch-target w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
