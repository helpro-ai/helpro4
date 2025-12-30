import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useState } from 'react';
import { Offer } from '../types/domain';

const mockOffers: Offer[] = [
  { id: 'OFF-1', requestId: 'REQ-1', providerId: 'p1', amount: 80, message: 'Can pick up with van', availability: 'Today 5pm', createdAt: '' },
  { id: 'OFF-2', requestId: 'REQ-1', providerId: 'p2', amount: 70, message: 'Small truck available', availability: 'Tomorrow morning', createdAt: '' },
];

export default function RequestDetail() {
  const { id } = useParams();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  return (
    <div className="page">
      <h1>Request {id}</h1>
      <Card>
        <h3>Offer on this request</h3>
        <div className="page__form">
          <label>
            Amount (€)
            <Input value={amount} onChange={e => setAmount(e.target.value)} />
          </label>
          <label>
            Message
            <Input value={message} onChange={e => setMessage(e.target.value)} />
          </label>
          <Button size="sm">Submit offer</Button>
        </div>
      </Card>

      <div className="grid" style={{ marginTop: 16 }}>
        {mockOffers.map(offer => (
          <Card key={offer.id}>
            <p className="eyebrow">Offer {offer.id}</p>
            <h3>€{offer.amount}</h3>
            <p className="muted">{offer.message}</p>
            <p className="muted">Availability: {offer.availability}</p>
            <Button variant="secondary" size="sm">Accept</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
