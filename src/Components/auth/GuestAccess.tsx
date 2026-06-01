import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface GuestAccessProps {
  fallbackPath?: string;
}

export default function GuestAccess({ fallbackPath = '/signup' }: GuestAccessProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGuestClick = (e: React.MouseEvent, onClick?: () => void) => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      navigate(fallbackPath);
      return;
    }
    
    if (onClick) {
      onClick();
    }
  };

  return {
    handleGuestClick,
    isAuthenticated
  };
}

// Hook for easier usage
// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with guest helper
export function useGuestAccess() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const requireAuth = (callback?: () => void, fallbackPath = '/signup') => {
    return (e: React.MouseEvent) => {
      if (!isAuthenticated) {
        e.preventDefault();
        e.stopPropagation();
        navigate(fallbackPath);
        return;
      }
      
      if (callback) {
        callback();
      }
    };
  };

  return {
    requireAuth,
    isAuthenticated
  };
}
