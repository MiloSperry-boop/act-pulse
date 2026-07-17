/**
 * Study reminders via the Web Notifications API.
 *
 * Honest scope: a static PWA cannot reliably schedule background push while it
 * is closed — that needs a push server. What this does do is fire a local
 * reminder when you *open* the app after your chosen time on a day you haven't
 * trained, and drive the in-app reminder banner. For a truly scheduled nudge,
 * the app also offers a downloadable calendar (.ics) event in Settings.
 */

const LAST_REMINDED_KEY = 'actpulse:lastRemindedDate';

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (!notificationsSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission | 'unsupported'
> {
  if (!notificationsSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

function todayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** True once the current time has reached the user's preferred study time. */
function pastPreferredTime(preferredTime: string | null, now: Date): boolean {
  if (!preferredTime) return true;
  const [h, m] = preferredTime.split(':').map((x) => parseInt(x, 10));
  const target = new Date(now);
  target.setHours(h || 0, m || 0, 0, 0);
  return now.getTime() >= target.getTime();
}

export interface ReminderContext {
  enabled: boolean;
  preferredTime: string | null;
  studiedToday: boolean;
}

/** Whether an in-app reminder banner should be shown right now. */
export function shouldShowReminderBanner(
  ctx: ReminderContext,
  now = new Date(),
): boolean {
  return (
    ctx.enabled && !ctx.studiedToday && pastPreferredTime(ctx.preferredTime, now)
  );
}

/**
 * Fire a one-per-day OS notification when appropriate. Safe to call on every
 * app open — it de-dupes via localStorage so it never nags more than once a day.
 */
export function maybeFireDailyReminder(
  ctx: ReminderContext,
  now = new Date(),
): boolean {
  if (!ctx.enabled || ctx.studiedToday) return false;
  if (!notificationsSupported() || Notification.permission !== 'granted') {
    return false;
  }
  if (!pastPreferredTime(ctx.preferredTime, now)) return false;

  const today = todayKey(now);
  if (localStorage.getItem(LAST_REMINDED_KEY) === today) return false;

  try {
    new Notification('Time for Summit', {
      body: 'A few focused minutes keeps your streak and your plan on track.',
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: 'act-pulse-daily',
    });
    localStorage.setItem(LAST_REMINDED_KEY, today);
    return true;
  } catch {
    return false;
  }
}

export function markRemindedToday(now = new Date()): void {
  localStorage.setItem(LAST_REMINDED_KEY, todayKey(now));
}
