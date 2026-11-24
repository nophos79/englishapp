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
        e.stopPropagation();
        appendDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        removeDigit();
      } else if (e.key === 'Delete') {
        e.preventDefault();
        e.stopPropagation();
        if (!submitting) {
          setPin('');
          setError(null);
        }
      } else if (e.key === 'Enter' || e.key === 'NumpadEnter') {
        e.preventDefault();
        e.stopPropagation();
        void handleConfirm();
      } else if (e.key === 'Escape' && onCancel) {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };

    // Capture phase guarantees Enter submits the PIN even if a keypad button holds focus
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [appendDigit, removeDigit, handleConfirm, onCancel, submitting]);

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border-2 border-sky-200 bg-white p-6 shadow-xl">
      <div className="mb-4 flex flex-col items-center text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-500 text-white shadow-md">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm font-semibold text-slate-600">{subtitle}</p>}
      </div>

      <div className="mb-4 flex justify-center gap-2.5" aria-label="PIN introducido">
        {Array.from({ length: maxLength }).map((_, idx) => (
          <div
            key={idx}
            className={`flex h-12 w-10 items-center justify-center rounded-2xl border-2 text-lg font-black transition ${
              idx < pin.length
                ? 'scale-105 border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xs'
                : 'border-slate-200 bg-slate-50 text-slate-300'
            }`}
          >
            {idx < pin.length ? '●' : ''}
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-center text-sm font-bold text-rose-700">
          {error}
        </p>
      )}

      {cooldownSeconds > 0 && (
        <p className="mb-3 text-center text-sm font-bold text-amber-700">
          Bloqueado temporalmente: {cooldownSeconds}s
        </p>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        {digits.map((d) => (
          <button
            key={d}
            type="button"
            disabled={cooldownSeconds > 0 || submitting}
            onClick={(e) => {
              e.currentTarget.blur();
              appendDigit(d);
            }}
            className="btn-duo btn-duo-white py-2.5 text-xl font-black text-slate-800 disabled:opacity-40"
          >
            {d}
          </button>
        ))}
        <button
          type="button"
          onClick={(e) => {
            e.currentTarget.blur();
            setPin('');
          }}
          disabled={submitting}
          className="btn-duo btn-duo-white py-2.5 text-sm font-extrabold text-slate-600"
        >
          Borrar
        </button>
        <button
          type="button"
          disabled={cooldownSeconds > 0 || submitting}
          onClick={(e) => {
            e.currentTarget.blur();
            appendDigit('0');
          }}
          className="btn-duo btn-duo-white py-2.5 text-xl font-black text-slate-800 disabled:opacity-40"
        >
          0
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.currentTarget.blur();
            removeDigit();
          }}
          disabled={submitting}
          aria-label="Eliminar último dígito"
          className="btn-duo btn-duo-white flex items-center justify-center py-2.5 text-slate-700"
        >
          <Delete className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={pin.length < minLength || cooldownSeconds > 0 || submitting}
          className="btn-duo btn-duo-green w-full px-4 py-3 text-base disabled:opacity-40"
        >
          {submitting ? 'Comprobando...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-duo btn-duo-white w-full px-4 py-2.5 text-sm"
          >
            Cancelar
          </button>
        )}
      </div>

      <p className="mt-3 text-center text-xs font-semibold text-slate-400">
        En PC puedes teclear el PIN y pulsar <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">Intro</kbd>
      </p>
    </div>
  );
}
