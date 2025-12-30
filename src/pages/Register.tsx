import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function Register() {
  return (
    <div className="page">
      <h1>Create account</h1>
      <Card>
        <form className="page__form">
          <label>
            Name
            <Input required placeholder="Your name" />
          </label>
          <label>
            Email
            <Input type="email" required placeholder="you@example.com" />
          </label>
          <label>
            Password
            <Input type="password" required placeholder="••••••••" />
          </label>
          <Button type="submit">Create account</Button>
        </form>
      </Card>
    </div>
  );
}
