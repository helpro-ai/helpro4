import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import ChatWidget from '../components/ChatWidget/ChatWidget';
import '../components/ui/ui.css';

const steps = [
  { title: 'Post your request', description: 'Describe the help you need, set your price, and preferred time.' },
  { title: 'Choose a helper', description: 'Review helpers, check ratings, and confirm availability.' },
  { title: 'Get it done', description: 'Track progress, pay in-app, and leave a review.' },
];

const categories = ['Moving', 'Delivery', 'Recycling', 'Shopping', 'Home tasks'];

export default function Home() {
  return (
    <div className="page">
      <section className="hero card" style={{ marginBottom: '1.5rem' }}>
        <div className="hero__content">
          <Chip>New</Chip>
          <h1>Get help with everyday tasks</h1>
          <p className="lead">Connect with trusted helpers for moving, deliveries, recycling, and more—pay when the job is done.</p>
          <div className="hero__actions">
            <Button size="lg">Post a request</Button>
            <Button variant="secondary" size="lg">Browse helpers</Button>
          </div>
          <div className="hero__tags">
            {categories.map(cat => (
              <Chip key={cat}>{cat}</Chip>
            ))}
          </div>
        </div>
        <div className="hero__panel">
          <ChatWidget />
        </div>
      </section>

      <section className="grid" style={{ marginBottom: '1.5rem' }}>
        {steps.map(step => (
          <Card key={step.title} className="card">
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </Card>
        ))}
      </section>

      <Card>
        <h3>Why Helpro?</h3>
        <ul className="list">
          <li>Verified helpers with ratings and reviews.</li>
          <li>Transparent pricing and secure in-app payments.</li>
          <li>Real-time messaging and scheduling.
          </li>
        </ul>
      </Card>
    </div>
  );
}
