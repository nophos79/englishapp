import { describe, expect, it } from 'vitest';
import { selectEnglishVoice } from '../../src/services/speechService';

describe('SpeechService voice selection', () => {
  const makeVoice = (lang: string, name: string) => ({ lang, name }) as SpeechSynthesisVoice;

  it('prefers en-GB over en-US and other languages', () => {
    const voices = [
      makeVoice('es-ES', 'Spanish'),
      makeVoice('en-US', 'US English'),
      makeVoice('en-GB', 'UK English'),
    ];
    expect(selectEnglishVoice(voices)?.lang).toBe('en-GB');
  });

  it('falls back to en-US when en-GB is unavailable', () => {
    const voices = [makeVoice('es-ES', 'Spanish'), makeVoice('en-US', 'US English')];
    expect(selectEnglishVoice(voices)?.lang).toBe('en-US');
  });

  it('returns null gracefully when no English voices exist', () => {
    expect(selectEnglishVoice([makeVoice('es-ES', 'Spanish')])).toBeNull();
    expect(selectEnglishVoice([])).toBeNull();
  });
});
