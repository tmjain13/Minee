/**
 * Local Scheduling Helper for Terapanth AI Hub
 * Triggers browser notifications and in-app alerts at specific times for tasks labeled as 'Evening' or 'Daily'.
 */

import { Todo } from '../types';

export interface TaskScheduleConfig {
  defaultMorningHour: number; // e.g. 8 (8:00 AM) for 'Daily' tasks
  defaultEveningHour: number; // e.g. 18 (6:00 PM) for 'Evening' tasks
  notificationWindowMinutes: number; // e.g. 60 min window
}

const DEFAULT_CONFIG: TaskScheduleConfig = {
  defaultMorningHour: 8,
  defaultEveningHour: 18,
  notificationWindowMinutes: 60,
};

/**
 * Request native browser notification permission
 */
export async function requestTaskNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('[TaskScheduler] Failed to request notification permission:', err);
    return 'denied';
  }
}

/**
 * Check if task is labeled as 'Evening' or 'Daily'
 */
export function isScheduledTask(todo: Todo): { isDaily: boolean; isEvening: boolean } {
  const tag = (todo.tag || '').toLowerCase();
  const cat = (todo.category || '').toLowerCase();
  const text = (todo.text || '').toLowerCase();

  const isDaily = tag.includes('daily') || tag.includes('दैनिक') || cat.includes('daily') || text.includes('daily') || text.includes('दैनिक');
  const isEvening = tag.includes('evening') || tag.includes('सायं') || cat.includes('evening') || text.includes('evening') || text.includes('सायं') || text.includes('संध्या');

  return { isDaily, isEvening };
}

/**
 * Trigger browser notification or in-app toast fallback
 */
export function fireTaskNotification(todo: Todo, language: string = 'hi') {
  if (typeof window === 'undefined') return;

  const todayStr = new Date().toISOString().split('T')[0];
  const notifKey = `terapanth_task_notified_${todo.id}_${todayStr}`;

  // Prevent duplicate notifications on the same day
  if (localStorage.getItem(notifKey) === 'true') {
    return;
  }

  const { isEvening } = isScheduledTask(todo);
  const title = isEvening
    ? (language === 'hi' ? '🌙 सायंकालीन साधना अनुस्मारक' : '🌙 Evening Sadhana Reminder')
    : (language === 'hi' ? '☀️ दैनिक साधना संकल्प' : '☀️ Daily Sadhana Task');

  const body = language === 'hi'
    ? `समय हो गया है! अपना संकल्प पूर्ण करें: "${todo.text}"`
    : `Time to complete your task: "${todo.text}"`;

  // 1. Try Native Browser Notification
  let firedNative = false;
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/media/logos/terapanth_logo.png',
        tag: `task-${todo.id}`,
        requireInteraction: false
      });
      firedNative = true;
    } catch (e) {
      console.warn('[TaskScheduler] Error firing native notification:', e);
    }
  }

  // Mark as notified today
  localStorage.setItem(notifKey, 'true');

  // 2. Dispatch custom window event for in-app notification toast banner
  window.dispatchEvent(
    new CustomEvent('terapanth_task_notification_triggered', {
      detail: {
        todoId: todo.id,
        text: todo.text,
        title,
        body,
        tag: todo.tag,
        firedNative
      }
    })
  );
}

/**
 * Core Inspector: Scans all incomplete 'Evening' & 'Daily' tasks and triggers notifications at scheduled times
 */
export function checkAndTriggerScheduledTaskNotifications(
  todos: Todo[],
  language: string = 'hi',
  config: TaskScheduleConfig = DEFAULT_CONFIG
) {
  if (typeof window === 'undefined' || !todos || todos.length === 0) return;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const todayStr = now.toISOString().split('T')[0];

  todos.forEach((todo) => {
    if (todo.completed) return; // Skip completed tasks

    const { isDaily, isEvening } = isScheduledTask(todo);
    if (!isDaily && !isEvening && !todo.dueTime) return;

    const notifKey = `terapanth_task_notified_${todo.id}_${todayStr}`;
    if (localStorage.getItem(notifKey) === 'true') return;

    let targetHour = isEvening ? config.defaultEveningHour : config.defaultMorningHour;
    let targetMinute = 0;

    // Custom due time handling (e.g. "18:30" or "08:15")
    if (todo.dueTime && todo.dueTime.includes(':')) {
      const parts = todo.dueTime.split(':');
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(h) && !isNaN(m)) {
        targetHour = h;
        targetMinute = m;
      }
    }

    // Check if current time is at or past the target time (within notification window)
    const currentTotalMins = currentHour * 60 + currentMinute;
    const targetTotalMins = targetHour * 60 + targetMinute;

    if (currentTotalMins >= targetTotalMins && currentTotalMins < targetTotalMins + config.notificationWindowMinutes) {
      fireTaskNotification(todo, language);
    }
  });
}

/**
 * Return summary counts of scheduled Evening & Daily tasks
 */
export function getScheduledTaskSummary(todos: Todo[]) {
  if (!todos) return { dailyCount: 0, eveningCount: 0, pendingCount: 0 };

  let dailyCount = 0;
  let eveningCount = 0;
  let pendingCount = 0;

  todos.forEach((t) => {
    if (t.completed) return;
    const { isDaily, isEvening } = isScheduledTask(t);
    if (isDaily) dailyCount++;
    if (isEvening) eveningCount++;
    if (isDaily || isEvening || t.dueTime) pendingCount++;
  });

  return { dailyCount, eveningCount, pendingCount };
}
