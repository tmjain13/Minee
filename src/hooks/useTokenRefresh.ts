import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export function useTokenRefresh() {
  const { user } = useAuth();
  const retryCount = useRef(0);
  const timeoutId = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!user) {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      return;
    }

    const scheduleRefresh = async () => {
      try {
        // Firebase ID tokens are valid for 1 hour (3600 seconds)
        // We'll refresh 5 minutes (300 seconds) before expiry
        const tokenResult = await user.getIdTokenResult();
        const expirationTime = new Date(tokenResult.expirationTime).getTime();
        const currentTime = Date.now();
        
        const timeUntilExpiry = expirationTime - currentTime;
        const refreshTime = Math.max(0, timeUntilExpiry - (5 * 60 * 1000)); 

        timeoutId.current = setTimeout(async () => {
          try {
            await user.getIdToken(true);
            if (import.meta.env.DEV) {
              console.log("Firebase token refreshed successfully");
            }
            retryCount.current = 0; // reset
            scheduleRefresh(); // schedule next
          } catch (err) {
            if (import.meta.env.DEV) {
              console.error("Failed to refresh token:", err);
            }
            // Exponential backoff
            const backoff = Math.min(1000 * Math.pow(2, retryCount.current), 60000);
            retryCount.current += 1;
            timeoutId.current = setTimeout(scheduleRefresh, backoff);
          }
        }, refreshTime);
        
      } catch (err) {
        console.error("Error scheduling token refresh:", err);
      }
    };

    scheduleRefresh();

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, [user]);
}
