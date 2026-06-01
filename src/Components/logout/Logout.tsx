import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear authentication state
    logout();
    
    // Clear browser history to prevent back button access
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', () => {
      window.history.pushState(null, '', window.location.href);
    });
    
    // Redirect to home after a short delay
    const timer = setTimeout(() => {
      navigate('/');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [logout, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B8A62] mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Logging out...</h2>
        <p className="text-gray-600">You will be redirected to the home page.</p>
      </div>
    </div>
  );
}
