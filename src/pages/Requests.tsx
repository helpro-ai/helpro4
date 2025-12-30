import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';

const requests = [
  { id: 'REQ-1042', title: 'Move sofa to storage', budget: 65, status: 'open', category: 'moving', location: 'Stockholm' },
  { id: 'REQ-1041', title: 'Pick up table from marketplace', budget: 40, status: 'in-progress', category: 'delivery', location: 'Gothenburg' },
  { id: 'REQ-1039', title: 'Recycle old electronics', budget: 30, status: 'completed', category: 'recycling', location: 'Uppsala' },
];

const statusColor: Record<string, string> = {
  open: 'var(--accent)',
  'in-progress': 'var(--warning)',
  completed: 'var(--success)',
};

export default function Requests() {
  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Requests</h1>
        <Button>Create request</Button>
      </div>
      <div className="grid">
        {requests.map(req => (
          <Card key={req.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{req.title}</h3>
              <Chip style={{ borderColor: statusColor[req.status], color: statusColor[req.status] }}>
                {req.status}
              </Chip>
            </div>
            <p className="lead">Budget €{req.budget}</p>
            <p style={{ color: 'var(--text-secondary)' }}>{req.location} · {req.category}</p>
            <Button variant="secondary" style={{ marginTop: '0.75rem' }}>View details</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
