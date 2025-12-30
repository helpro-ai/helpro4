import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { listRequests, seedIfEmpty } from '../utils/mockDb';
import { useEffect, useState } from 'react';
import { TaskRequest } from '../types/domain';
import { useNavigate } from 'react-router-dom';

const statusColor: Record<string, string> = {
  published: 'var(--accent-blue)',
  draft: 'var(--muted)',
  open: 'var(--accent-blue)',
  'in-progress': 'var(--warning)',
  completed: 'var(--success)',
};

export default function Requests() {
  const [requests, setRequests] = useState<TaskRequest[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    seedIfEmpty();
    setRequests(listRequests());
  }, []);

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Requests</h1>
        <Button onClick={() => navigate('/app/requests/new')}>Post request</Button>
      </div>
      <div className="grid">
        {requests.map(req => (
          <Card key={req.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{req.title}</h3>
              <Chip style={{ borderColor: statusColor[req.status || 'published'], color: statusColor[req.status || 'published'] }}>
                {req.status || 'published'}
              </Chip>
            </div>
            <p className="lead">Budget €{req.budget ?? '—'}</p>
            <p className="muted">{req.pickupAddress}</p>
            <Button variant="secondary" style={{ marginTop: '0.75rem' }} onClick={() => navigate(`/app/request/${req.id}`)}>View details</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
