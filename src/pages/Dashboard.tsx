import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const cards = [
  {
    title: 'Home Cleaning',
    desc: 'Sparkling kitchens, calm bedrooms, recurring or once-off care.',
    badge: '4.9 rating',
  },
  {
    title: 'Office Cleaning',
    desc: 'Meeting rooms, desks, and shared spaces reset before the day starts.',
    badge: '~2h slot',
  },
  {
    title: 'Hotel Cleaning',
    desc: 'Boutique-ready rooms, turndown touches, and lobby polish.',
    badge: 'Concierge',
  },
];

export default function Dashboard() {
  return (
    <div className="page">
      <h1>Spaces</h1>
      <p className="muted">Choose a playbook and book a crew with one tap.</p>
      <div className="bento">
        {cards.map(card => (
          <Card key={card.title} className="bento__card">
            <div className="bento__header">
              <div>
                <p className="eyebrow">{card.title}</p>
                <h3>{card.desc}</h3>
              </div>
              <span className="chip">{card.badge}</span>
            </div>
            <Button style={{ marginTop: '12px' }}>Book</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
