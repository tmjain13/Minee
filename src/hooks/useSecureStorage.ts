import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { secureStorage } from '../utils/secureStorage';

export { secureStorage } from '../utils/secureStorage';

export function useSecureStorage() {
  const { user } = useAuth();

  const setItem = useCallback(async (key: string, value: any, sensitive: boolean = false) => {
    if (!user?.uid) return;
    await secureStorage.set(user.uid, key, value, sensitive);
  }, [user]);

  const getItem = useCallback(async <T>(key: string, sensitive: boolean = false): Promise<T | null> => {
    if (!user?.uid) return null;
    return await secureStorage.get<T>(user.uid, key, sensitive);
  }, [user]);

  const removeItem = useCallback((key: string, sensitive: boolean = false) => {
    if (!user?.uid) return;
    secureStorage.remove(user.uid, key, sensitive);
  }, [user]);

  const clearUserData = useCallback(() => {
    if (user?.uid) secureStorage.clearAll(user.uid);
  }, [user]);

  return { setItem, getItem, removeItem, clearAllUserData: clearUserData };
}
