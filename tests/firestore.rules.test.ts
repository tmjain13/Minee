import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let testEnv: RulesTestEnvironment;

const PROJECT_ID = "terapanth-ai-hub-test";

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(resolve(__dirname, "../firestore.rules"), "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

// ─── AUTH HELPERS ───
const authedDb = (uid: string) => testEnv.authenticatedContext(uid).firestore();
const unauthedDb = () => testEnv.unauthenticatedContext().firestore();

// ─── TEST SUITE: USERS COLLECTION ───
describe("Users Collection", () => {
  test("unauthenticated user CANNOT read users", async () => {
    const db = unauthedDb();
    await expect(getDoc(doc(db, "users", "test-user"))).toBeDenied();
  });

  test("unauthenticated user CANNOT write users", async () => {
    const db = unauthedDb();
    await expect(
      setDoc(doc(db, "users", "test-user"), { name: "Test" })
    ).toBeDenied();
  });

  test("authenticated user CAN read their own user doc", async () => {
    const db = authedDb("user-123");
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "users", "user-123"), {
        name: "Test User",
        email: "test@example.com",
      });
    });
    await expect(getDoc(doc(db, "users", "user-123"))).toBeAllowed();
  });

  test("authenticated user CANNOT read another user's doc", async () => {
    const db = authedDb("user-123");
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "users", "user-456"), {
        name: "Other User",
      });
    });
    await expect(getDoc(doc(db, "users", "user-456"))).toBeDenied();
  });

  test("authenticated user CAN update their own user doc", async () => {
    const db = authedDb("user-123");
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "users", "user-123"), {
        name: "Test User",
      });
    });
    await expect(
      updateDoc(doc(db, "users", "user-123"), { name: "Updated" })
    ).toBeAllowed();
  });
});

// ─── TEST SUITE: ANUVRAT STATS (INCREMENT INTEGRITY) ───
describe("Anuvrat Stats Collection — Increment Integrity", () => {
  test("anuvrat count must increment by exactly 1", async () => {
    const userDb = authedDb("voter-123");

    // Initialize stat doc
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "anuvratStats", "stat-1"), {
        count: 0,
      });
    });

    // User increments count — count must become exactly 1
    await expect(
      updateDoc(doc(userDb, "anuvratStats", "stat-1"), { count: 1 })
    ).toBeAllowed();
  });

  test("anuvrat count CANNOT increment by more than 1", async () => {
    const userDb = authedDb("voter-123");

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "anuvratStats", "stat-2"), {
        count: 0,
      });
    });

    // Attempt to increment by 2 — should be denied
    await expect(
      updateDoc(doc(userDb, "anuvratStats", "stat-2"), { count: 2 })
    ).toBeDenied();
  });
});

// ─── TEST SUITE: GALLERY LIKES (LIKE INTEGRITY) ───
describe("Gallery Likes Collection — Integrity", () => {
  test("gallery likes count must match likedBy array size", async () => {
    const userDb = authedDb("user-123");

    await expect(
      setDoc(doc(userDb, "gallery_likes", "img-1"), {
        count: 1,
        likedBy: ["user-123"],
      })
    ).toBeAllowed();
  });

  test("gallery likes CANNOT be created with mismatched size", async () => {
    const userDb = authedDb("user-123");

    await expect(
      setDoc(doc(userDb, "gallery_likes", "img-2"), {
        count: 5,
        likedBy: ["user-123"],
      })
    ).toBeDenied();
  });
});

// ─── TEST SUITE: SECURITY LOGS ───
describe("Security Logs", () => {
  test("admin CAN read security_logs", async () => {
    const adminDb = authedDb("admin-uid");

    // Setup admin user doc first because rules check:
    // exists(/databases/$(database)/documents/users/$(request.auth.uid)) && get(...).data.role == 'admin'
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "users", "admin-uid"), {
        role: "admin",
      });
      await setDoc(doc(context.firestore(), "security_logs", "log-1"), {
        event: "test",
        timestamp: new Date(),
      });
    });

    await expect(getDoc(doc(adminDb, "security_logs", "log-1"))).toBeAllowed();
  });

  test("non-admin CANNOT read security_logs", async () => {
    const userDb = authedDb("user-123");

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "security_logs", "log-1"), {
        event: "test",
      });
    });

    await expect(getDoc(doc(userDb, "security_logs", "log-1"))).toBeDenied();
  });
});

// ─── CUSTOM MATCHERS ───
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAllowed(): R;
      toBeDenied(): R;
    }
  }
}

expect.extend({
  async toBeAllowed(promise: Promise<unknown>) {
    try {
      await promise;
      return { pass: true, message: () => "Expected operation to be denied, but it was allowed" };
    } catch (e) {
      return { pass: false, message: () => `Expected operation to be allowed, but got error: ${e}` };
    }
  },
  async toBeDenied(promise: Promise<unknown>) {
    try {
      await promise;
      return { pass: false, message: () => "Expected operation to be denied, but it was allowed" };
    } catch (e) {
      return { pass: true, message: () => `Expected operation to be denied, and it was: ${e}` };
    }
  },
});
