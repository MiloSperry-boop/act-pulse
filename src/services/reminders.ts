/**
 * Generate a downloadable .ics calendar file for a daily study reminder.
 * A static PWA cannot send scheduled push notifications on its own, so we hand
 * the user a real calendar event instead of pretending background pushes work.
 */

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/** Build an iCalendar string for a daily recurring reminder at HH:mm. */
export function buildDailyReminderIcs(
  time: string,
  title = 'Summit — daily practice',
): string {
  const [hh, mm] = time.split(':').map((x) => parseInt(x, 10));
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hh || 17,
    mm || 0,
  );
  // If today's time already passed, start tomorrow.
  if (start.getTime() < now.getTime()) start.setDate(start.getDate() + 1);
  const end = new Date(start.getTime() + 15 * 60000);

  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(
      d.getHours(),
    )}${pad(d.getMinutes())}00`;

  const uid = `actpulse-${start.getTime()}@act-pulse.local`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Summit//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${fmt(now)}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    'RRULE:FREQ=DAILY',
    `SUMMARY:${title}`,
    'DESCRIPTION:Time for a short Summit session. Open the app and tap Start today\\’s session.',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Summit practice',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadText(
  filename: string,
  text: string,
  mime = 'text/plain',
): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
