import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminSidebar from './components/layout/AdminSidebar';
import CookieConsent from './components/CookieConsent';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import QuoteRequest from './pages/QuoteRequest';
import Projects from './pages/Projects';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import NewsDetail from './pages/NewsDetail';
import StaticPage from './pages/StaticPage';
import HeroManager from './pages/admin/HeroManager';
import TestimonialManager from './pages/admin/TestimonialManager';
import NewsManager from './pages/admin/NewsManager';
import ClientManager from './pages/admin/ClientManager';
import ProjectManager from './pages/admin/ProjectManager';
import SettingsManager from './pages/admin/SettingsManager';
import LegalPagesManager from './pages/admin/LegalPagesManager';
import UserManager from './pages/admin/UserManager';
import CRMManager from './pages/admin/CRMManager';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const AdminLayout = ({ children }) => {
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
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <Routes>
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/quote" element={<PublicLayout><QuoteRequest /></PublicLayout>} />
        <Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
        
        <Route path="/admin/login" element={<Login />} />
        
        <Route path="/news/:id" element={<PublicLayout><NewsDetail /></PublicLayout>} />
        
        <Route path="/privacy" element={<LegalRoute slug="privacy" />} />
        <Route path="/terms" element={<LegalRoute slug="terms" />} />
        <Route path="/faq" element={<LegalRoute slug="faq" />} />
        <Route path="/policy" element={<LegalRoute slug="policy" />} />
        
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminLayout><Dashboard /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/hero" element={
          <ProtectedRoute>
            <AdminLayout><HeroManager /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/testimonials" element={
          <ProtectedRoute>
            <AdminLayout><TestimonialManager /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/news" element={
          <ProtectedRoute>
            <AdminLayout><NewsManager /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/clients" element={
          <ProtectedRoute>
            <AdminLayout><ClientManager /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/projects" element={
          <ProtectedRoute>
            <AdminLayout><ProjectManager /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute>
            <AdminLayout><SettingsManager /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/legal" element={
          <ProtectedRoute>
            <AdminLayout><LegalPagesManager /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute>
            <AdminLayout><UserManager /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/crm" element={
          <ProtectedRoute>
            <AdminLayout><CRMManager /></AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
      {!isAdmin && <CookieConsent />}
    </>
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
