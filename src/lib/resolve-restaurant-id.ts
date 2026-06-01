import { getRestaurantIdFromToken } from './jwt-claims';
import { getTables } from '../services/table';

/** Resolve the manager/staff restaurant id from JWT or scoped table API. */
export async function resolveRestaurantId(token: string): Promise<number | null> {
  const fromToken = getRestaurantIdFromToken(token);
  if (fromToken) return fromToken;

  try {
    const response = await getTables({ pageIndex: 0, pageSize: 1 });
    if (response.succeeded && response.data?.data?.length) {
      return response.data.data[0].restaurantId;
    }
  } catch {
    // not available for this user
  }

  const stored = localStorage.getItem('restaurantId');
  if (stored) {
    const id = Number(stored);
    if (!Number.isNaN(id) && id > 0) return id;
  }

  return null;
}
