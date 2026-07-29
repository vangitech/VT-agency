import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminSidebar from './components/layout/AdminSidebar';
import CookieConsent from './components/CookieConsent';
import ErrorBoundary from './components/ErrorBoundary';
import useInactivityTimeout from './hooks/useInactivityTimeout';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const QuoteRequest = lazy(() => import('./pages/QuoteRequest'));
const Projects = lazy(() => import('./pages/Projects'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const StaticPage = lazy(() => import('./pages/StaticPage'));
const Login = lazy(() => import('./pages/admin/Login'));
const ForgotPassword = lazy(() => import('./pages/admin/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/admin/ResetPassword'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const HeroManager = lazy(() => import('./pages/admin/HeroManager'));
const TestimonialManager = lazy(() => import('./pages/admin/TestimonialManager'));
const NewsManager = lazy(() => import('./pages/admin/NewsManager'));
const ClientManager = lazy(() => import('./pages/admin/ClientManager'));
const ProjectManager = lazy(() => import('./pages/admin/ProjectManager'));
const SettingsManager = lazy(() => import('./pages/admin/SettingsManager'));
const LegalPagesManager = lazy(() => import('./pages/admin/LegalPagesManager'));
const UserManager = lazy(() => import('./pages/admin/UserManager'));
const CRMManager = lazy(() => import('./pages/admin/CRMManager'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <PageLoader />;
  }
  if (!user) {
    return <Navigate to="/vaccess/login" replace />;
  }
  return children;
};

const AdminLayout = ({ children }) => {
  useInactivityTimeout();
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:pl-64 transition-all duration-200">
        <div className="min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
};

const PublicLayout = ({ children }) => (
  <div>
    <Header />
    <main className="pt-16 md:pt-20">{children}</main>
    <Footer />
  </div>
);

const LegalRoute = ({ slug }) => (
  <PublicLayout>
    <StaticPage slug={slug} />
  </PublicLayout>
);

const AppRoutes = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/vaccess');

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/quote" element={<PublicLayout><QuoteRequest /></PublicLayout>} />
        <Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
        
        <Route path="/vaccess/login" element={<Login />} />
        <Route path="/vaccess/forgot-password" element={<ForgotPassword />} />
        <Route path="/vaccess/reset-password/:token" element={<ResetPassword />} />
        
        <Route path="/news/:id" element={<PublicLayout><NewsDetail /></PublicLayout>} />
        
        <Route path="/privacy" element={<LegalRoute slug="privacy" />} />
        <Route path="/terms" element={<LegalRoute slug="terms" />} />
        <Route path="/faq" element={<LegalRoute slug="faq" />} />
        <Route path="/policy" element={<LegalRoute slug="policy" />} />
        
        <Route path="/vaccess/dashboard" element={
          <ProtectedRoute>
            <AdminLayout><Dashboard /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/vaccess/hero" element={
          <ProtectedRoute>
            <AdminLayout><HeroManager /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/vaccess/testimonials" element={
          <ProtectedRoute>
            <AdminLayout><TestimonialManager /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/vaccess/news" element={
          <ProtectedRoute>
            <AdminLayout><NewsManager /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/vaccess/clients" element={
          <ProtectedRoute>
            <AdminLayout><ClientManager /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/vaccess/projects" element={
          <ProtectedRoute>
            <AdminLayout><ProjectManager /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/vaccess/settings" element={
          <ProtectedRoute>
            <AdminLayout><SettingsManager /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/vaccess/legal" element={
          <ProtectedRoute>
            <AdminLayout><LegalPagesManager /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/vaccess/users" element={
          <ProtectedRoute>
            <AdminLayout><UserManager /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/vaccess/crm" element={
          <ProtectedRoute>
            <AdminLayout><CRMManager /></AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
      {!isAdmin && <CookieConsent />}
    </Suspense>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LoadingProvider>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </LoadingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
