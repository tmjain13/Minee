// src/utils/voiceReader.ts

export const readTextAloud = (text: string) => {
  if (!('speechSynthesis' in window)) {
    console.warn("क्षमा करें, आपका डिवाइस वॉइस सपोर्ट नहीं करता है।");
    return;
  }

  // अगर पहले से कुछ बोल रहा है, तो उसे रोक दें
  window.speechSynthesis.cancel();

  // Clean Markdown headers or emojis if possible to speak more cleanly, but speech synthesis naturally works on plain text
  const cleanedText = text
    .replace(/[#*`_~]/g, '') // strip common md formatting characters
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  
  // भाषा को हिंदी (भारत) पर सेट करें ताकि उच्चारण (Pronunciation) शुद्ध रहे
  utterance.lang = 'hi-IN';
  utterance.rate = 0.95; // बोलने की स्पीड थोड़ी धीमी रखें ताकि बुजुर्ग आसानी से समझ सकें
  utterance.pitch = 1.0; 

  window.speechSynthesis.speak(utterance);
};

export const stopReading = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Offline Text-to-Speech Engine for Terapanth AI
 * Uses native browser synthesis to read Sutras and Suvichar.
 */
export const voiceReader = {
  speak: (text: string, language: string = 'hi-IN') => {
    // Check if the browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      console.warn("Text-to-speech not supported in this browser.");
      return;
    }

    // Cancel any currently playing audio
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language; // Default to Hindi (hi-IN)
    utterance.rate = 0.85;     // Slightly slower for calm, spiritual reading
    utterance.pitch = 1.0;     // Natural pitch

    window.speechSynthesis.speak(utterance);
  },

  stop: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};
