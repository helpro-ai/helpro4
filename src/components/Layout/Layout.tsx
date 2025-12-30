import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import './Layout.css';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';

const navLinks = [
  { to: '/', label: 'Chat' },
  { to: '/services', label: 'Services' },
  { to: '/app/marketplace', label: 'Marketplace' },
  { to: '/app/requests/new', label: 'Post Request' },
  { to: '/app', label: 'Dashboard' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/faq', label: 'FAQ' },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
];

function Layout({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const themeLabel = theme === 'light' ? 'Light' : 'Dark';

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
          <Button variant="secondary" size="sm" aria-label="Toggle theme" onClick={toggleTheme}>
            {theme === 'light' ? '🌞' : '🌙'} {themeLabel}
          </Button>
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
