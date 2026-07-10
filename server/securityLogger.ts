import admin from "firebase-admin";

export async function logSecurityEvent(
  eventType: 'validation_failed' | 'rate_limit_hit' | 'unauthorized_access' | 'malicious_input' | 'ssrf_blocked',
  details: Record<string, any>,
  req?: any
) {
  try {
    const db = admin.firestore();
    await db.collection("security_logs").add({
      eventType,
      details,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: req?.ip || "unknown",
      uid: req?.user?.uid || "unauthenticated",
      userAgent: req?.headers?.["user-agent"] || "unknown",
      path: req?.path || "unknown"
    });
  } catch (error) {
    console.error("Failed to write to security_logs:", error);
  }
}
