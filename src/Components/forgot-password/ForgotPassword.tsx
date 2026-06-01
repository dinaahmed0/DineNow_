import { useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../constants/routes';
import { Card, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { HiMail } from 'react-icons/hi';
import { forgotPassword } from '../../services/auth';

const StyledMailIcon = () => <HiMail className="text-[#6B8A62]" />;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    // Basic validation
    if (!email) {
      setSubmitError("Please enter your email address");
      return;
    }
    
    setIsLoading(true);

    try {
      await forgotPassword({ email });
      setIsSubmitted(true);

    } catch (error) {
      console.error("Password reset error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset link. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#6B8A62]/10 mb-4">
              <HiMail className="h-6 w-6 text-[#6B8A62]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Check your email
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              We've sent a password reset link to:
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {email}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Check your email and click the reset link to create a new password.
            </p>
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
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your email and we'll send you a reset link
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
              value={email}
              icon={StyledMailIcon}
              placeholder="name@example.com"
              style={{
                fontSize: '0.75rem', 
                color: '#828283', 
              }}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-2 w-full bg-gradient-to-r from-[#6B8A62] to-[#5A7352] text-white py-3 px-6 rounded-lg hover:from-[#5A7352] hover:to-[#4A5C42] focus:outline-none focus:ring-2 focus:ring-[#6B8A62] transition-all cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" light />
                Sending...
              </span>
            ) : (
              'Send Reset Link'
            )}
          </button>

          <div className="text-center">
            <Link
              to={APP_ROUTES.login}
              className="text-sm text-[#6B8A62] dark:text-[#6B8A62] hover:text-[#5A7352]"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}