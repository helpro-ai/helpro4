import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      localStorage.setItem('helpro_user', JSON.stringify({ email, name }));
      navigate('/app');
    }
  };

  return (
    <div className="page">
      <h1>Create account</h1>
      <Card>
        <form className="page__form" onSubmit={onSubmit}>
          <label>
            Name
            <Input required placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
          </label>
          <label>
            Email
            <Input type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <Input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          {error && <p className="chat__error">{error}</p>}
          <Button type="submit">Create account</Button>
        </form>
      </Card>
    </div>
  );
}
