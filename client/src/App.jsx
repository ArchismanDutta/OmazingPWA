import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import RecentlyPlayed from './pages/RecentlyPlayed';
import Courses from './pages/Courses';
import MyCourses from './pages/MyCourses';
import CourseDetail from './pages/CourseDetail';
import LessonView from './pages/LessonView';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminCourseNew from './pages/admin/AdminCourseNew';
import AdminCourseEdit from './pages/admin/AdminCourseEdit';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminVideos from './pages/admin/AdminVideos';
import AdminContent from './pages/admin/AdminContent';
import ContentLibrary from './pages/ContentLibrary';
import ContentDetail from './pages/ContentDetail';
import MediaPlayerDebug from './components/media/MediaPlayerDebug';
import { getDefaultRouteForUser } from './utils/navigation';

// Import the new MeditationGoal page
import MeditationGoal from './pages/MeditationGoal';

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  const getDefaultRoute = () => {
    if (!isAuthenticated || !user) return "/login";
    return getDefaultRouteForUser(user);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Navigate to="/onboarding" replace />
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Login />
          }
        />
        <Route
          path="/onboarding"
          element={
            isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Onboarding />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Register />
          }
        />

        {/* New Meditation Goal page */}
        <Route
          path="/meditation-goal"
          element={
            <ProtectedRoute>
              <MeditationGoal />
            </ProtectedRoute>
          }
        />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favorites"
        element={<Favorites />}
      />
      <Route
        path="/recently-played"
        element={<RecentlyPlayed />}
      />
      <Route
        path="/courses"
        element={<Courses />}
      />
      <Route
        path="/my-courses"
        element={
          <ProtectedRoute>
            <MyCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id"
        element={<CourseDetail />}
      />
      <Route
        path="/courses/:courseId/lessons/:lessonId"
        element={<LessonView />}
      />
      <Route
        path="/content"
        element={<ContentLibrary />}
      />
      <Route
        path="/content/:id"
        element={<ContentDetail />}
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute adminOnly>
            <AdminCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/new"
        element={
          <ProtectedRoute adminOnly>
            <AdminCourseNew />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:id"
        element={
          <ProtectedRoute adminOnly>
            <AdminCourseEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute adminOnly>
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/videos"
        element={
          <ProtectedRoute adminOnly>
            <AdminVideos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/content"
        element={
          <ProtectedRoute adminOnly>
            <AdminContent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/debug/media"
        element={<MediaPlayerDebug />}
      />
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h1>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </div>
          </div>
        }
      />
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
              <p className="text-gray-600">The page you're looking for doesn't exist.</p>
            </div>
          </div>
        }
      />
      </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
