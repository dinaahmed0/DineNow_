import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from 'flowbite-react';

interface ProtectedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  redirectTo?: string;
  disabled?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'failure' | 'warning' | 'info' | 'light' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function ProtectedButton({ 
  children, 
  onClick, 
  redirectTo = '/signup',
  disabled = false,
  color = 'primary',
  size = 'md',
  className = ''
}: ProtectedButtonProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      navigate(redirectTo);
      return;
    }
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      color={color}
      size={size}
      className={className}
    >
      {children}
    </Button>
  );
}
