import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { catalog } from '../data/catalog';

export default function Services() {
  return (
    <div className="page">
      <div className="hero__content">
        <h1>Services</h1>
        <p className="lead">Browse categories across moving, delivery, assembly, cleaning, and more.</p>
        <Button size="lg" onClick={() => { window.location.hash = '#/app/requests/new'; }}>Post a request</Button>
      </div>
      <div className="grid">
        {catalog.map(cat => (
          <Card key={cat.id}>
            <p className="eyebrow">{cat.icon} {cat.label}</p>
            <h3>{cat.description}</h3>
            <p className="muted">{cat.subcategories?.join(' • ')}</p>
            <Button variant="secondary" size="sm" style={{ marginTop: 8 }} onClick={() => { window.location.hash = '#/app/marketplace'; }}>View helpers</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
