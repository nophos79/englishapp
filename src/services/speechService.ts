export interface SpeechService {
  isSupported(): boolean;
  speakEnglish(text: string): boolean;
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

  speakEnglish(text: string): boolean {
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
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  },

  stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  },
};
