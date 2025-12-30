import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const plans = [
  { name: 'Starter', price: 'Free', features: ['Post 3 requests / mo', 'In-app chat', 'Email support'] },
  { name: 'Pro', price: '€12/mo', features: ['Unlimited requests', 'Priority helpers', 'Support SLA'] },
  { name: 'Business', price: 'Contact us', features: ['Teams access', 'Custom SLAs', 'Dedicated manager'] },
];

export default function Pricing() {
  return (
    <div className="page">
      <h1>Pricing</h1>
      <p className="lead">Simple, transparent pricing. Pay helpers only when work is completed.</p>
      <div className="grid">
        {plans.map(plan => (
          <Card key={plan.name}>
            <h3>{plan.name}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{plan.price}</p>
            <ul className="list">
              {plan.features.map(feature => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Button style={{ marginTop: '1rem' }}>Choose {plan.name}</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
