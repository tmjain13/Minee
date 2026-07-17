import { auth } from './firebase';
import { handleFirestoreError as originalHandleFirestoreError, OperationType, FirestoreErrorInfo } from './firebase-utils';

export { OperationType };
export type { FirestoreErrorInfo };

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  // Call the original, logging-enabled, robust Firestore error handler
  try {
    originalHandleFirestoreError(error, operationType, path);
  } catch (err) {
    // Under firestoreErrors.ts contract, we swallow/absorb the error here rather than throwing a fatal error,
    // which lets the Firebase Firestore client operate correctly in persistent 
    // offline cache mode without crashing the React rendering tree or component states.
  }
}

