import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import ChatWidget from '../components/ChatWidget/ChatWidget';

export default function BookingDetail() {
  const { id } = useParams();
  return (
    <div className="page">
      <h1>Booking {id}</h1>
      <Card>
        <p className="muted">Status: Accepted</p>
        <p className="muted">Schedule: Tomorrow 4-6pm</p>
        <Button size="sm">Mark in progress</Button>
        <Button variant="secondary" size="sm" style={{ marginLeft: 8 }}>Complete</Button>
      </Card>
      <div className="chat-shell" style={{ marginTop: 16 }}>
        <ChatWidget />
      </div>
    </div>
  );
}
