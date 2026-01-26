import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './store/AuthContext';

// Temporary Dashboard Component
const Dashboard = () => (
  <Layout>
    <div className="py-8">
      <h1 className="text-4xl font-black mb-8">Discover Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-morphism rounded-radius-lg overflow-hidden group cursor-pointer hover:border-primary/50 transition-all shadow-xl hover:shadow-primary/10">
            <div className="h-48 bg-surface-alt relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-primary px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-white">Music</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Amazing Summer Festival {i}</h3>
              <p className="text-text-dim text-sm mb-4 line-clamp-2">A wonderful celebration of music, art, and local culture. Don't miss out on this incredible experience.</p>
              <div className="flex items-center justify-between text-xs font-semibold text-text/60">
                <span>July 24, 2026</span>
                <span>$45.00</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Layout>
);

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route
        path="/"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
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
