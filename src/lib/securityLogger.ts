import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function logSecurityEvent(userId: string, event: string, metadata: Record<string, any> = {}) {
  if (typeof event !== 'string') {
    console.error('Security event must be a string');
    return;
  }
  
  const truncatedEvent = event.length >= 128 ? event.substring(0, 127) : event;
  
  try {
    await addDoc(collection(db, 'security_logs'), {
      userId,
      event: truncatedEvent,
      metadata,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}
