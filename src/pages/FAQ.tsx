import { Card } from '../components/ui/Card';

const faqs = [
  { q: 'How do helpers get paid?', a: 'Helpers are paid after the customer marks the job complete. Payments are processed securely in-app.' },
  { q: 'Can I change the price after posting?', a: 'Yes. You can edit the budget until a helper accepts the job.' },
  { q: 'Is there insurance?', a: 'We support optional insurance add-ons for select categories. Contact us for details.' },
  { q: 'Do you verify helpers?', a: 'Helpers complete ID verification and maintain ratings from previous jobs.' },
];

export default function FAQ() {
  return (
    <div className="page">
      <h1>Frequently Asked Questions</h1>
      <p className="lead">Everything you need to know about posting requests, payments, and safety.</p>
      <div className="grid">
        {faqs.map(item => (
          <Card key={item.q}>
            <h3>{item.q}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{item.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
