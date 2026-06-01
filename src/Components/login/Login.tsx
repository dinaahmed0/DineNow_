import { useState } from 'react';
import { Card, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { HiMail, HiLockClosed } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../constants/routes';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const StyledMailIcon = () => <HiMail className="text-[#6B8A62]" />;
const StyledLockIcon = () => <HiLockClosed className="text-[#6B8A62]" />;

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.email || !formData.password) {
      setSubmitError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      await auth.login(formData.email.trim(), formData.password);

      navigate(APP_ROUTES.home, {
        state: { showWelcomeToast: true },
      });
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed. Please try again.';

      toast.error(errorMessage, {
        duration: 3000,
        position: 'top-center',
      });

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
            Login to your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your account
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
              <Label htmlFor="email">Email Address</Label>
            </div>
            <TextInput
              id="email"
              name="email"
              type="email"
              onChange={handleChange}
              value={formData.email}
              icon={StyledMailIcon}
              placeholder="name@example.com"
              style={{
                fontSize: '0.75rem', 
                color: '#828283', 
              }}
              required
            />
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="password">Password</Label>
            </div>
            <TextInput
              id="password"
              name="password"
              type="password"
              onChange={handleChange}
              value={formData.password}
              icon={StyledLockIcon}
              placeholder="********"
              style={{
                fontSize: '0.75rem', 
                color: '#828283', 
              }}
              required
            />
            <p className="mt-2 text-xs text-gray-500 ">
              Forgot your password?{' '}
              <Link to={APP_ROUTES.forgotPassword} className="text-[#6B8A62] hover:underline">
                Forget Password
              </Link>
            </p>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-2 w-full bg-gradient-to-r from-[#6B8A62] to-[#5A7352] text-white py-3 px-6 rounded-lg hover:from-[#5A7352] hover:to-[#4A5C42] focus:outline-none focus:ring-2 focus:ring-[#6B8A62] transition-all cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" light />
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>

          <p className="text-center text-sm text-gray-600 ">
            Don't have an account?{' '}
            <Link to={APP_ROUTES.signup} className="text-[#6B8A62] hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}