import { Routes, Route, useLocation } from 'react-router-dom';
import { APP_ROUTES } from '../constants/routes';
import PageContainer from '../Components/layout/PageContainer';
import ProtectedRoute from '../Components/auth/ProtectedRoute';
import { useNavigation } from '../contexts/NavigationContext';
import Loader from '../Components/Loader';
import { useEffect } from 'react';
import Home from '../Components/home/Home';
import Login from '../Components/login/Login';
import Logout from '../Components/logout/Logout';
import Signup from '../Components/signup/Signup';
import ForgotPassword from '../Components/forgot-password/ForgotPassword';
import ResetPassword from '../Components/reset-password/ResetPassword';
import ChangePassword from '../Components/change-password/ChangePassword';
import ReservationPage from '../Components/reservation/ReservationPage';
import ConfirmationWrapper from '../Components/reservation/ConfirmationWrapper';
import Profile from '../Components/profile/Profile';
import EmailConfirmation from '../Components/emailconfirmation/EmailConfirmation';
import NotFound from '../Components/not-found/NotFound';
import About from '../Components/about/About';
import Spots from '../Components/spots/Spots';
import RestaurantDetails from '../Components/restaurants/RestaurantDetails';
import StaffReservations from '../Components/admin/StaffReservations';
import MyReservations from '../Components/myreservations/MyReservations';
import Favorites from '../Components/favorites/Favorites';
import SuperAdmin from '../Components/SuperAdmin/SuperAdmin';
import ManagerDashboard from '../Components/ManagerDashboard/ManagerDashboard';
import StaffPage from '../Components/staff/StaffPage';
import StaffRegister from '../Components/staff/StaffRegister';
import RoleRoute from '../Components/auth/RoleRoute';
import { USER_ROLES } from '../lib/user-roles';

export default function AppRoutes() {
  const { isNavigating, setIsNavigating } = useNavigation();
  const location = useLocation();

  useEffect(() => {
    // Show loader for 0.5 seconds when location changes
    if (location.pathname !== '/') {
      setIsNavigating(true);
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, setIsNavigating]);

  return (
    <>
      {isNavigating && <Loader />}
      <Routes>
        <Route element={<PageContainer />}>
          <Route path={APP_ROUTES.home} element={<Home />} />
          <Route path={APP_ROUTES.login} element={<Login />} />
          <Route path={APP_ROUTES.logout} element={<Logout />} />
          <Route path={APP_ROUTES.signup} element={<Signup />} />
          <Route path={APP_ROUTES.forgotPassword} element={<ForgotPassword />} />
          <Route path={APP_ROUTES.resetPassword} element={<ResetPassword />} />
          <Route path={APP_ROUTES.changePassword} element={<ChangePassword />} />
          <Route path={APP_ROUTES.confirmEmail} element={<EmailConfirmation />} />
          <Route path={APP_ROUTES.staffRegister} element={<StaffRegister />} />
          
          {/* Protected Routes - require authentication */}
          <Route path="/reservation" element={
            <ProtectedRoute>
              <ReservationPage />
            </ProtectedRoute>
          } />
          <Route path="/confirmation" element={
            <ProtectedRoute>
              <ConfirmationWrapper />
            </ProtectedRoute>
          } />
          <Route path={APP_ROUTES.profile} element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path={APP_ROUTES.about} element={<About />} />
          <Route path={APP_ROUTES.spots} element={<Spots />} />
          <Route path={APP_ROUTES.restaurantDetails} element={
            <ProtectedRoute>
              <RestaurantDetails />
            </ProtectedRoute>
          } />
          <Route path={APP_ROUTES.staffReservations} element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...USER_ROLES.staff, ...USER_ROLES.manager]}>
                <StaffReservations />
              </RoleRoute>
            </ProtectedRoute>
          } />
          <Route path={APP_ROUTES.superAdmin} element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...USER_ROLES.superAdmin]}>
                <SuperAdmin />
              </RoleRoute>
            </ProtectedRoute>
          } />
          <Route path={APP_ROUTES.managerDashboard} element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...USER_ROLES.manager]}>
                <ManagerDashboard />
              </RoleRoute>
            </ProtectedRoute>
          } />
          <Route path={APP_ROUTES.staffDashboard} element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[...USER_ROLES.staff]}>
                <StaffPage />
              </RoleRoute>
            </ProtectedRoute>
          } />
          <Route path={APP_ROUTES.myReservations} element={
            <ProtectedRoute>
              <MyReservations />
            </ProtectedRoute>
          } />
          <Route path={APP_ROUTES.favorites} element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          } />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}