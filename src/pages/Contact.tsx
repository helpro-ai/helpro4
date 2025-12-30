import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function Contact() {
  return (
    <div className="page">
      <h1>Contact</h1>
      <p className="lead">Questions about bookings, partnerships, or support? Send us a note.</p>
      <Card>
        <form className="page__form">
          <label>
            Name
            <Input required placeholder="Your name" />
          </label>
          <label>
            Email
            <Input required type="email" placeholder="you@example.com" />
          </label>
          <label>
            Message
            <textarea className="input" rows={4} placeholder="Tell us how we can help" required />
          </label>
          <Button type="submit">Send message</Button>
        </form>
      </Card>
    </div>
  );
}
