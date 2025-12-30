import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';

const bookings = [
  { id: 'BKG-2033', title: 'Move sofa to storage', helper: 'Elin K.', status: 'accepted', date: '2024-05-12', price: 65 },
  { id: 'BKG-2031', title: 'Pick up table from marketplace', helper: 'Jonas P.', status: 'in-progress', date: '2024-05-11', price: 40 },
  { id: 'BKG-2028', title: 'Recycle old electronics', helper: 'Anna S.', status: 'completed', date: '2024-05-04', price: 30 },
];

const statusColor: Record<string, string> = {
  accepted: 'var(--accent)',
  'in-progress': 'var(--warning)',
  completed: 'var(--success)',
};

export default function Bookings() {
  return (
    <div className="page">
      <h1>Bookings</h1>
      <div className="grid">
        {bookings.map(b => (
          <Card key={b.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{b.title}</h3>
              <Chip style={{ borderColor: statusColor[b.status], color: statusColor[b.status] }}>
                {b.status}
              </Chip>
            </div>
            <p className="lead">Helper: {b.helper}</p>
            <p style={{ color: 'var(--text-secondary)' }}>Date {b.date} · €{b.price}</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <Button variant="secondary">Message</Button>
              <Button>Mark complete</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
