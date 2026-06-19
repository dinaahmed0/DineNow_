import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { APP_ROUTES } from '../../constants/routes';
import { getRolesFromToken } from '../../lib/jwt-claims';

interface RoleRouteProps {
  children: React.ReactNode;
  /** Role names accepted (case-insensitive), e.g. SuperAdmin, Manager, Staff */
  allowedRoles: string[];
  fallbackTo?: string;
}

export default function RoleRoute({
  children,
  allowedRoles,
  fallbackTo = APP_ROUTES.home,
}: RoleRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-3">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B8A62]"
          role="status"
          aria-label="Loading"
        />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user?.token) {
    return <Navigate to={APP_ROUTES.login} state={{ from: location }} replace />;
  }

  const userRoles = getRolesFromToken(user.token).map((r) => r.toLowerCase());
  const allowed = allowedRoles.map((r) => r.toLowerCase());
  const permitted =
    userRoles.length > 0 && userRoles.some((r) => allowed.includes(r));

  if (!permitted) {
    return <Navigate to={fallbackTo} replace />;
  }

  return <>{children}</>;
}
