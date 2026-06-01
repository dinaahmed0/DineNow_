import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMail, HiLockClosed, HiUser, HiKey } from 'react-icons/hi';
import { FaSpinner } from 'react-icons/fa';
import { registerStaff } from '../../services/auth';
import { APP_ROUTES } from '../../constants/routes';

export default function StaffRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await registerStaff({
        displayName: form.displayName.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        code: form.code.trim(),
      });

      if (!response.succeeded) {
        throw new Error(response.message || response.errors?.[0] || 'Registration failed');
      }

      setSuccess(response.message || 'Account created. You can sign in now.');
      setTimeout(() => navigate(APP_ROUTES.login), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 pt-24 pb-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#6B8A62] bg-[#6B8A62]/10 px-3 py-1 rounded-full mb-3">
            Staff onboarding
          </span>
          <h1 className="text-3xl font-bold text-gray-900">Join as staff</h1>
          <p className="text-gray-500 text-sm mt-2">
            Use the invitation code from your manager&apos;s email to complete registration.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 space-y-4"
        >
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm border border-emerald-100">
              {success}
            </div>
          )}

          <Field
            icon={<HiUser className="text-gray-400" />}
            label="Full name"
            value={form.displayName}
            onChange={(v) => setForm({ ...form, displayName: v })}
            required
          />
          <Field
            icon={<HiMail className="text-gray-400" />}
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            required
          />
          <Field
            icon={<HiKey className="text-gray-400" />}
            label="Invitation code"
            value={form.code}
            onChange={(v) => setForm({ ...form, code: v })}
            required
            placeholder="From your invite email"
          />
          <Field
            icon={<HiLockClosed className="text-gray-400" />}
            label="Password"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            required
          />
          <Field
            icon={<HiLockClosed className="text-gray-400" />}
            label="Confirm password"
            type="password"
            value={form.confirmPassword}
            onChange={(v) => setForm({ ...form, confirmPassword: v })}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#6B8A62] text-white rounded-xl font-medium hover:bg-[#5A7352] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <FaSpinner className="animate-spin" />}
            Create staff account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to={APP_ROUTES.login} className="text-[#6B8A62] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  icon,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  icon?: React.ReactNode;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          className={`w-full py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6B8A62] focus:border-[#6B8A62] ${
            icon ? 'pl-10 pr-3' : 'px-3'
          }`}
        />
      </div>
    </div>
  );
}
