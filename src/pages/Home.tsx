import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import ChatWidget from '../components/ChatWidget/ChatWidget';
import '../components/ui/ui.css';

const previewRows = [
  { label: 'Response time', value: '~5 min' },
  { label: 'Average rating', value: '4.9 / 5' },
  { label: 'Verified pros', value: '380+' },
];

const categories = [
  { title: 'Home', desc: 'Apartments, houses, recurring care' },
  { title: 'Office', desc: 'Workspaces, meeting rooms, on-demand' },
  { title: 'Hotel', desc: 'Suites, lobbies, boutique stays' },
];

export default function Home() {
  return (
    <div className="page">
      <section className="hero card">
        <div className="hero__content">
          <span className="eyebrow">Precision help, on your schedule</span>
          <h1>Concierge cleaning and setup that feels effortless.</h1>
          <p className="lead">
            Book trusted teams for home, office, or hotel in a few taps. Transparent pricing, real updates, and finishing touches baked in.
          </p>
          <div className="hero__actions">
            <Button size="lg">Start a booking</Button>
            <Button variant="secondary" size="lg">View availability</Button>
          </div>
          <div className="hero__tags">
            <Chip>Same-week slots</Chip>
            <Chip>Background checked</Chip>
            <Chip>Eco supplies</Chip>
          </div>
        </div>
        <div className="hero__panel card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <p className="eyebrow">Live preview</p>
              <h3 style={{ margin: 0 }}>Today&apos;s queue</h3>
            </div>
            <Chip>Realtime</Chip>
          </div>
          <div className="preview-grid">
            {previewRows.map(row => (
              <div key={row.label} className="preview-row">
                <p className="muted">{row.label}</p>
                <span>{row.value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px' }}>
            <ChatWidget />
          </div>
        </div>
      </section>

      <section className="grid hero__categories">
        {categories.map(cat => (
          <Card key={cat.title}>
            <p className="eyebrow">{cat.title}</p>
            <h3>{cat.desc.split(' ')[0]} experiences</h3>
            <p className="muted">{cat.desc}</p>
            <Button variant="secondary" style={{ marginTop: '12px' }}>Explore {cat.title}</Button>
          </Card>
        ))}
      </section>
    </div>
  );
}
