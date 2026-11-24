import { useEffect, useId, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'amber' | 'danger' | 'primary';
  icon?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'amber',
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const iconBgClass =
    tone === 'danger'
      ? 'bg-rose-100 text-rose-600'
      : tone === 'primary'
        ? 'bg-emerald-100 text-emerald-600'
        : 'bg-amber-100 text-amber-600';

  const defaultIcon =
    tone === 'primary' ? (
      <CheckCircle2 className="h-7 w-7" />
    ) : (
      <AlertTriangle className="h-7 w-7" />
    );

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl border-2 border-slate-200 bg-white p-6 text-center shadow-2xl"
      >
        <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${iconBgClass}`}>
          {icon ?? defaultIcon}
        </div>

        <h2 id={titleId} className="text-xl font-black text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">{description}</p>

        <div className="mt-6 flex flex-col gap-2.5">
          {tone === 'primary' && (
            <>
              <button
                type="button"
                onClick={onConfirm}
                className="btn-duo btn-duo-green w-full py-3 text-base"
              >
                {confirmLabel}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="btn-duo btn-duo-white w-full py-2.5 text-sm"
              >
                {cancelLabel}
              </button>
            </>
          )}

          {tone === 'amber' && (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="btn-duo btn-duo-green w-full py-3 text-base"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="btn-duo btn-duo-white w-full py-2.5 text-sm text-rose-700 hover:border-rose-300"
              >
                {confirmLabel}
              </button>
            </>
          )}

          {tone === 'danger' && (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="btn-duo btn-duo-blue w-full py-3 text-base"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="btn-duo w-full border-rose-700 bg-rose-500 py-2.5 text-sm text-white hover:bg-rose-600"
              >
                {confirmLabel}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
