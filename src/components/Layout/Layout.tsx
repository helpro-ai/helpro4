import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import './Layout.css';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
  { to: '/app', label: 'Dashboard' },
  { to: '/requests', label: 'Requests' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/messages', label: 'Messages' },
  { to: '/profile', label: 'Profile' },
];

function Layout({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (
    (localStorage.getItem('helpro_theme') as 'light' | 'dark') || 'light'
  ));
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('helpro_theme', theme);
  }, [theme]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__brand">
          <span className="layout__logo">⚡</span>
          <span className="layout__title">Helpro</span>
        </div>
        <nav className="layout__nav">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? 'active' : ''}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="layout__actions">
          <IconButton aria-label="Toggle theme" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌞' : '🌙'}
          </IconButton>
          <Button variant="secondary" size="sm" onClick={() => window.location.hash = '#/login'}>
            Login
          </Button>
        </div>
      </header>
      <main className="layout__main">{children}</main>
      <footer className="layout__footer">
        <p>© {new Date().getFullYear()} Helpro. Built for everyday help.</p>
      </footer>
    </div>
  );
}

export default Layout;
