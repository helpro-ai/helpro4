import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

function parseJwt(token: string) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const navigate = useNavigate();
  const btnRef = useRef<HTMLDivElement | null>(null);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const inject = async () => {
      if (typeof window === 'undefined') return;
      if ((window as any).google?.accounts?.id && btnRef.current) {
        try {
          ;(window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
          });
          (window as any).google.accounts.id.renderButton(btnRef.current, { theme: 'outline', size: 'large' });
        } catch (e) {
          setGoogleError('Failed to initialize Google Sign-in');
        }
        return;
      }

      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = () => {
        try {
          ;(window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
          });
          if (btnRef.current) {
            (window as any).google.accounts.id.renderButton(btnRef.current, { theme: 'outline', size: 'large' });
          }
        } catch (e) {
          setGoogleError('Failed to initialize Google Sign-in');
        }
      };
      document.body.appendChild(s);
    };
    inject();
  }, [GOOGLE_CLIENT_ID]);

  const handleGoogleResponse = async (resp: any) => {
    const credential = resp?.credential;
    if (!credential) {
      setGoogleError('Google sign-in failed');
      return;
    }
    if (import.meta.env.PROD !== true) {
      // avoid logging tokens in production
      console.warn('[Register] received Google credential (hidden)');
    }
    const payload = parseJwt(credential);
    const emailFromToken = payload?.email;

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setGoogleError(json?.error || 'Google register failed');
        return;
      }
      // create draft and navigate to verify or finish
      const draft = { email: emailFromToken || email, name: payload?.name || name || '', provider: 'google', pendingVerification: !json.verified };
      localStorage.setItem('helpro_auth_draft', JSON.stringify(draft));
      if (json.verified) {
        // mark authed
        localStorage.setItem('helpro_user', JSON.stringify({ isAuthed: true, email: draft.email, provider: 'google' }));
        navigate('/app');
      } else {
        navigate('/verify');
      }
    } catch (e) {
      setGoogleError('Network error during Google register');
    }
  };

  const validate = () => {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!terms) {
      setError('You must accept the terms');
      return false;
    }
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error || 'Registration failed');
        return;
      }
      // store draft (NO plain password)
      localStorage.setItem('helpro_auth_draft', JSON.stringify({ email, name, pendingVerification: !!json.needsVerification, provider: 'email' }));
      navigate('/verify');
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="page">
      <h1>Create account</h1>
      <Card>
        <form className="page__form" onSubmit={onSubmit}>
          <label>
            Name (optional)
            <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          </label>
          <label>
            Email
            <Input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <Input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          <label>
            Confirm password
            <Input type="password" required placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} />
            <span>I accept the terms</span>
          </label>
          {error && <p className="chat__error">{error}</p>}
          <Button type="submit">Register</Button>
        </form>

        <div style={{ marginTop: 12 }}>
          <div ref={btnRef} />
          {!GOOGLE_CLIENT_ID && (
            <p style={{ color: 'darkorange' }}>Google client id not configured (VITE_GOOGLE_CLIENT_ID)</p>
          )}
          {googleError && <p className="chat__error">{googleError}</p>}
        </div>
      </Card>
    </div>
  );
}
