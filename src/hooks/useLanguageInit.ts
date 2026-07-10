import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Custom hook to initialize and keep the HTML document attributes
 * in sync with the user's persisted language preference.
 */
export function useLanguageInit() {
  const { language } = useLanguage();

  useEffect(() => {
    // Dynamically update the html tag's lang attribute to support accessibility and correct document metadata
    document.documentElement.setAttribute('lang', language);
    
    // Set a class on body to allow language-specific styling (e.g., Devanagari custom tracking/spacing if needed)
    document.body.classList.remove('lang-hi', 'lang-en');
    document.body.classList.add(`lang-${language}`);
    
    console.log(`[Language Init] Localized document configuration applied for: ${language.toUpperCase()}`);
  }, [language]);

  return language;
}
