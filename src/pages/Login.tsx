import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      localStorage.setItem('helpro_user', JSON.stringify({ email }));
      navigate('/app');
    }
  };

  return (
    <div className="page">
      <h1>Login</h1>
      <Card>
        <form className="page__form" onSubmit={onSubmit}>
          <label>
            Email
            <Input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <Input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          {error && <p className="chat__error">{error}</p>}
          <Button type="submit">Sign in</Button>
          <NavLink to="/forgot">Forgot password?</NavLink>
        </form>
      </Card>
    </div>
  );
}
