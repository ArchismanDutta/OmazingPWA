/**
 * Navigation utilities for role-based routing
 */

export const getDefaultRouteForUser = (user) => {
  if (!user) return '/login';

  // Admin and manager users go to admin panel
  // if (user.role === 'admin' || user.role === 'manager') {
  //   return '/admin';
  // }

  // Regular users go to dashboard
  return '/dashboard';
};

export const getUserRoleDisplayName = (role) => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'manager':
      return 'Manager';
    case 'user':
      return 'User';
    default:
      return 'User';
  }
};

export const isAdminUser = (user) => {
  return user && (user.role === 'admin' || user.role === 'manager');
};

export const canAccessAdminRoutes = (user) => {
  return isAdminUser(user);
};

export const getNavMenuForUser = (user) => {
  if (!user) return [];

  const baseMenu = [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Content Library', path: '/content', icon: '🎵' },
    { label: 'Favorites', path: '/favorites', icon: '❤️' },
    { label: 'Recently Played', path: '/recently-played', icon: '⏰' },
    { label: 'Profile', path: '/profile', icon: '👤' },
  ];

  if (isAdminUser(user)) {
    return [
      { label: 'Admin Dashboard', path: '/admin/users', icon: '⚡' },
      { label: 'Manage Users', path: '/admin/users', icon: '👥' },
      { label: 'Manage Content', path: '/admin/content', icon: '📁' },
      { label: 'Analytics', path: '/admin/analytics', icon: '📊' },
      {
        label: 'User Panel',
        path: '/dashboard',
        icon: '👤',
        description: 'Switch to user view'
      },
    ];
  }

  return baseMenu;
};

export const getBreadcrumbsForRoute = (path, user) => {
  const breadcrumbs = [
    { label: 'Home', href: getDefaultRouteForUser(user) }
  ];

  switch (path) {
    case '/admin':
      breadcrumbs.push({ label: 'Admin Dashboard' });
      break;
    case '/admin/users':
      breadcrumbs.push(
        { label: 'Admin', href: '/admin' },
        { label: 'User Management' }
      );
      break;
    case '/admin/content':
      breadcrumbs.push(
        { label: 'Admin', href: '/admin' },
        { label: 'Content Management' }
      );
      break;
    case '/admin/analytics':
      breadcrumbs.push(
        { label: 'Admin', href: '/admin' },
        { label: 'Analytics' }
      );
      break;
    case '/dashboard':
      breadcrumbs.push({ label: 'Dashboard' });
      break;
    case '/content':
      breadcrumbs.push({ label: 'Content Library' });
      break;
    case '/favorites':
      breadcrumbs.push({ label: 'Favorites' });
      break;
    case '/recently-played':
      breadcrumbs.push({ label: 'Recently Played' });
      break;
    case '/profile':
      breadcrumbs.push({ label: 'Profile' });
      break;
    default:
      break;
  }

  return breadcrumbs;
};