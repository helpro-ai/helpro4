import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { TaskRequest } from '../types/domain';
import { listRequests, seedIfEmpty } from '../utils/mockDb';
import { useNavigate } from 'react-router-dom';

export default function Marketplace() {
  const [requests, setRequests] = useState<TaskRequest[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    seedIfEmpty();
    setRequests(listRequests().filter(r => r.status !== 'draft'));
  }, []);

  return (
    <div className="page">
      <div className="hero__content">
        <h1>Marketplace</h1>
        <p className="lead">Browse published requests and place an offer.</p>
      </div>
      <div className="grid">
        {requests.map(req => (
          <Card key={req.id}>
            <p className="eyebrow">{req.category}</p>
            <h3>{req.title}</h3>
            <p className="muted">{req.description}</p>
            <p className="muted">{req.timeWindow}</p>
            <Chip>Budget €{req.budget ?? '—'}</Chip>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <Button size="sm" onClick={() => navigate(`/app/request/${req.id}`)}>View</Button>
              <Button variant="secondary" size="sm" onClick={() => navigate(`/app/request/${req.id}#offer`)}>Offer</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
