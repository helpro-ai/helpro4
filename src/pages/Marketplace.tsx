import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { ServiceCategory, TaskRequest } from '../types/domain';

const mockRequests: TaskRequest[] = [
  { id: 'REQ-201', customerId: 'u1', title: 'Move sofa', description: 'Two floor walk-up', category: 'home', pickupAddress: 'Main St 1', dropoffAddress: 'Pine St 5', timeWindow: 'Tomorrow 4-6pm', photos: [], priceMode: 'bid', createdAt: '', budget: 70 },
  { id: 'REQ-202', customerId: 'u2', title: 'Office chairs pickup', description: '6 chairs from storage', category: 'office', pickupAddress: 'Warehouse 2', dropoffAddress: 'HQ lobby', timeWindow: 'Weekend', photos: [], priceMode: 'bid', createdAt: '', budget: 120 },
];

const categoryLabels: Record<ServiceCategory, string> = {
  home: 'Home',
  office: 'Office',
  hotel: 'Hotel',
  delivery: 'Delivery',
  recycling: 'Recycling',
};

export default function Marketplace() {
  return (
    <div className="page">
      <div className="hero__content">
        <h1>Marketplace</h1>
        <p className="lead">Browse nearby requests and place an offer.</p>
      </div>
      <div className="grid">
        {mockRequests.map(req => (
          <Card key={req.id}>
            <p className="eyebrow">{categoryLabels[req.category]}</p>
            <h3>{req.title}</h3>
            <p className="muted">{req.description}</p>
            <p className="muted">{req.timeWindow}</p>
            <Chip>Budget €{req.budget ?? '—'}</Chip>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <Button size="sm">View</Button>
              <Button variant="secondary" size="sm">Offer</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
