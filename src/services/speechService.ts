export interface SpeechService {
  isSupported(): boolean;
  speakEnglish(text: string, rate?: number): boolean;
  speakEnglishSlow(text: string): boolean;
  stop(): void;
}

export function selectEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;
  const gb = voices.find((v) => v.lang.toLowerCase().startsWith('en-gb'));
  if (gb) return gb;
  const us = voices.find((v) => v.lang.toLowerCase().startsWith('en-us'));
  if (us) return us;
  return voices.find((v) => v.lang.toLowerCase().startsWith('en')) ?? null;
}

export const speechService: SpeechService = {
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined'
    );
  },

  speakEnglish(text: string, rate = 0.92): boolean {
    if (!this.isSupported() || !text.trim()) return false;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.trim());
      const voices = window.speechSynthesis.getVoices();
      const voice = selectEnglishVoice(voices);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = 'en-GB';
      }
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  },

  speakEnglishSlow(text: string): boolean {
    return this.speakEnglish(text, 0.62);
  },

  stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  },
};
