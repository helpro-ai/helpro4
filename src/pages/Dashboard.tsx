import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import ChatWidget from '../components/ChatWidget/ChatWidget';

const metrics = [
  { label: 'Active requests', value: '3' },
  { label: 'Upcoming bookings', value: '2' },
  { label: 'Average rating', value: '4.8' },
];

export default function Dashboard() {
  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="grid">
        {metrics.map(metric => (
          <Card key={metric.label}>
            <p className="lead" style={{ marginBottom: '0.35rem' }}>{metric.label}</p>
            <h2>{metric.value}</h2>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3>Quick actions</h3>
            <p className="lead">Create a new request or check open jobs.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button>Post request</Button>
            <Button variant="secondary">View bookings</Button>
          </div>
        </div>
        <ChatWidget />
      </Card>
    </div>
  );
}
