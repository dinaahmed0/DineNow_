import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaExclamationTriangle, FaRedo, FaEnvelope } from 'react-icons/fa';
import { verifyEmail, resendOtp } from '../../services/auth';

export default function EmailConfirmation() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'expired'>('idle');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || new URLSearchParams(location.search).get('email');

  // Auto-focus first input on mount
  useEffect(() => {
    if (status === 'idle') {
      document.getElementById('code-input-0')?.focus();
    }
  }, [status]);

  // Handle redirect after success
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (status === 'success') {
      timeoutId = setTimeout(() => navigate('/login'), 2000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [status, navigate]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numbers = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (numbers) {
      const newCode = [...code];
      for (let i = 0; i < numbers.length; i++) {
        newCode[i] = numbers[i];
      }
      setCode(newCode);
      
      // Focus the next empty input or last one
      const nextEmptyIndex = newCode.findIndex(c => !c);
      if (nextEmptyIndex !== -1) {
        document.getElementById(`code-input-${nextEmptyIndex}`)?.focus();
      }
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setMessage('Please enter the 6-digit verification code');
      return;
    }

    if (!email) {
      setMessage('Email address not found. Please sign up again.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const data = await verifyEmail({
        email: email,
        otp: fullCode
      });

      if (data.succeeded) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully! You can now log in.');
        // Removed auto-login - user will be redirected to login page after 2 seconds
      } else {
        // Handle different error responses
        const errorMessage = data.message || 'Invalid verification code. Please try again.';
        
        if (errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('expir')) {
          setStatus('expired');
          setMessage('Your verification code has expired. Please request a new one.');
        } else {
          setStatus('error');
          setMessage(errorMessage);
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Unable to verify email. Please check your connection and try again.');
    }
  };

  const resendCode = async () => {
    if (!email) {
      setMessage('Email address not found.');
      return;
    }
    
    setIsResending(true);
    setMessage('');
    
    try {
      const data = await resendOtp({ email });

      if (data.succeeded) {
        setMessage('✓ New verification code sent to your email!');
        setCode(['', '', '', '', '', '']);
        document.getElementById('code-input-0')?.focus();
        setStatus('idle');
      } else {
        setMessage(data.message || 'Failed to resend verification code.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setMessage('An error occurred. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#6B8A62]">DineNow</h1>
            <p className="text-gray-600 mt-2">Verify Your Email</p>
          </div>

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-[#6B8A62]/10 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-[#6B8A62] text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Email Verified!
                </h2>
                <p className="text-gray-600">{message}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Redirecting you to login page...
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-4 bg-[#6B8A62] hover:bg-[#5A7352] text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Go to Login Now
                </button>
              </div>
            </div>
          )}

          {/* Idle or Loading State - Show Code Input */}
          {(status === 'idle' || status === 'loading') && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-[#6B8A62]/10 rounded-full flex items-center justify-center mb-4">
                  <FaEnvelope className="text-[#6B8A62] text-2xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Check Your Email
                </h2>
                <p className="text-gray-600">
                  We've sent a 6-digit verification code to
                </p>
                <p className="text-gray-800 font-medium mt-1">
                  {email || 'your email address'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Valid for 5 minutes
                </p>
              </div>

              {/* 6-Digit Code Input */}
              <div className="space-y-4">
                <div 
                  className="flex justify-center gap-2"
                  onPaste={handlePaste}
                >
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-input-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-2xl font-semibold border-2 border-gray-200 rounded-lg focus:border-[#6B8A62] focus:ring-2 focus:ring-[#6B8A62]/20 outline-none transition-all"
                    />
                  ))}
                </div>

                {message && (
                  <p className={`text-center text-sm ${
                    message.includes('Invalid') || message.includes('expired') ? 'text-red-600' : 'text-[#6B8A62]'
                  }`}>
                    {message}
                  </p>
                )}

                {status === 'loading' && (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#6B8A62]"></div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={status === 'loading' || code.some(d => !d)}
                  className="w-full bg-[#6B8A62] hover:bg-[#5A7352] disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {status === 'loading' ? 'Verifying...' : 'Verify Email'}
                </button>
              </div>
            </div>
          )}

          {/* Expired State */}
          {status === 'expired' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-yellow-600 text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Code Expired
                </h2>
                <p className="text-gray-600 mb-4">{message || 'Your verification code has expired.'}</p>
                <button
                  onClick={resendCode}
                  disabled={isResending}
                  className="bg-[#6B8A62] hover:bg-[#5A7352] disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  <FaRedo className={isResending ? 'animate-spin' : ''} />
                  {isResending ? 'Sending...' : 'Send New Code'}
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-red-600 text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <button
                  onClick={() => {
                    setStatus('idle');
                    setCode(['', '', '', '', '', '']);
                    setMessage('');
                  }}
                  className="bg-[#6B8A62] hover:bg-[#5A7352] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Help Section - Only show in idle/expired states */}
          {(status === 'idle' || status === 'expired') && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">
                  Didn't receive the code? Check your spam folder
                </p>
                <button
                  onClick={resendCode}
                  disabled={isResending}
                  className="text-[#6B8A62] hover:text-[#5A7352] text-sm font-medium disabled:text-gray-400"
                >
                  {isResending ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <a href="/help" className="text-sm text-gray-500 hover:text-[#6B8A62]">
                  Need help? Contact Support
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}