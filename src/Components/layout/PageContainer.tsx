import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../navbar/Navbar';

export default function PageContainer() {
  const location = useLocation();
  
  // Routes that SHOULD show the navbar (whitelist)
  const navbarRoutes = ['/', '/spots', '/about'];
  const shouldShowNavbar = navbarRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col">
      {shouldShowNavbar && <Navbar />}
      <main className={`flex-grow ${shouldShowNavbar ? 'pt-16' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}

