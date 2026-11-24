import { useEffect, useState } from 'react';
import { Check, Puzzle, RotateCcw, Search, Snail, Volume2, X } from 'lucide-react';
import { SpeakButton } from '../../components/ui/SpeakButton';
import type { ExerciseItem } from '../../domain/types';
import { speechService } from '../../services/speechService';

interface ExerciseRendererProps {
  exercise: ExerciseItem;
  shuffledOptions?: string[];
  shuffledRightPairs?: string[];
  shuffledTokens?: string[];
  value: string | Record<string, string>;
  onChange: (value: string | Record<string, string>) => void;
  disabled: boolean;
  isExamMode?: boolean;
}

const TYPE_BADGES: Record<ExerciseItem['type'], string> = {
  multiple_choice: 'Elige la opción',
  fill_blank: 'Completa el hueco',
  matching: 'Empareja',
  sentence_order: 'Ordena la frase',
  word_builder: 'Forma palabras',
  odd_one_out: 'Encuentra el intruso',
  true_false: '¿Correcta o con fallo?',
  listening_choice: 'Listening · Escucha y elige',
  listening_dictation: 'Listening · Dictado',
};

export function ExerciseRenderer({
  exercise,
  shuffledOptions,
  shuffledRightPairs,
  shuffledTokens,
  value,
  onChange,
  disabled,
  isExamMode = false,
}: ExerciseRendererProps) {
  const showAudio = Boolean(exercise.promptEn) && (!isExamMode || exercise.allowAudioInExam);

  // Track chosen chip indices for sentence_order so duplicate words work cleanly
  const tokens = shuffledTokens ?? exercise.tokens ?? [];
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  useEffect(() => {
    setSelectedIndices([]);
  }, [exercise.id]);

  // Auto-play audio once when a Listening exercise opens
  const isListening =
    exercise.type === 'listening_choice' || exercise.type === 'listening_dictation';

  useEffect(() => {
    if (isListening && exercise.audioText && !disabled) {
      speechService.speakEnglish(exercise.audioText);
    }
    return () => {
      if (isListening) {
        speechService.stop();
      }
    };
  }, [exercise.id, exercise.audioText, isListening, disabled]);

  const handleSelectToken = (idx: number) => {
    if (disabled || selectedIndices.includes(idx)) return;
    const next = [...selectedIndices, idx];
    setSelectedIndices(next);
    onChange(next.map((i) => tokens[i]).join(' '));
  };

  const handleRemoveToken = (posInSelected: number) => {
    if (disabled) return;
    const next = selectedIndices.filter((_, i) => i !== posInSelected);
    setSelectedIndices(next);
    onChange(next.map((i) => tokens[i]).join(' '));
  };

  const handleClearTokens = () => {
    if (disabled) return;
    setSelectedIndices([]);
    onChange('');
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-black uppercase tracking-wide text-emerald-800">
            {exercise.skill === 'vocabulary'
              ? 'Vocabulario'
              : exercise.skill === 'grammar'
                ? 'Gramática'
                : exercise.skill === 'irregular_verbs'
                  ? 'Verbos Irregulares'
                  : 'Expresiones'}
          </span>
          <span className="inline-block rounded-full bg-sky-100 px-3 py-0.5 text-[11px] font-extrabold text-sky-800">
            {TYPE_BADGES[exercise.type]}
          </span>
        </div>

        <h2 className="mt-1.5 text-base font-black text-slate-900 sm:text-lg">{exercise.promptEs}</h2>

        {exercise.promptEn && (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-sky-200 bg-sky-50 px-3.5 py-2.5">
            <p className="text-base font-black text-sky-950 sm:text-lg">{exercise.promptEn}</p>
            {showAudio && <SpeakButton text={exercise.promptEn.replace(/___/g, '')} compact />}
          </div>
        )}

        {/* LISTENING AUDIO CONTROLS (Duolingo normal + slow turtle buttons) */}
        {isListening && exercise.audioText && (
          <div className="mt-2.5 rounded-2xl border-2 border-sky-200 bg-gradient-to-r from-sky-50 to-indigo-50 px-4 py-3 text-center sm:flex sm:items-center sm:justify-between sm:gap-3 sm:text-left">
            {speechService.isSupported() ? (
              <>
                <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-sky-800 sm:mb-0">
                  Pulsa para escuchar tantas veces como necesites
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:shrink-0">
                  <button
                    type="button"
                    onClick={() => speechService.speakEnglish(exercise.audioText!)}
                    className="btn-duo btn-duo-blue inline-flex items-center gap-2 px-5 py-2.5 text-sm sm:text-base"
                  >
                    <Volume2 className="h-5 w-5" />
                    Escuchar
                  </button>
                  <button
                    type="button"
                    onClick={() => speechService.speakEnglishSlow(exercise.audioText!)}
                    title="Escuchar despacio"
                    className="btn-duo btn-duo-white inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-black text-sky-800 hover:border-sky-400"
                  >
                    <Snail className="h-4 w-4 text-sky-600" />
                    Despacio
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-1 text-sm text-slate-700">
                <p className="font-bold text-amber-800">
                  Tu navegador no tiene síntesis de voz activa. Transcripción de respaldo:
                </p>
                <p className="text-lg font-black text-sky-950">"{exercise.audioText}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 1. MULTIPLE CHOICE & LISTENING CHOICE */}
      {(exercise.type === 'multiple_choice' || exercise.type === 'listening_choice') && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {(shuffledOptions ?? exercise.options ?? []).map((option, idx) => {
            const selected = value === option;
            const letter = String.fromCharCode(65 + idx);
            return (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => onChange(option)}
                className={`touch-target flex w-full items-center gap-3 rounded-2xl border-2 border-b-4 px-3.5 py-2.5 text-left text-sm font-extrabold transition active:translate-y-0.5 sm:text-base ${
                  selected
                    ? 'border-sky-500 bg-sky-50 text-sky-900'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-sky-300 hover:bg-sky-50/40'
                } disabled:cursor-not-allowed disabled:opacity-80`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                    selected ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {letter}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. FILL BLANK & LISTENING DICTATION */}
      {(exercise.type === 'fill_blank' || exercise.type === 'listening_dictation') && (
        <div>
          <label htmlFor={`answer-${exercise.id}`} className="mb-1 block text-xs font-bold text-slate-500">
            {exercise.type === 'listening_dictation'
              ? 'Escribe en inglés exactamente lo que escuchas:'
              : 'Escribe tu respuesta en inglés:'}
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
            className="touch-target w-full rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-base font-extrabold text-slate-900 focus:border-sky-500 focus:outline-none disabled:bg-slate-100 sm:text-lg"
          />
        </div>
      )}

      {/* 3. MATCHING */}
      {exercise.type === 'matching' && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500">
            Elige la pareja correcta para cada término de la izquierda:
          </p>
          {(exercise.pairs ?? []).map((pair) => {
            const mapVal = typeof value === 'object' && value !== null ? value : {};
            const currentRight = mapVal[pair.left] ?? '';
            return (
              <div
                key={pair.left}
                className="flex flex-col gap-2 rounded-2xl border-2 border-slate-200 bg-slate-50 p-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-black text-slate-900 sm:text-base">{pair.left}</span>
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
                  className="touch-target rounded-xl border-2 border-slate-300 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-800 sm:w-56"
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

      {/* 4. SENTENCE ORDER (Duolingo word-bank builder) */}
      {exercise.type === 'sentence_order' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Toca las fichas en el orden correcto para construir la frase:
            </span>
            {selectedIndices.length > 0 && !disabled && (
              <button
                type="button"
                onClick={handleClearTokens}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-600 hover:bg-slate-200"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Limpiar
              </button>
            )}
          </div>

          <div
            aria-label="Frase construida"
            className="flex min-h-14 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/50 p-2.5"
          >
            {selectedIndices.length === 0 ? (
              <span className="text-sm font-semibold text-slate-400">
                Toca las palabras de abajo para formar la frase...
              </span>
            ) : (
              selectedIndices.map((tokenIdx, pos) => (
                <button
                  key={`${tokenIdx}-${pos}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRemoveToken(pos)}
                  className="btn-duo btn-duo-blue px-3.5 py-1.5 text-sm font-black disabled:opacity-90"
                >
                  {tokens[tokenIdx]}
                </button>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {tokens.map((word, idx) => {
              const used = selectedIndices.includes(idx);
              return (
                <button
                  key={`${word}-${idx}`}
                  type="button"
                  disabled={disabled || used}
                  onClick={() => handleSelectToken(idx)}
                  className={`btn-duo px-3 py-1.5 text-sm font-black transition ${
                    used
                      ? 'border-slate-200 bg-slate-100 text-transparent shadow-none'
                      : 'btn-duo-white text-slate-800 hover:border-sky-400'
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. WORD BUILDER (Compound words & word formation puzzle) */}
      {exercise.type === 'word_builder' && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Puzzle className="h-4 w-4 text-violet-600" />
            Une cada primera parte con su terminación para formar palabras en inglés:
          </p>
          {(exercise.pairs ?? []).map((pair) => {
            const mapVal = typeof value === 'object' && value !== null ? value : {};
            const chosenRight = mapVal[pair.left] ?? '';
            return (
              <div
                key={pair.left}
                className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border-2 border-violet-200 bg-violet-50/50 p-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-violet-600 px-2.5 py-1 text-sm font-black text-white shadow-xs sm:text-base">
                    {pair.left}
                  </span>
                  <span className="text-lg font-black text-violet-500">+</span>
                  <select
                    disabled={disabled}
                    value={chosenRight}
                    aria-label={`Completar palabra ${pair.left}`}
                    onChange={(e) =>
                      onChange({
                        ...mapVal,
                        [pair.left]: e.target.value,
                      })
                    }
                    className="touch-target rounded-xl border-2 border-violet-300 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-800"
                  >
                    <option value="">-- elige --</option>
                    {(shuffledRightPairs ?? (exercise.pairs ?? []).map((p) => p.right)).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {chosenRight && (
                  <span className="rounded-xl bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800 sm:text-sm">
                    = {pair.left}
                    {chosenRight}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 6. ODD ONE OUT (2x2 playful cards) */}
      {exercise.type === 'odd_one_out' && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Search className="h-4 w-4 text-amber-600" />
            Toca la palabra intrusa que NO encaja con las otras tres:
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {(shuffledOptions ?? exercise.options ?? []).map((option) => {
              const selected = value === option;
              return (
                <button
                  key={option}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(option)}
                  className={`touch-target flex min-h-14 items-center justify-center rounded-2xl border-2 border-b-4 px-3.5 py-3 text-center text-base font-black transition active:translate-y-0.5 sm:text-lg ${
                    selected
                      ? 'border-amber-500 bg-amber-50 text-amber-950'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-amber-300 hover:bg-amber-50/40'
                  } disabled:cursor-not-allowed disabled:opacity-80`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. TRUE / FALSE (Grammar error detector) */}
      {exercise.type === 'true_false' && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange('Correcta')}
            className={`btn-duo flex items-center justify-center gap-2 py-3 text-base ${
              value === 'Correcta' ? 'btn-duo-green' : 'btn-duo-white text-emerald-700 hover:border-emerald-400'
            }`}
          >
            <Check className="h-5 w-5" /> Correcta
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange('Tiene un fallo')}
            className={`btn-duo flex items-center justify-center gap-2 py-3 text-base ${
              value === 'Tiene un fallo'
                ? 'border-rose-700 bg-rose-500 text-white'
                : 'btn-duo-white text-rose-700 hover:border-rose-400'
            }`}
          >
            <X className="h-5 w-5" /> Tiene un fallo
          </button>
        </div>
      )}
    </div>
  );
}
