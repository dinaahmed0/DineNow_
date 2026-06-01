import { Link, useNavigate, useLocation } from 'react-router-dom';
import { APP_ROUTES } from '../../constants/routes';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaChevronDown, FaSignOutAlt, FaSpinner } from 'react-icons/fa';
import { isManager, isStaff, isSuperAdmin } from '../../lib/user-roles';
import logo from '../../assets/logo.png';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    setTimeout(() => {
      logout();
      setShowLogoutModal(false);
      setIsProfileDropdownOpen(false);
      setIsLoggingOut(false);
      navigate(APP_ROUTES.login);
    }, 1000);
  };

  const capitalizeName = (name?: string) => {
  if (!name) return 'John Doe';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

  const isActive = (path: string) => location.pathname === path;

  const token = user?.token ?? '';
  const showSuperAdmin = isAuthenticated && isSuperAdmin(token);
  const showManager = isAuthenticated && isManager(token);
  const showStaff = isAuthenticated && isStaff(token);

  return (
    <nav className="bg-white fixed w-full z-100 top-0 start-0 border-b border-gray-200">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo/Brand and Location */}
        <div className="flex items-center space-x-4">
          <Link to={APP_ROUTES.home} className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src={logo} alt="Logo" className='w-30'/>
          </Link>
        </div>

        {/* Right side - Auth buttons & Mobile menu button */}
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#6B8A62] md:p-0 transition-all duration-200 cursor-pointer"
              >
                <FaUser className="text-sm" />
                <h2 className=" text-gray-900">
                  {capitalizeName(user?.displayName)}
                </h2>
                <FaChevronDown className="text-xs" />
              </button>
              
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    to={APP_ROUTES.profile}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#6B8A62]/10"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to={APP_ROUTES.myReservations}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#6B8A62]/10"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    My Reservations
                  </Link>
                  <Link
                    to={APP_ROUTES.favorites}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#6B8A62]/10"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    Favorites
                  </Link>
                  {showSuperAdmin && (
                    <Link
                      to={APP_ROUTES.superAdmin}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#6B8A62]/10"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Super Admin
                    </Link>
                  )}
                  {showManager && (
                    <Link
                      to={APP_ROUTES.managerDashboard}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#6B8A62]/10"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Manager dashboard
                    </Link>
                  )}
                  {showStaff && (
                    <Link
                      to={APP_ROUTES.staffDashboard}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#6B8A62]/10"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Staff desk
                    </Link>
                  )}
                  <hr className="my-1" />
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-all duration-200 cursor-pointer"
                  >
                    <FaSignOutAlt className="text-red-500" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white">
              <li>
                <Link
                  to={APP_ROUTES.signup}
                  className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#6B8A62] md:p-0"
                >
                  SignUp
                </Link>
              </li>
            </ul>
          )}

          {/* Logout Modal - Keep it open while spinner shows */}
          {showLogoutModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 backdrop-blur-md bg-black/30" />

              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <FaSignOutAlt className="text-red-600 text-2xl" />
                  </div>
                </div>
                
                <h3 className="text-center text-xl font-semibold text-gray-900 mb-2">
                  {isLoggingOut ? "Logging out..." : "Ready to leave?"}
                </h3>
                <p className="text-center text-gray-500 mb-6">
                  {isLoggingOut 
                    ? "Please wait while we log you out..." 
                    : "You'll need to log back in to access your profile and reservations."}
                </p>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    disabled={isLoggingOut}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? "Can't cancel" : "Stay Logged In"}
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
                  >
                    {isLoggingOut ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      'Logout'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="navbar-sticky"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
        </div>

        {/* Navigation Links - Desktop & Mobile */}
        <div
          className={`${isMenuOpen ? 'block' : 'hidden'} items-center justify-between w-full md:flex md:w-auto md:order-1`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white">
            <li>
              <Link
                to={APP_ROUTES.home}
                className={`block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#6B8A62] md:p-0 transition-all duration-200 ${
                  isActive(APP_ROUTES.home) 
                    ? 'text-[#6B8A62] underline decoration-[#6B8A62] underline-offset-8 decoration-1' 
                    : 'text-gray-900'
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to={APP_ROUTES.spots}
                className={`block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#6B8A62] md:p-0 transition-all duration-200 ${
                  isActive(APP_ROUTES.spots) 
                    ? 'text-[#6B8A62] underline decoration-[#6B8A62] underline-offset-8 decoration-1' 
                    : 'text-gray-900'
                }`}
              >
                Spots
              </Link>
            </li>
            <li>
              <Link
                to={APP_ROUTES.about}
                className={`block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#6B8A62] md:p-0 transition-all duration-200 ${
                  isActive(APP_ROUTES.about) 
                    ? 'text-[#6B8A62] underline decoration-[#6B8A62] underline-offset-8 decoration-1' 
                    : 'text-gray-900'
                }`}
              >
                About Us
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}