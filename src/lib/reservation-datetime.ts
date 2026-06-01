/** Combine a calendar date (YYYY-MM-DD) with a 12h time string for API payloads. */
export function combineDateAndTime(dateString: string, timeString: string): Date {
  const date = new Date(dateString);
  const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);

  if (!match) {
    throw new Error('Invalid time format');
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  date.setHours(hours, minutes, 0, 0);
  return date;
}

/** ISO-8601 UTC string expected by the reservation API. */
export function toApiDateTime(date: Date): string {
  return date.toISOString();
}
