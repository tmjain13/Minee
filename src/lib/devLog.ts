/**
 * A safe development logging helper that suppresses output in production.
 */
function checkIsDev(): boolean {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV !== 'production';
  }
  if (typeof window !== 'undefined' && window.location) {
    const hn = window.location.hostname;
    return hn === 'localhost' || hn === '127.0.0.1' || hn.includes('-dev-');
  }
  return true;
}

export function devLog(...args: any[]) {
  const isDev = checkIsDev();
  if (isDev && typeof console !== 'undefined') {
    console.log(...args);
  }
}

export function devWarn(...args: any[]) {
  const isDev = checkIsDev();
  if (isDev && typeof console !== 'undefined') {
    console.warn(...args);
  }
}

export function devError(...args: any[]) {
  const isDev = checkIsDev();
  if (isDev && typeof console !== 'undefined') {
    console.error(...args);
  }
}

