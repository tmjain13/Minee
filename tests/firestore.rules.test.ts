/**
 * Firestore security rules tests.
 * Requires the Firestore emulator on port 8080 (see firebase.json).
 *
 * Run locally / in CI with:
 *   npx firebase emulators:exec --only firestore "npx jest --selectProjects firestore-rules"
 */
import {
  initializeTestEnvironment,
  assertFails,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, getDoc, setDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'terapanth-ai-hub-rules-test',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('default deny catch-all', () => {
  test('unauthenticated users cannot read arbitrary documents', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'someRandomCollection/someDoc')));
  });

  test('unauthenticated users cannot write arbitrary documents', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      setDoc(doc(db, 'someRandomCollection/someDoc'), { foo: 'bar' })
    );
  });

  test('signed-in users still cannot write to unmatched collections', async () => {
    const db = testEnv.authenticatedContext('user_abc').firestore();
    await assertFails(
      setDoc(doc(db, 'notARealCollection/doc1'), { hello: 'world' })
    );
  });

  test('non-admin users cannot write to the admins collection', async () => {
    const db = testEnv.authenticatedContext('user_abc').firestore();
    await assertFails(
      setDoc(doc(db, 'admins/user_abc'), { granted: true })
    );
  });
});
