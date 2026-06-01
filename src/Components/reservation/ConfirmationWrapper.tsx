import { useLocation } from 'react-router-dom';
import ConfirmationPage from './ConfirmationPage';
import type { ReservationUserItem } from '../../types/reservation';

export interface ConfirmationOrderedFoodItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface ConfirmationState {
  formData: {
    email?: string;
    phone?: string;
    date?: string;
    time?: string;
    partySize?: number | string;
    seatingPreference?: string;
  };
  restaurantData: {
    name?: string;
    image?: string;
    cuisine?: string;
    location?: string;
    rating?: number;
  };
  orderedFood: ConfirmationOrderedFoodItem[];
  paymentCompleted: boolean;
  createdReservation?: ReservationUserItem | null;
  apiMessage?: string;
}

export default function ConfirmationWrapper() {
  const location = useLocation();
  const reservationData: ConfirmationState = location.state?.reservationData ?? {
    formData: {},
    restaurantData: {},
    orderedFood: [],
    paymentCompleted: false,
    createdReservation: null,
  };

  return <ConfirmationPage reservationData={reservationData} />;
}
