import { Navigate } from 'react-router-dom';
import { APP_ROUTES } from '../../constants/routes';

/** Legacy route — forwards to the staff dashboard. */
export default function StaffReservations() {
  return <Navigate to={APP_ROUTES.staffDashboard} replace />;
}
