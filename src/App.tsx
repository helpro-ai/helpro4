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
import Bookings from './pages/Bookings';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
