/**
 * Reservation status codes from API query filter (0–6).
 * Normalize API `status` field whether it is numeric or string.
 */
export const RESERVATION_STATUS_CODE = {
  pending: 0,
  approved: 1,
  confirmed: 2,
  rejected: 3,
  cancelled: 4,
  completed: 5,
  checkedIn: 6,
} as const;

const CODE_TO_LABEL: Record<number, string> = {
  0: 'pending',
  1: 'approved',
  2: 'confirmed',
  3: 'rejected',
  4: 'cancelled',
  5: 'completed',
  6: 'checkedin',
};

export function normalizeReservationStatus(status: string | number | undefined | null): string {
  if (status === undefined || status === null || status === '') return '';
  if (typeof status === 'number' || /^\d+$/.test(String(status))) {
    const code = typeof status === 'number' ? status : parseInt(String(status), 10);
    return CODE_TO_LABEL[code] ?? String(status).toLowerCase();
  }
  return String(status).toLowerCase();
}

export const STATUS_GROUPS = {
  active: ['approved', 'confirmed', 'checkedin'],
  pending: ['pending'],
  inactive: ['completed', 'cancelled', 'rejected'],
} as const;

export function matchesStatusGroup(
  group: readonly string[],
  status: string | number | undefined | null
): boolean {
  const normalized = normalizeReservationStatus(status);
  return group.includes(normalized);
}

export function formatStatusLabel(status: string | number | undefined | null): string {
  const s = normalizeReservationStatus(status);
  if (!s) return 'Unknown';
  if (s === 'pending') return 'Pending approval';
  if (s === 'checkedin') return 'Checked in';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function sortStaffReservationsByPriority<
  T extends { status: string | number; startDateTime: string },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aPending = matchesStatusGroup(STATUS_GROUPS.pending, a.status);
    const bPending = matchesStatusGroup(STATUS_GROUPS.pending, b.status);
    if (aPending && !bPending) return -1;
    if (!aPending && bPending) return 1;
    return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
  });
}
