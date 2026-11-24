import { describe, expect, it } from 'vitest';
import { prepareTextForSpeech, selectEnglishVoice } from '../../src/services/speechService';

describe('SpeechService voice selection & sanitization', () => {
  const makeVoice = (lang: string, name: string) => ({ lang, name }) as SpeechSynthesisVoice;

  it('prefers en-GB over en-US and other languages', () => {
    const voices = [
      makeVoice('es-ES', 'Spanish'),
      makeVoice('en-US', 'US English'),
      makeVoice('en-GB', 'UK English'),
    ];
    expect(selectEnglishVoice(voices)?.lang).toBe('en-GB');
  });

  it('prefers natural/neural/Google en-GB voices over generic ones and supports underscore locales', () => {
    const voices = [
      makeVoice('en_GB', 'Generic Voice'),
      makeVoice('en-GB', 'Google UK English Female'),
      makeVoice('en-US', 'Microsoft Jenny Online (Natural)'),
    ];
    expect(selectEnglishVoice(voices)?.name).toBe('Google UK English Female');
  });

  it('falls back to en-US when en-GB is unavailable', () => {
    const voices = [makeVoice('es-ES', 'Spanish'), makeVoice('en-US', 'US English')];
    expect(selectEnglishVoice(voices)?.lang).toBe('en-US');
  });

  it('returns null gracefully when no English voices exist', () => {
    expect(selectEnglishVoice([makeVoice('es-ES', 'Spanish')])).toBeNull();
    expect(selectEnglishVoice([])).toBeNull();
  });

  it('sanitizes slashes, parentheses, placeholders, and compound numbers for natural TTS', () => {
    expect(prepareTextForSpeech('Hi. / Hello.')).toBe('Hi. Hello.');
    expect(prepareTextForSpeech('Hi / Hello')).toBe('Hi, Hello');
    expect(prepareTextForSpeech('eraser / rubber')).toBe('eraser, rubber');
    expect(prepareTextForSpeech('can, could, -')).toBe('can, could');
    expect(prepareTextForSpeech("My name's ...")).toBe("My name's");
    expect(prepareTextForSpeech("It's Mark. (on the phone)")).toBe("It's Mark.");
    expect(prepareTextForSpeech('Forty-five. Today it is sunny and warm.')).toBe(
      'Forty five. Today it is sunny and warm.',
    );
    expect(prepareTextForSpeech('How much is this watch? It is twenty-five euros.')).toBe(
      'How much is this watch? It is twenty five euros.',
    );
  });
});
