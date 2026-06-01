import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { APP_ROUTES, isPublicRoute } from '../../constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  redirectTo = APP_ROUTES.signup,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, authError } = useAuth();
  const location = useLocation();
  const isPublic = isPublicRoute(location.pathname);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-3">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"
          role="status"
          aria-label="Checking authentication"
        />
        <p className="text-gray-600 text-sm">Checking your session...</p>
      </div>
    );
  }

  if (authError && !isPublic) {
    return (
      <Navigate
        to={APP_ROUTES.login}
        state={{ from: location, authError }}
        replace
      />
    );
  }

  if (!isAuthenticated && !isPublic) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
