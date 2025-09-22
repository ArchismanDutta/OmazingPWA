import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDefaultRouteForUser } from '../../utils/navigation';

const RoleBasedRedirect = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const currentPath = window.location.pathname;
      const defaultRoute = getDefaultRouteForUser(user);

      // If on root path, redirect to appropriate dashboard
      if (currentPath === '/') {
        navigate(defaultRoute, { replace: true });
      }

      // If admin trying to access regular user routes, allow but inform
      if (user.role === 'admin' && currentPath === '/dashboard') {
        console.log('Admin user accessing user dashboard');
      }

      // If regular user trying to access admin routes, they'll be blocked by ProtectedRoute
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  return children;
};

export default RoleBasedRedirect;