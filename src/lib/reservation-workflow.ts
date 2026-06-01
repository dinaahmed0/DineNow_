import { matchesStatusGroup, STATUS_GROUPS } from './reservation-status';

export function isPendingApproval(status: string | number | undefined | null): boolean {
  return matchesStatusGroup(STATUS_GROUPS.pending, status);
}

export function getStatusHelperText(status: string | number | undefined | null): string {
  if (isPendingApproval(status)) {
    return 'Your request was sent to the restaurant team. You will see updates here when staff approves or declines.';
  }
  if (matchesStatusGroup(STATUS_GROUPS.active, status)) {
    return 'Your table is confirmed. See you at the restaurant!';
  }
  if (matchesStatusGroup(STATUS_GROUPS.inactive, status)) {
    return 'This reservation is closed.';
  }
  return '';
}
