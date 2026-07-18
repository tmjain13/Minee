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
  } catch (error: any) {
    if (error?.message?.includes("PERMISSION_DENIED") || error?.code === 7 || error?.message?.includes("Cloud Firestore API has not been used")) {
      console.warn(`[Security Logger] Firestore API is not enabled. Skipped logging security event: ${eventType}`);
    } else {
      console.error("Failed to write to security_logs:", error.message || error);
    }
  }
}
