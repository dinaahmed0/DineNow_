import { useState, type ChangeEvent, type FormEvent, useCallback, useMemo } from 'react';
import { Card, Label, TextInput, Checkbox, Alert, Spinner } from 'flowbite-react';
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { registerUser } from '../../services/auth';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

const APP_ROUTES = {
  login: '/login',
  home: '/'
};

const validationSchema = yup.object({
  fullName: yup.string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]*$/, 'Full name can only contain letters and spaces'),
  email: yup.string()
    .required('Email is required')
    .email('Invalid email address'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])/, 'Must contain lowercase letter')
    .matches(/^(?=.*[A-Z])/, 'Must contain uppercase letter')
    .matches(/^(?=.*\d)/, 'Must contain a number')
    .matches(/^(?=.*[@$!%*?&])/, 'Must contain special character (@$!%*?&)'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  agreeTerms: yup.boolean()
    .oneOf([true], 'You must agree to the terms')
});

// Custom Modal Component
const CustomModal = ({ show, onClose, title, children }: { show: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl  overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {children}
        </div>
        <div className="flex justify-end p-2 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-1 bg-[#6B8A62] text-white rounded-lg hover:bg-[#5A7352] transition-colors font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Signup() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "", email: "", password: "", confirmPassword: "", agreeTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Modal states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    const password = formData.password;
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
    return strengthMap[Math.min(score, 5)] ?? strengthMap[0];
  }, [formData.password]);

  const validateField = useCallback(async (name: string, value: unknown) => {
    try {
      const fieldSchema = yup.reach(validationSchema, name) as yup.AnySchema;
      await fieldSchema.validate(value);
      setErrors(prev => ({ ...prev, [name]: '' }));
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setErrors(prev => ({ ...prev, [name]: error.message }));
      }
      return false;
    }
  }, []);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    setSubmitError(null);
    
    if (touched[name]) validateField(name, newValue);
  }, [touched, validateField]);

  const handleBlur = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const currentValue = type === 'checkbox' ? checked : value;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, currentValue);
  }, [validateField]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);
    
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      
      const response = await registerUser({
        displayName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      
      if (response.succeeded) {
        alert(response.message || "Registration successful! Please check your email to confirm your account.");
        navigate('/confirm-email', { state: { email: formData.email } });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const newErrors: Record<string, string> = {};
        error.inner.forEach(err => {
          if (err.path) newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        setSubmitError(error instanceof Error ? error.message : 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getError = (field: string) => touched[field] && errors[field];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      {/* Terms Modal */}
      <CustomModal show={showTermsModal} onClose={() => setShowTermsModal(false)} title="Terms & Conditions">
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h3>
            <p className="text-sm">By accessing or using DineNow, you confirm that you agree to comply with these Terms & Conditions. If you do not agree, please do not use the application.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2. User Accounts</h3>
            <p className="text-sm">Users may be required to create an account to access certain features. You are responsible for maintaining the confidentiality of your account information and password.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Reservations & Bookings</h3>
            <p className="text-sm">DineNow allows users to browse restaurants and make reservations. Reservation availability depends on restaurant capacity and confirmation.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">4. User Responsibilities</h3>
            <p className="text-sm">Users agree to:</p>
            <ul className="list-disc list-inside text-sm ml-2">
              <li>Provide accurate information.</li>
              <li>Use the app respectfully and legally.</li>
              <li>Avoid misuse, unauthorized access, or harmful activity within the application.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">5. Privacy</h3>
            <p className="text-sm">Your personal information is handled securely and used only to improve your experience within the application.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">6. Intellectual Property</h3>
            <p className="text-sm">All logos, designs, content, and branding within DineNow are protected and may not be copied or reused without permission.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">7. Limitation of Liability</h3>
            <p className="text-sm">DineNow is not responsible for restaurant service quality, booking errors caused by third parties, or interruptions beyond our control.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">8. Changes to Terms</h3>
            <p className="text-sm">We may update these Terms & Conditions at any time. Continued use of the app means you accept any updates.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">9. Contact</h3>
            <p className="text-sm">If you have questions regarding these Terms & Conditions, please contact the DineNow support team.</p>
          </div>
        </div>
      </CustomModal>

      {/* Privacy Modal */}
      <CustomModal show={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title="Privacy Policy">
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Information We Collect</h3>
            <p className="text-sm">We collect information you provide directly to us, such as your name, email address, and reservation details. We also automatically collect usage data when you use our app.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How We Use Your Information</h3>
            <p className="text-sm">We use your information to process reservations, improve our services, communicate with you, and personalize your experience.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Information Sharing</h3>
            <p className="text-sm">We do not sell your personal information. We may share information with restaurants to facilitate your reservations, with service providers who assist us, or as required by law.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Security</h3>
            <p className="text-sm">We implement security measures to protect your information, including encryption and secure data storage.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Rights</h3>
            <p className="text-sm">You may access, correct, or delete your personal information by contacting our support team.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookies</h3>
            <p className="text-sm">We use cookies and similar technologies to enhance your experience and analyze usage patterns.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Updates to This Policy</h3>
            <p className="text-sm">We may update this policy periodically. Continued use of the app constitutes acceptance of any changes.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Us</h3>
            <p className="text-sm">For questions about this Privacy Policy, please contact our support team at privacy@dinenow.com</p>
          </div>
        </div>
      </CustomModal>
      
      <Card className="w-full max-w-md shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#6B8A62]">Create an account</h1>
          <p className="mt-2 text-sm text-gray-600">Join us to get started with amazing features</p>
        </div>

        {submitError && (
          <Alert color="failure" onDismiss={() => setSubmitError(null)}>
            <span className="font-medium">Error!</span> {submitError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <TextInput
              id="fullName" name="fullName" icon={HiUser} placeholder="Enter your full name"
              value={formData.fullName} onChange={handleChange} onBlur={handleBlur}
              color={getError('fullName') ? 'failure' : 'gray'} disabled={isSubmitting}
            />
            {getError('fullName') && <p className="text-xs text-red-600 mt-1">{getError('fullName')}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email Address</Label>
            <TextInput
              id="email" name="email" type="email" icon={HiMail} placeholder="name@example.com"
              value={formData.email} onChange={handleChange} onBlur={handleBlur}
              color={getError('email') ? 'failure' : 'gray'} disabled={isSubmitting}
            />
            {getError('email') && <p className="text-xs text-red-600 mt-1">{getError('email')}</p>}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <TextInput
                id="password" name="password" type={showPassword ? "text" : "password"}
                icon={HiLockClosed} placeholder="Create a strong password"
                value={formData.password} onChange={handleChange} onBlur={handleBlur}
                onFocus={() => setPasswordFocused(true)}
                color={getError('password') ? 'failure' : 'gray'} disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
              </button>
            </div>
            
            {formData.password && passwordFocused && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.color} transition-all`} 
                         style={{ width: `${(passwordStrength.score / 5) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium">{passwordStrength.label}</span>
                </div>
              </div>
            )}
            {getError('password') && <p className="text-xs text-red-600 mt-1">{getError('password')}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <TextInput
                id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"}
                icon={HiLockClosed} placeholder="Confirm your password"
                value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                color={getError('confirmPassword') ? 'failure' : 'gray'} disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <HiEye size={20} /> : <HiEyeOff size={20} />}
              </button>
            </div>
            {getError('confirmPassword') && <p className="text-xs text-red-600 mt-1">{getError('confirmPassword')}</p>}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <Checkbox id="agreeTerms" name="agreeTerms" checked={formData.agreeTerms}
                      onChange={handleChange} onBlur={handleBlur} disabled={isSubmitting} />
            <Label htmlFor="agreeTerms" className="text-sm">
              I agree to the{' '}
              <button 
                type="button"
                onClick={() => setShowTermsModal(true)} 
                className="text-[#6B8A62] hover:underline focus:outline-none"
              >
                Terms and Conditions
              </button>
              {/* {' and '} */}
              {/* <button 
                type="button"
                onClick={() => setShowPrivacyModal(true)} 
                className="text-[#6B8A62] hover:underline focus:outline-none"
              >
                Privacy Policy
              </button> */}
            </Label>
          </div>
          {getError('agreeTerms') && <p className="text-xs text-red-600">{getError('agreeTerms')}</p>}

          {/* Submit Button */}
          <button type="submit" disabled={isSubmitting}
            className="mt-4 w-full bg-gradient-to-r from-[#6B8A62] to-[#5A7352] text-white py-3 px-6 rounded-lg hover:from-[#5A7352] hover:to-[#4A5C42] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" light /> Creating Account...
              </span>
            ) : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account? <Link to={APP_ROUTES.login} className="text-[#6B8A62] hover:underline">Log in</Link>
          </p>
          <p className="text-center text-sm text-gray-600">
            Continue as a guest? <Link to={APP_ROUTES.home} className="text-[#6B8A62] hover:underline">Yes</Link>
          </p>
        </form>
      </Card>
    </div>
  );
}