import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function Verify() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const navigate = useNavigate();

  const draftRaw = localStorage.getItem('helpro_auth_draft');
  const draft = draftRaw ? JSON.parse(draftRaw) : null;
  const email = draft?.email || '';

  useEffect(() => {
    if (!draft) {
      setError('No pending verification found');
    }
  }, [draft]);

  const isDev = window.location.hostname === 'localhost' || import.meta.env.MODE === 'development';

  const onVerify = async () => {
    setError(null);
    if (!/^[0-9]{6}$/.test(code)) {
      setError('Enter a 6-digit code');
      return;
    }

    if (isDev && code === '123456') {
      // accept in dev
      localStorage.setItem('helpro_user', JSON.stringify({ isAuthed: true, email, provider: draft?.provider || 'email' }));
      localStorage.removeItem('helpro_auth_draft');
      navigate('/app');
      return;
    }

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error || 'Verification failed');
        return;
      }
      localStorage.setItem('helpro_user', JSON.stringify({ isAuthed: true, email, provider: draft?.provider || 'email' }));
      localStorage.removeItem('helpro_auth_draft');
      navigate('/app');
    } catch (e) {
      setError('Network error');
    }
  };

  const onResend = async () => {
    if (!isDev) {
      setInfo('Resend available in development only');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: draft?.name }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error || 'Resend failed');
        return;
      }
      setInfo('Resent (dev): use code 123456');
    } catch (e) {
      setError('Network error');
    }
  };

  return (
    <div className="page">
      <h1>Verify</h1>
      <Card>
        <div className="page__form">
          <p>We sent a 6-digit code to <strong>{email}</strong></p>
          <label>
            Code
            <Input value={code} onChange={e => setCode(e.target.value)} placeholder="123456" />
          </label>
          {error && <p className="chat__error">{error}</p>}
          {info && <p style={{ color: 'green' }}>{info}</p>}
          <Button onClick={onVerify}>Verify</Button>
          <Button onClick={onResend} type="button">Resend (dev)</Button>
        </div>
      </Card>
    </div>
  );
}
