/**
 * A safe development logging helper that suppresses output in production.
 */
export function devLog(...args: any[]) {
  const isDev = 
    typeof process !== 'undefined' && process.env ? process.env.NODE_ENV !== 'production' :
    typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.DEV : 
    true;

  if (isDev && typeof console !== 'undefined') {
    console.log(...args);
  }
}

export function devWarn(...args: any[]) {
  const isDev = 
    typeof process !== 'undefined' && process.env ? process.env.NODE_ENV !== 'production' :
    typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.DEV : 
    true;

  if (isDev && typeof console !== 'undefined') {
    console.warn(...args);
  }
}

export function devError(...args: any[]) {
  const isDev = 
    typeof process !== 'undefined' && process.env ? process.env.NODE_ENV !== 'production' :
    typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.DEV : 
    true;

  if (isDev && typeof console !== 'undefined') {
    console.error(...args);
  }
}
