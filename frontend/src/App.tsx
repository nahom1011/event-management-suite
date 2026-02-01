import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SignupConfirmationPage from './pages/SignupConfirmationPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import Dashboard from './pages/Dashboard';
import EventDetailPage from './pages/EventDetailPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AttendeeListPage from './pages/AttendeeListPage';
import CreateEventPage from './pages/CreateEventPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import { AuthProvider, useAuth } from './store/AuthContext';

const AppRoutes = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin';
  const isOrganizer = user?.role === 'organizer';

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/signup" element={!isAuthenticated ? <SignupPage /> : <Navigate to="/" />} />
      <Route path="/signup-confirmation" element={<SignupConfirmationPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      <Route
        path="/"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/events/:id"
        element={isAuthenticated ? <EventDetailPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/payment/success"
        element={isAuthenticated ? <PaymentSuccessPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/payment/cancel"
        element={isAuthenticated ? <PaymentCancelPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/orders"
        element={isAuthenticated ? <OrdersPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/profile"
        element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
      />

      {/* Organizer routes */}
      <Route
        path="/organizer"
        element={isAuthenticated && isOrganizer ? <OrganizerDashboard /> : <Navigate to="/" />}
      />
      <Route
        path="/organizer/events/:id/attendees"
        element={isAuthenticated && isOrganizer ? <AttendeeListPage /> : <Navigate to="/" />}
      />
      <Route
        path="/events/create"
        element={isAuthenticated && isOrganizer ? <CreateEventPage /> : <Navigate to="/" />}
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={isAuthenticated && isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
      />

      {/* Super Admin routes */}
      <Route
        path="/super-admin"
        element={isAuthenticated && isSuperAdmin ? <SuperAdminDashboard /> : <Navigate to="/" />}
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
