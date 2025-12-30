import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';

export default function Profile() {
  return (
    <div className="page">
      <h1>Profile</h1>
      <Card>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
            HK
          </div>
          <div>
            <h3>Hanna Karlsson</h3>
            <p className="lead">Customer · Stockholm</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
              <Chip>Verified</Chip>
              <Chip>Rating 4.8</Chip>
            </div>
          </div>
        </div>
        <form className="page__form">
          <label>
            Name
            <Input defaultValue="Hanna Karlsson" />
          </label>
          <label>
            Email
            <Input type="email" defaultValue="hanna@example.com" />
          </label>
          <label>
            Location
            <Input defaultValue="Stockholm" />
          </label>
          <Button type="submit">Save changes</Button>
        </form>
      </Card>
    </div>
  );
}
