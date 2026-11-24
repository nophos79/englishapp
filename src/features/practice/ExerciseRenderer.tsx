import { SpeakButton } from '../../components/ui/SpeakButton';
import type { ExerciseItem } from '../../domain/types';

interface ExerciseRendererProps {
  exercise: ExerciseItem;
  shuffledOptions?: string[];
  shuffledRightPairs?: string[];
  value: string | Record<string, string>;
  onChange: (value: string | Record<string, string>) => void;
  disabled: boolean;
  isExamMode?: boolean;
}

export function ExerciseRenderer({
  exercise,
  shuffledOptions,
  shuffledRightPairs,
  value,
  onChange,
  disabled,
  isExamMode = false,
}: ExerciseRendererProps) {
  const showAudio = Boolean(exercise.promptEn) && (!isExamMode || exercise.allowAudioInExam);

  return (
    <div className="space-y-4">
      <div>
        <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
          {exercise.skill === 'vocabulary'
            ? 'Vocabulario'
            : exercise.skill === 'grammar'
              ? 'Gramática'
              : exercise.skill === 'irregular_verbs'
                ? 'Verbos Irregulares'
                : 'Expresiones'}
        </span>
        <h2 className="mt-2 text-lg font-extrabold text-slate-900 sm:text-xl">{exercise.promptEs}</h2>

        {exercise.promptEn && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-lg font-bold text-blue-950">{exercise.promptEn}</p>
            {showAudio && <SpeakButton text={exercise.promptEn.replace(/___/g, '')} compact />}
          </div>
        )}
      </div>

      {exercise.type === 'multiple_choice' && (
        <div className="grid gap-2.5">
          {(shuffledOptions ?? exercise.options ?? []).map((option) => {
            const selected = value === option;
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => onChange(option)}
                className={`touch-target w-full rounded-2xl border-2 px-4 py-3.5 text-left text-base font-bold transition ${
                  selected
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-slate-50'
                } disabled:cursor-not-allowed disabled:opacity-80`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {exercise.type === 'fill_blank' && (
        <div>
          <label htmlFor={`answer-${exercise.id}`} className="mb-1 block text-xs font-semibold text-slate-500">
            Escribe tu respuesta en inglés:
          </label>
          <input
            id={`answer-${exercise.id}`}
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={disabled}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Escribe aquí..."
            className="touch-target w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-lg font-bold text-slate-900 focus:border-blue-600 focus:outline-none disabled:bg-slate-100"
          />
        </div>
      )}

      {exercise.type === 'matching' && (
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-slate-500">
            Elige la pareja correcta para cada término de la izquierda:
          </p>
          {(exercise.pairs ?? []).map((pair) => {
            const mapVal = typeof value === 'object' && value !== null ? value : {};
            const currentRight = mapVal[pair.left] ?? '';
            return (
              <div
                key={pair.left}
                className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-base font-extrabold text-slate-900">{pair.left}</span>
                <select
                  disabled={disabled}
                  value={currentRight}
                  aria-label={`Emparejar ${pair.left}`}
                  onChange={(e) =>
                    onChange({
                      ...mapVal,
                      [pair.left]: e.target.value,
                    })
                  }
                  className="touch-target rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 sm:w-56"
                >
                  <option value="">-- Selecciona --</option>
                  {(shuffledRightPairs ?? (exercise.pairs ?? []).map((p) => p.right)).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
