import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button, Modal, ModalHeader, ModalBody, ModalFooter, TextInput, Label } from 'flowbite-react';
import Swal from 'sweetalert2';
import {
  FaUser,
  FaSignOutAlt,
  FaSpinner,
  FaEdit,
  FaUserCircle,
  FaBell,
  FaKey,
  FaCalendarAlt,
  FaUsers,
  FaChevronLeft,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { APP_ROUTES } from '../../constants/routes';
import { changePassword } from '../../services/auth';

interface LocalProfilePrefs {
  defaultGuests: number;
  emailReminders: boolean;
  smsReminders: boolean;
}

const DEFAULT_PREFS: LocalProfilePrefs = {
  defaultGuests: 2,
  emailReminders: true,
  smsReminders: false,
};

const PREFS_STORAGE_KEY = 'profilePreferences';

function capitalizeName(name: string): string {
  if (!name) return 'Guest';
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function loadLocalPrefs(email: string): LocalProfilePrefs {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const all = JSON.parse(raw) as Record<string, LocalProfilePrefs>;
    return { ...DEFAULT_PREFS, ...all[email] };
  } catch {
    return DEFAULT_PREFS;
  }
}

function saveLocalPrefs(email: string, prefs: LocalProfilePrefs): void {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, LocalProfilePrefs>) : {};
    all[email] = prefs;
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(all));
  } catch (error) {
    console.error('Failed to save profile preferences:', error);
  }
}

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState<LocalProfilePrefs>(DEFAULT_PREFS);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingPrefs, setEditingPrefs] = useState<LocalProfilePrefs>(DEFAULT_PREFS);

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user?.email) {
      const loaded = loadLocalPrefs(user.email);
      setPrefs(loaded);
      setEditingPrefs(loaded);
    }
  }, [user?.email]);

  const saveProfileChanges = () => {
    if (!user?.email) return;
    if (changingPassword) return; // don't close while a password request is in flight
    saveLocalPrefs(user.email, editingPrefs);
    setPrefs(editingPrefs);
    setIsEditingProfile(false);
    setShowPasswordSection(false);
    setPasswordData({ current: '', new: '', confirm: '' });
    Swal.fire('Saved', 'Your preferences were saved on this device.', 'success');
  };

  const handleInlinePasswordChange = async () => {
    if (!passwordData.current) {
      Swal.fire('Error', 'Please enter your current password.', 'error');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      Swal.fire('Error', 'New passwords do not match', 'error');
      return;
    }
    if (!PASSWORD_REGEX.test(passwordData.new)) {
      Swal.fire(
        'Error',
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&).',
        'error'
      );
      return;
    }

    setChangingPassword(true);
    try {
      const response = await changePassword({
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
        confirmPassword: passwordData.confirm,
      });

      if (response.succeeded) {
        Swal.fire('Success', response.message || 'Password changed successfully', 'success');
        setShowPasswordSection(false);
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        // Prefer the first specific error from the errors[] array, fall back to message
        const errorDetail =
          response.errors && response.errors.length > 0
            ? response.errors[0]
            : response.message || 'Failed to change password';
        Swal.fire('Error', errorDetail, 'error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      Swal.fire('Error', message, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    setShowLogoutModal(false);
    setIsLoggingOut(false);
    navigate(APP_ROUTES.login);
  };

  const closeEditModal = () => {
    setIsEditingProfile(false);
    setShowPasswordSection(false);
    setEditingPrefs(prefs);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#6B8A62]/10 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center shadow-lg">
          <FaUserCircle className="text-5xl text-[#6B8A62] mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Please sign in to view your profile.</p>
          <Button onClick={() => navigate(APP_ROUTES.login)} className="bg-[#6B8A62] hover:bg-[#5A7352] w-full">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  const displayName = capitalizeName(user.displayName ?? '');
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#6B8A62]/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.home)}
          className="inline-flex items-center gap-2 text-[#6B8A62] hover:text-[#5A7352] font-medium transition-colors mb-6"
        >
          <FaChevronLeft className="text-sm" />
          Back to Home
        </button>

        {/* Profile header */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg mb-8">
          <div className="h-32 sm:h-40 bg-gradient-to-r from-[#6B8A62] to-[#5A7352]" />
          <div className="relative px-6 pb-6 -mt-14 sm:-mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center shrink-0">
                <span className="text-2xl sm:text-3xl font-bold text-[#6B8A62]">{initials}</span>
              </div>
              <div className="flex-1 pb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{displayName}</h1>
                {/* <p className="text-gray-500 flex items-center gap-2 mt-1 text-sm sm:text-base">
                  <FaEnvelope className="text-[#6B8A62] shrink-0" />
                  {user.email}
                </p> */}
                <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-[#6B8A62] bg-[#6B8A62]/10 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6B8A62]" />
                  Active member
                </span>
              </div>
              <Button
                size="sm"
                className="bg-white text-[#6B8A62] border border-[#6B8A62]/30 hover:bg-[#6B8A62]/5 shrink-0 self-start sm:self-auto"
                onClick={() => {
                  setEditingPrefs(prefs);
                  setIsEditingProfile(true);
                }}
              >
                <FaEdit className="mr-2" />
                Edit profile
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account details */}
          <Card className="lg:col-span-2 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <FaUser className="text-[#6B8A62]" />
              Account
            </h2>
            <dl className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <dt className="text-sm text-gray-500">Display name</dt>
                <dd className="text-sm font-medium text-gray-900">{displayName}</dd>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-sm font-medium text-gray-900 truncate max-w-[60%] text-right">{user.email}</dd>
              </div>
            </dl>
          </Card>

          {/* Quick actions */}
          <Card className="shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick actions</h2>
            <div className="space-y-3">
              <Link
                to={APP_ROUTES.myReservations}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#6B8A62] text-white hover:bg-[#5A7352] transition-colors font-medium"
              >
                <FaCalendarAlt />
                My Reservations
              </Link>
              <Button
                color="light"
                className="w-full border border-gray-200"
                onClick={() => {
                  setEditingPrefs(prefs);
                  setIsEditingProfile(true);
                }}
              >
                <FaKey className="mr-2" />
                Preferences & Password
              </Button>
              <Button
                onClick={() => setShowLogoutModal(true)}
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
              >
                <FaSignOutAlt className="mr-2" />
                Log out
              </Button>
            </div>
          </Card>

          {/* Preferences summary */}
          <Card className="lg:col-span-3 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaBell className="text-[#6B8A62]" />
                Booking preferences
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingPrefs(prefs);
                  setIsEditingProfile(true);
                }}
                className="text-sm text-[#6B8A62] hover:text-[#5A7352] font-medium"
              >
                Edit
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">Saved on this device for quicker booking.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-[#6B8A62] mb-1">
                  <FaUsers className="text-sm" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Default guests</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{prefs.defaultGuests}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-[#6B8A62] mb-1">
                  <FaBell className="text-sm" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email reminders</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{prefs.emailReminders ? 'On' : 'Off'}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                <div className="flex items-center gap-2 text-[#6B8A62] mb-1">
                  <FaBell className="text-sm" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">SMS reminders</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{prefs.smsReminders ? 'On' : 'Off'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal show={isEditingProfile} onClose={closeEditModal} size="lg">
        <ModalHeader>Edit profile</ModalHeader>
        <ModalBody>
          <div className="space-y-5">
            <div>
              <Label htmlFor="guests">Default number of guests</Label>
              <select
                id="guests"
                value={editingPrefs.defaultGuests}
                onChange={(e) =>
                  setEditingPrefs({
                    ...editingPrefs,
                    defaultGuests: parseInt(e.target.value, 10),
                  })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-[#6B8A62] focus:ring-[#6B8A62]"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Notification preferences</Label>
              <div className="space-y-2 mt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPrefs.emailReminders}
                    onChange={(e) =>
                      setEditingPrefs({ ...editingPrefs, emailReminders: e.target.checked })
                    }
                    className="w-4 h-4 text-[#6B8A62] rounded focus:ring-[#6B8A62]"
                  />
                  <span className="text-gray-700">Email reminders</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPrefs.smsReminders}
                    onChange={(e) =>
                      setEditingPrefs({ ...editingPrefs, smsReminders: e.target.checked })
                    }
                    className="w-4 h-4 text-[#6B8A62] rounded focus:ring-[#6B8A62]"
                  />
                  <span className="text-gray-700">SMS reminders</span>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 my-2" />

            <Button
              type="button"
              color="light"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="w-full border border-gray-300"
            >
              <FaKey className="mr-2" />
              {showPasswordSection ? 'Hide' : 'Change password'}
            </Button>

            {showPasswordSection && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800">Update password</h4>
                <div>
                  <Label htmlFor="current-password">Current password</Label>
                  <TextInput
                    id="current-password"
                    type="password"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">New password</Label>
                  <TextInput
                    id="new-password"
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <TextInput
                    id="confirm-password"
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirm: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleInlinePasswordChange}
                  disabled={changingPassword}
                  className="bg-[#6B8A62] hover:bg-[#5A7352] w-full"
                >
                  {changingPassword ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> Updating...
                    </>
                  ) : (
                    'Update password'
                  )}
                </Button>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={saveProfileChanges} disabled={changingPassword} className="bg-[#6B8A62] hover:bg-[#5A7352]">
            Save preferences
          </Button>
          <Button color="gray" onClick={closeEditModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 backdrop-blur-md bg-black/30" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FaSignOutAlt className="text-red-600 text-2xl" />
              </div>
            </div>
            <h3 className="text-center text-xl font-semibold text-gray-900 mb-2">
              {isLoggingOut ? 'Logging out...' : 'Ready to leave?'}
            </h3>
            <p className="text-center text-gray-500 mb-6">
              You will need to sign in again to access your account.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Stay signed in
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2 min-w-[120px] justify-center"
              >
                {isLoggingOut ? (
                  <>
                    <FaSpinner className="animate-spin" /> Logging out...
                  </>
                ) : (
                  'Log out'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
