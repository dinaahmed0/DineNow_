import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { APP_ROUTES } from '../../constants/routes';

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Forward any state the caller attached (e.g. a "password changed" message)
  // through to the login page.
  const loginState = location.state;

  useEffect(() => {
    // 1) Clear authentication state + storage first
    logout();

    // 2) Actively block the back button from returning to protected pages.
    //    We keep the logout URL as the current history entry and force users back
    //    to the login page.
    const currentUrl = window.location.href;
    window.history.replaceState(null, '', currentUrl);
    window.history.pushState(null, '', currentUrl);

    const handlePopState = () => {
      window.history.replaceState(null, '', currentUrl);
      navigate(APP_ROUTES.login, { replace: true, state: loginState });
    };

    window.addEventListener('popstate', handlePopState);

    // 3) Redirect to login (replace history entry)
    const timer = window.setTimeout(() => {
      navigate(APP_ROUTES.login, { replace: true, state: loginState });
    }, 300);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [logout, navigate, loginState]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B8A62] mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Logging out...</h2>
        <p className="text-gray-600">You will be redirected to the login page.</p>
      </div>
    </div>
  );
}

