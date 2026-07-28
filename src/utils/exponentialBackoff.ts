/**
 * Exponential Backoff Retry Utility for Terapanth AI Hub
 * 
 * Provides exponential backoff retry logic for manual sync and network requests,
 * ensuring high reliability during unstable or spotty network conditions.
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: boolean;
  onRetry?: (attempt: number, delayMs: number, error: any) => void;
}

export async function executeWithExponentialBackoff<T>(
  task: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    factor = 2,
    jitter = true,
    onRetry,
  } = options;

  let attempt = 0;

  while (true) {
    try {
      return await task(attempt + 1);
    } catch (error) {
      attempt++;
      if (attempt > maxRetries) {
        throw error;
      }

      // Calculate exponential backoff delay
      let delay = initialDelayMs * Math.pow(factor, attempt - 1);

      // Add random jitter (0 - 20%) to prevent thundering herd problem
      if (jitter) {
        delay = delay + Math.random() * (delay * 0.2);
      }

      // Cap at maxDelayMs
      delay = Math.min(delay, maxDelayMs);

      if (onRetry) {
        onRetry(attempt, delay, error);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
