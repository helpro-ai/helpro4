import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { NavLink } from 'react-router-dom';

export default function Login() {
  return (
    <div className="page">
      <h1>Login</h1>
      <Card>
        <form className="page__form">
          <label>
            Email
            <Input type="email" required placeholder="you@example.com" />
          </label>
          <label>
            Password
            <Input type="password" required placeholder="••••••••" />
          </label>
          <Button type="submit">Sign in</Button>
          <NavLink to="/forgot">Forgot password?</NavLink>
        </form>
      </Card>
    </div>
  );
}
