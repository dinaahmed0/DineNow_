import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { APP_ROUTES } from '../../constants/routes';
import { Card, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { resetPassword } from '../../services/auth';
import * as yup from 'yup';

const StyledLockIcon = () => <HiLockClosed className="text-[#6B8A62]" />;

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
}

const validationSchema = yup.object({
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
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;
  
  const strengthMap: Record<number, { score: number; label: string; color: string }> = {
    0: { score: 0, label: 'Very Weak', color: 'bg-red-500' },
    1: { score: 1, label: 'Weak', color: 'bg-orange-500' },
    2: { score: 2, label: 'Fair', color: 'bg-yellow-500' },
    3: { score: 3, label: 'Good', color: 'bg-blue-500' },
    4: { score: 4, label: 'Strong', color: 'bg-[#6B8A62]' },
    5: { score: 5, label: 'Very Strong', color: 'bg-[#5A7352]' },
  };
  
  return strengthMap[Math.min(score, 5)] || strengthMap[0];
};

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<FormData>({
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

  useEffect(() => {
    if (!token || !email) {
      setSubmitError('Invalid reset link. Please request a new password reset.');
    }
  }, [token, email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSubmitError(null);
  };

  const validateField = async (fieldName: string, value: unknown) => {
    try {
      let fieldSchema;
      switch (fieldName) {
        case 'newPassword':
          fieldSchema = yup.string()
            .required('New password is required')
            .min(8, 'Password must be at least 8 characters')
            .matches(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
            .matches(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
            .matches(/^(?=.*\d)/, 'Password must contain at least one number')
            .matches(/^(?=.*[@$!%*?&])/, 'Password must contain at least one special character (@$!%*?&)');
          break;
        case 'confirmPassword':
          fieldSchema = yup.string()
            .required('Please confirm your password')
            .oneOf([formData.newPassword], 'Passwords must match');
          break;
        default:
          return true;
      }
      
      await fieldSchema.validate(value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: undefined
      }));
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: error.message
        }));
      }
      return false;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!token || !email) {
      setSubmitError('Invalid reset link. Please request a new password reset.');
      return;
    }

    // Validate form
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const newErrors: FormErrors = {};
        error.inner.forEach(err => {
          if (err.path) {
            newErrors[err.path as keyof FormErrors] = err.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    setIsLoading(true);

    try {
      await resetPassword({
        email,
        token,
        newPassword: formData.newPassword
      });
      setIsSuccess(true);

    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#6B8A62]/10 mb-4">
              <HiLockClosed className="h-6 w-6 text-[#6B8A62]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Password Reset Successful
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            <Link
              to={APP_ROUTES.login}
              className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#6B8A62] hover:bg-[#5A7352] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6B8A62] transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#6B8A62] md:text-3xl">
            Reset Your Password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
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
              <Label htmlFor="newPassword">New Password</Label>
            </div>
            <div className="relative">
              <TextInput
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={() => setPasswordFocused(true)}
                value={formData.newPassword}
                icon={StyledLockIcon}
                placeholder="Enter your new password"
                color={errors.newPassword ? 'failure' : 'gray'}
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
              </button>
            </div>
            
            {formData.newPassword && passwordFocused && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}
            
            {errors.newPassword && (
              <p className="text-xs text-red-600 mt-1" role="alert">
                {errors.newPassword}
              </p>
            )}
            {!errors.newPassword && formData.newPassword && (
              <p className="text-xs text-gray-500 mt-1">
                Password must contain at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
            </div>
            <div className="relative">
              <TextInput
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                onChange={handleChange}
                onBlur={handleBlur}
                value={formData.confirmPassword}
                icon={StyledLockIcon}
                placeholder="Confirm your new password"
                color={errors.confirmPassword ? 'failure' : 'gray'}
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1" role="alert">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !token || !email}
            className="mt-4 w-full bg-[#6B8A62] text-white py-3 px-6 rounded-lg hover:bg-[#5A7352] focus:outline-none focus:ring-2 focus:ring-[#6B8A62] transition-all cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" light />
                Resetting Password...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>

          <p className="text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link to={APP_ROUTES.login} className="text-[#6B8A62] hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
