import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LanguageGate from './components/LanguageGate/LanguageGate';
import Layout from './components/Layout/Layout';
import { shouldShowLanguageGate } from './utils/storage';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Pages
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import Marketplace from './pages/Marketplace';
import RequestDetail from './pages/RequestDetail';
import BookingDetail from './pages/BookingDetail';
import Bookings from './pages/Bookings';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import RequestsNew from './pages/RequestsNew';
import Services from './pages/Services';

function AppContent({ showLanguageGate, setShowLanguageGate }: { showLanguageGate: boolean; setShowLanguageGate: (show: boolean) => void }) {
  const { locale } = useLanguage();

  useEffect(() => {
    // Set dir attribute on document element for RTL support
    document.documentElement.setAttribute('dir', locale === 'fa' ? 'rtl' : 'ltr');
  }, [locale]);

  if (showLanguageGate) {
    return <LanguageGate onComplete={() => setShowLanguageGate(false)} />;
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          {/* Marketing */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot" element={<ForgotPassword />} />

          {/* App */}
          <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/app/requests" element={<Requests />} />
          <Route path="/app/requests/new" element={<RequestsNew />} />
          <Route path="/app/marketplace" element={<Marketplace />} />
          <Route path="/app/request/:id" element={<RequestDetail />} />
          <Route path="/app/booking/:id" element={<BookingDetail />} />
          <Route path="/app/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/app/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/app/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

function App() {
  const [showLanguageGate, setShowLanguageGate] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const shouldShow = shouldShowLanguageGate();
    setShowLanguageGate(shouldShow);
    setLoading(false);
  }, []);

  if (loading) {
    return null;
  }

  return (
    <LanguageProvider>
      <AppContent showLanguageGate={showLanguageGate} setShowLanguageGate={setShowLanguageGate} />
    </LanguageProvider>
  );
}

export default App;
