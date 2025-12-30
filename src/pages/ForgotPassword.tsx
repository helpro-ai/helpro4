import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function ForgotPassword() {
  return (
    <div className="page">
      <h1>Reset password</h1>
      <Card>
        <form className="page__form">
          <label>
            Email
            <Input type="email" required placeholder="you@example.com" />
          </label>
          <Button type="submit">Send reset link</Button>
        </form>
      </Card>
    </div>
  );
}
