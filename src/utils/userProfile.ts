/**
 * Terapanth AI User Profile & Preferences Utility
 * Secure client-side local storage with reactive custom window events
 */

export interface UserProfileData {
  name: string;          // Short name (e.g. "Karan") for "Jai Jinendra Karan!"
  fullName?: string;     // Full name (e.g. "Karan Jain")
  age?: string | number; // e.g. "28"
  gender?: string;       // e.g. "Male" | "Female" | "Other" | "Prefer not to say"
  city?: string;         // e.g. "Surat"
  wing?: string;         // e.g. "ABTYP (Yuvak Parishad)", "TPF", "ABTMM", "Gyanshala", "General Devotee"
  phone?: string;
  email?: string;
  registeredAt?: string; // ISO date string
  spiritualGoal?: string;// e.g. "Daily Samayik & Jaap"
  photoURL?: string;
}

const PROFILE_KEY = 'terapanth_user_profile';

export const DEFAULT_USER_PROFILE: UserProfileData = {
  name: '',
  fullName: '',
  age: '',
  gender: '',
  city: '',
  wing: 'General Devotee (श्रावक/श्राविका)',
  spiritualGoal: 'दैनिक सामयिक एवं स्वाध्याय',
  registeredAt: new Date().toISOString()
};

/**
 * Retrieve saved user profile from localStorage
 */
export function getUserProfile(): UserProfileData {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_USER_PROFILE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_USER_PROFILE, ...parsed };
  } catch (err) {
    console.warn('Failed to parse user profile from localStorage:', err);
    return DEFAULT_USER_PROFILE;
  }
}

/**
 * Save updated user profile and dispatch event for immediate component re-renders
 */
export function saveUserProfile(updated: Partial<UserProfileData>): UserProfileData {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const current = getUserProfile();
    const merged: UserProfileData = {
      ...current,
      ...updated,
      registeredAt: current.registeredAt || new Date().toISOString()
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
    
    // Dispatch reactive window event for app-wide UI sync
    window.dispatchEvent(new CustomEvent('terapanth_profile_updated', { detail: merged }));
    return merged;
  } catch (err) {
    console.error('Failed to save user profile to localStorage:', err);
    return DEFAULT_USER_PROFILE;
  }
}

/**
 * Generate personalized greeting based on user name
 * Example: If name is "Karan" -> "Jai Jinendra Karan! 🙏" or "जय जिनेन्द्र करण! 🙏"
 */
export function getPersonalizedGreeting(language: 'en' | 'hi' = 'en', nameOverride?: string): string {
  const profile = getUserProfile();
  const userName = (nameOverride !== undefined ? nameOverride : profile.name || profile.fullName || '').trim();
  
  if (!userName) {
    return language === 'hi' ? 'जय जिनेन्द्र! 🙏' : 'Jai Jinendra! 🙏';
  }

  // Extract first name if full name is provided
  const firstName = userName.split(' ')[0];

  if (language === 'hi') {
    return `जय जिनेन्द्र ${firstName}! 🙏`;
  } else {
    return `Jai Jinendra ${firstName}! 🙏`;
  }
}
