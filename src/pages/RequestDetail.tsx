import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useEffect, useState } from 'react';
import { Offer, TaskRequest } from '../types/domain';
import { getRequest, listOffers, saveOffer, createBooking } from '../utils/mockDb';
import { generateRequestId } from '../utils/requestId';

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState<TaskRequest | undefined>();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [availability, setAvailability] = useState('');

  useEffect(() => {
    if (id) {
      setRequest(getRequest(id));
      setOffers(listOffers(id));
    }
  }, [id]);

  const submitOffer = () => {
    if (!id || !amount) return;
    const offer: Offer = {\n      id: generateRequestId(),\n      requestId: id,\n      providerId: 'local-provider',\n      amount: Number(amount),\n      message,\n      availability,\n      createdAt: new Date().toISOString(),\n    } as any;\n    saveOffer(offer);\n    setOffers(listOffers(id));\n    setAmount('');\n    setMessage('');\n  };

  const acceptOffer = (offerId: string, providerId: string) => {
    if (!id || !request) return;
    const booking = createBooking({\n      requestId: id,\n      customerId: request.customerId,\n      providerId,\n      status: 'accepted',\n      acceptedOfferId: offerId,\n    });\n    navigate(`/app/booking/${booking.id}`);\n  };

  return (
    <div className="page">
      <h1>{request?.title || 'Request'}</h1>
      <Card>
        <h3>Offer on this request</h3>
        <div className="page__form">
          <label>
            Amount (€)
            <Input value={amount} onChange={e => setAmount(e.target.value)} />
          </label>
          <label>
            Availability/time
            <Input value={availability} onChange={e => setAvailability(e.target.value)} />
          </label>
          <label>
            Message
            <Input value={message} onChange={e => setMessage(e.target.value)} />
          </label>
          <Button size="sm" onClick={submitOffer}>Submit offer</Button>
        </div>
      </Card>

      <div className="grid" style={{ marginTop: 16 }}>
        {offers.map(offer => (
          <Card key={offer.id}>
            <p className="eyebrow">Offer {offer.id}</p>
            <h3>€{offer.amount}</h3>
            <p className="muted">{offer.message}</p>
            <p className="muted">Availability: {offer.availability}</p>
            <Button variant="secondary" size="sm" onClick={() => acceptOffer(offer.id, offer.providerId)}>Accept</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
