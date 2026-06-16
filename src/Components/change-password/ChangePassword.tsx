import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { HiLockClosed } from 'react-icons/hi';
import { changePassword } from '../../services/auth';
import { APP_ROUTES } from '../../constants/routes';
import * as yup from 'yup';

const StyledLockIcon = () => <HiLockClosed className="text-[#6B8A62]" />;

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const validationSchema = yup.object({
  currentPassword: yup.string()
    .required('Current password is required'),
  newPassword: yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .matches(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .matches(/^(?=.*\d)/, 'Password must contain at least one number')
    .matches(/^(?=.*[@$!%*?&])/, 'Password must contain at least one special character (@$!%*?&)'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'red' };
  if (score === 3) return { score, label: 'Medium', color: 'yellow' };
  return { score, label: 'Strong', color: 'green' };
};

export default function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      return {};
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: FormErrors = {};
        err.inner.forEach(error => {
          if (error.path) {
            validationErrors[error.path as keyof FormErrors] = error.message;
          }
        });
        return validationErrors;
      }
      return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    const validationErrors = await validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await changePassword(formData);
      

      
      if (response.succeeded) {
        // Log out and redirect to login — route through the centralized logout
        // screen so history/back cannot restore the now-stale session.
        navigate(APP_ROUTES.logout, {
          state: {
            message: 'Password changed successfully! Please login with your new password.',
          },
        });
      } else {
        setSubmitError(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#6B8A62] md:text-3xl">
            Change Password
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your current password and choose a new one
          </p>
        </div>

        {submitError && (
          <Alert color="failure" onDismiss={() => setSubmitError(null)}>
            <span className="font-medium">Error!</span> {submitError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="currentPassword">Current Password</Label>
            </div>
            <TextInput
              id="currentPassword"
              name="currentPassword"
              type="password"
              onChange={handleChange}
              value={formData.currentPassword}
              icon={StyledLockIcon}
              placeholder="Enter current password"
              style={{
                fontSize: '0.75rem',
                color: '#828283',
              }}
              required
              color={errors.currentPassword ? 'failure' : undefined}
            />
            {errors.currentPassword && <p className="text-xs text-red-600 mt-1">{errors.currentPassword}</p>}
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="newPassword">New Password</Label>
            </div>
            <TextInput
              id="newPassword"
              name="newPassword"
              type="password"
              onChange={handleChange}
              value={formData.newPassword}
              icon={StyledLockIcon}
              placeholder="Enter new password"
              style={{
                fontSize: '0.75rem',
                color: '#828283',
              }}
              required
              color={errors.newPassword ? 'failure' : undefined}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            {errors.newPassword && <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>}
            
            {passwordFocused && formData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Password Strength:</span>
                  <span className={`text-sm font-bold ${passwordStrength.color === 'red' ? 'text-red-500' : passwordStrength.color === 'yellow' ? 'text-yellow-500' : 'text-[#6B8A62]'}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.score <= 2 ? 'bg-red-500 w-1/3' : 
                      passwordStrength.score === 3 ? 'bg-yellow-500 w-2/3' : 
                      'bg-[#6B8A62] w-full'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
            </div>
            <TextInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              onChange={handleChange}
              value={formData.confirmPassword}
              icon={StyledLockIcon}
              placeholder="Confirm new password"
              style={{
                fontSize: '0.75rem',
                color: '#828283',
              }}
              required
              color={errors.confirmPassword ? 'failure' : undefined}
            />
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-2 w-full bg-gradient-to-r from-[#6B8A62] to-[#5A7352] text-white py-3 px-6 rounded-lg hover:from-[#5A7352] hover:to-[#4A5C42] focus:outline-none focus:ring-2 focus:ring-[#6B8A62] transition-all cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" light />
                Changing Password...
              </span>
            ) : (
              'Change Password'
            )}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="text-sm text-[#6B8A62] hover:text-[#5A7352]"
            >
              ← Back to Profile
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}