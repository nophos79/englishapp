export interface EnglishVoiceInfo {
  supported: boolean;
  voicesLoaded: boolean;
  available: boolean;
  name: string | null;
  lang: string | null;
}

export interface SpeechService {
  isSupported(): boolean;
  speakEnglish(text: string, rate?: number): boolean;
  speakEnglishSlow(text: string): boolean;
  stop(): void;
  getEnglishVoiceInfo(): EnglishVoiceInfo;
  subscribeVoices(listener: () => void): () => void;
}

const NATURAL_VOICE_RE =
  /natural|neural|google|libby|sonia|ryan|jenny|aria|samantha|daniel|serena|karen|martha|arthur/i;
const ROBOTIC_VOICE_RE =
  /espeak|compact|albert|bad news|bahh|bells|boing|bubbles|cellos|wobble|zarvox|whisper|trinoids|hysterical|deranged|good news|jester|organ|superstar/i;

/**
 * Sanitizes curriculum strings before sending them to Web Speech API TTS so
 * slashes ("Hi. / Hello."), blanks ("___"), arrows ("→"), notes ("(on the phone)"),
 * and compound number hyphens ("Forty-five") are spoken naturally in English.
 */
export function prepareTextForSpeech(raw: string): string {
  return raw
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*(?:→|->)\s*/g, ', ')
    .replace(/_+/g, '')
    .replace(/\.{3,}|…/g, '')
    .replace(/,\s*-\s*(?=,|$)/g, '')
    .replace(/^\s*-\s*$/g, '')
    .replace(/([.!?])\s*\/\s*/g, '$1 ')
    .replace(/\s*\/\s*/g, ', ')
    .replace(
      /\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)-(one|two|three|four|five|six|seven|eight|nine)\b/gi,
      '$1 $2',
    )
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/,\s*,+/g, ',')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[,\s]+|[,\s]+$/g, '');
}

export function selectEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  let bestVoice: SpeechSynthesisVoice | null = null;
  let bestScore = -Infinity;

  for (const voice of voices) {
    const normalizedLang = (voice.lang || '').replace(/_/g, '-').toLowerCase();
    if (normalizedLang !== 'en' && !normalizedLang.startsWith('en-')) {
      continue;
    }

    let score = normalizedLang.startsWith('en-gb')
      ? 40
      : normalizedLang.startsWith('en-us')
        ? 30
        : 20;

    const name = voice.name || '';
    if (NATURAL_VOICE_RE.test(name)) score += 25;
    if (ROBOTIC_VOICE_RE.test(name)) score -= 60;

    if (score > bestScore) {
      bestScore = score;
      bestVoice = voice;
    }
  }

  return bestVoice;
}

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesInitialized = false;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let pendingSpeakTimer: ReturnType<typeof setTimeout> | null = null;
let pendingVoiceWaitCleanup: (() => void) | null = null;
const voiceListeners = new Set<() => void>();

function hasSpeechSynthesis(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

function refreshVoices(): SpeechSynthesisVoice[] {
  if (!hasSpeechSynthesis()) return [];
  try {
    const list = window.speechSynthesis.getVoices();
    if (list && list.length > 0) {
      cachedVoices = list;
      voicesInitialized = true;
    }
    return cachedVoices;
  } catch {
    return cachedVoices;
  }
}

function notifyVoiceListeners(): void {
  for (const listener of voiceListeners) {
    listener();
  }
}

function clearPendingSpeak(): void {
  if (pendingSpeakTimer !== null) {
    clearTimeout(pendingSpeakTimer);
    pendingSpeakTimer = null;
  }
  if (pendingVoiceWaitCleanup) {
    pendingVoiceWaitCleanup();
    pendingVoiceWaitCleanup = null;
  }
}

if (hasSpeechSynthesis()) {
  try {
    refreshVoices();
    const synth = window.speechSynthesis;
    const handleVoicesChanged = () => {
      const list = synth.getVoices();
      if (list) {
        cachedVoices = list;
      }
      voicesInitialized = true;
      notifyVoiceListeners();
    };
    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', handleVoicesChanged);
    } else if ('onvoiceschanged' in synth) {
      synth.onvoiceschanged = handleVoicesChanged;
    }
    if (!voicesInitialized) {
      setTimeout(() => {
        if (!voicesInitialized) {
          refreshVoices();
          voicesInitialized = true;
          notifyVoiceListeners();
        }
      }, 600);
    }
  } catch {
    // Ignore non-browser speechSynthesis mocks
  }
}

function emitUtterance(cleanedText: string, rate: number, voices: SpeechSynthesisVoice[]): void {
  const utterance = new SpeechSynthesisUtterance(cleanedText);
  const voice = selectEnglishVoice(voices);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang.replace(/_/g, '-');
  } else {
    utterance.lang = 'en-GB';
  }
  utterance.rate = rate;

  // Keep reference alive until playback ends so Chrome does not GC active utterance
  currentUtterance = utterance;
  utterance.onend = () => {
    if (currentUtterance === utterance) currentUtterance = null;
  };
  utterance.onerror = () => {
    if (currentUtterance === utterance) currentUtterance = null;
  };

  window.speechSynthesis.speak(utterance);
}

export const speechService: SpeechService = {
  isSupported(): boolean {
    return hasSpeechSynthesis();
  },

  getEnglishVoiceInfo(): EnglishVoiceInfo {
    const supported = hasSpeechSynthesis();
    if (!supported) {
      return { supported: false, voicesLoaded: true, available: false, name: null, lang: null };
    }
    const voices = refreshVoices();
    const selected = selectEnglishVoice(voices);
    return {
      supported: true,
      voicesLoaded: voicesInitialized,
      available: Boolean(selected),
      name: selected?.name ?? null,
      lang: selected ? selected.lang.replace(/_/g, '-') : null,
    };
  },

  subscribeVoices(listener: () => void): () => void {
    voiceListeners.add(listener);
    return () => {
      voiceListeners.delete(listener);
    };
  },

  speakEnglish(text: string, rate = 0.92): boolean {
    if (!hasSpeechSynthesis()) return false;
    const cleaned = prepareTextForSpeech(text);
    if (!cleaned) return false;

    try {
      clearPendingSpeak();
      window.speechSynthesis.cancel();

      const voices = refreshVoices();
      const selected = selectEnglishVoice(voices);

      if (selected || voicesInitialized) {
        emitUtterance(cleaned, rate, voices);
        return true;
      }

      // Chrome/Edge populate getVoices() asynchronously on first load; wait briefly
      const synth = window.speechSynthesis;
      let dispatched = false;

      const dispatchOnce = () => {
        if (dispatched) return;
        dispatched = true;
        clearPendingSpeak();
        emitUtterance(cleaned, rate, refreshVoices());
      };

      const onVoicesReady = () => dispatchOnce();
      if (typeof synth.addEventListener === 'function') {
        synth.addEventListener('voiceschanged', onVoicesReady);
        pendingVoiceWaitCleanup = () => synth.removeEventListener('voiceschanged', onVoicesReady);
      }

      pendingSpeakTimer = setTimeout(dispatchOnce, 350);
      return true;
    } catch {
      return false;
    }
  },

  speakEnglishSlow(text: string): boolean {
    return this.speakEnglish(text, 0.62);
  },

  stop(): void {
    clearPendingSpeak();
    currentUtterance = null;
    if (hasSpeechSynthesis()) {
      window.speechSynthesis.cancel();
    }
  },
};
