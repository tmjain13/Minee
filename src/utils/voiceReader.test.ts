import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readTextAloud, stopReading, voiceReader } from './voiceReader';

// jsdom has no speechSynthesis; install a minimal fake so we can observe calls.
class FakeUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  constructor(text: string) {
    this.text = text;
  }
}

describe('voiceReader / readTextAloud', () => {
  const speak = vi.fn();
  const cancel = vi.fn();

  beforeEach(() => {
    speak.mockClear();
    cancel.mockClear();
    vi.stubGlobal('speechSynthesis', { speak, cancel });
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('strips markdown formatting characters before speaking', () => {
    readTextAloud('## *धर्म* `सूत्र` _पाठ_~');
    const utterance = speak.mock.calls[0][0] as FakeUtterance;
    expect(utterance.text).toBe('धर्म सूत्र पाठ');
  });

  it('configures Hindi pronunciation and a slower elder-friendly rate', () => {
    readTextAloud('जय जिनेन्द्र');
    const utterance = speak.mock.calls[0][0] as FakeUtterance;
    expect(utterance.lang).toBe('hi-IN');
    expect(utterance.rate).toBeLessThan(1);
  });

  it('cancels any in-progress speech before starting new speech', () => {
    readTextAloud('पहला');
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(cancel.mock.invocationCallOrder[0]).toBeLessThan(speak.mock.invocationCallOrder[0]);
  });

  it('voiceReader.speak honors a custom language and defaults to hi-IN', () => {
    voiceReader.speak('hello', 'en-US');
    voiceReader.speak('नमस्ते');
    expect((speak.mock.calls[0][0] as FakeUtterance).lang).toBe('en-US');
    expect((speak.mock.calls[1][0] as FakeUtterance).lang).toBe('hi-IN');
  });

  it('stopReading and voiceReader.stop cancel current speech', () => {
    stopReading();
    voiceReader.stop();
    expect(cancel).toHaveBeenCalledTimes(2);
  });

  it('degrades gracefully when speechSynthesis is unsupported', () => {
    vi.unstubAllGlobals();
    expect('speechSynthesis' in window).toBe(false);
    expect(() => readTextAloud('कुछ')).not.toThrow();
    expect(() => stopReading()).not.toThrow();
    expect(() => voiceReader.speak('x')).not.toThrow();
    expect(() => voiceReader.stop()).not.toThrow();
  });
});
