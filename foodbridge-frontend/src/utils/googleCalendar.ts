/**
 * Builds a Google Calendar "Add to Calendar" URL.
 * Opens in a new tab — no OAuth or API keys required.
 */
export function buildGoogleCalendarUrl(params: {
  title: string;
  startTime: string; // ISO 8601
  durationMinutes?: number;
  description?: string;
  location?: string;
}): string {
  const { title, startTime, durationMinutes = 60, description = '', location = '' } = params;

  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  // Google Calendar expects YYYYMMDDTHHmmssZ format
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const query = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: description,
    location,
  });

  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}
