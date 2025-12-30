import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LanguageGate from './components/LanguageGate/LanguageGate';
import Layout from './components/Layout/Layout';
import { shouldShowLanguageGate } from './utils/storage';

// Pages
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
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

  if (showLanguageGate) {
    return <LanguageGate onComplete={() => setShowLanguageGate(false)} />;
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          {/* Marketing */}
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          
          {/* App */}
          <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/app/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
          <Route path="/app/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/app/request/:id" element={<ProtectedRoute><RequestDetail /></ProtectedRoute>} />
          <Route path="/app/booking/:id" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
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

export default App;
