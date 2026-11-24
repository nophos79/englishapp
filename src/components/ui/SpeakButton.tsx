import { Volume2 } from 'lucide-react';
import { speechService } from '../../services/speechService';

interface SpeakButtonProps {
  text: string;
  label?: string;
  compact?: boolean;
}

export function SpeakButton({ text, label = 'Escuchar pronunciación', compact = false }: SpeakButtonProps) {
  const supported = speechService.isSupported();
  if (!supported) {
    return compact ? null : (
      <span className="text-xs text-slate-500">Voz no disponible en este navegador</span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => speechService.speakEnglish(text)}
      aria-label={`${label}: ${text}`}
      title={label}
      className="touch-target inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 active:scale-95"
    >
      <Volume2 className="h-4 w-4 shrink-0" />
      {!compact && <span>Escuchar</span>}
    </button>
  );
}
