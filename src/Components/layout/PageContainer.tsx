import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../navbar/Navbar';

export default function PageContainer() {
  const location = useLocation();
  
  // Routes that should hide the navbar
  const authRoutes = ['/login', '/signup', '/forgotPassword', '/resetPassword', '/reservation', '/profile'];
  const shouldHideNavbar = authRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {!shouldHideNavbar && <Navbar />}
      <main className={`flex-grow ${shouldHideNavbar ? '' : 'pt-16'}`}>
        <Outlet />
      </main>
    </div>
  );
}

