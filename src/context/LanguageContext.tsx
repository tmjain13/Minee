import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '../data/translations';

export type Language = 'hi' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('terapanth_language');
    return (saved === 'hi' || saved === 'en') ? saved : 'hi';
  });

  useEffect(() => {
    localStorage.setItem('terapanth_language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  const t = (key: string): string => {
    const dict = translations[language];
    // Cast key as any to index safely
    return (dict as any)[key] || (translations['hi'] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
