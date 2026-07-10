// This file acts as a seamless gateway to your pre-configured, secure AI Studio Firebase database.
// It maps custom import paths so that standard tutorials or copy-pasted authentication code works out-of-the-box.
import { auth, db, storage, GoogleAuthProvider, googleProvider } from './lib/firebase';

export { auth, db, storage, GoogleAuthProvider, googleProvider };
