import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const threads = [
  { id: 'BKG-2033', title: 'Move sofa to storage', helper: 'Elin K.', last: 'Need building code?', unread: 1 },
  { id: 'BKG-2031', title: 'Pick up table from marketplace', helper: 'Jonas P.', last: 'On my way to pickup', unread: 0 },
];

export default function Messages() {
  return (
    <div className="page">
      <h1>Messages</h1>
      <div className="grid">
        {threads.map(thread => (
          <Card key={thread.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p className="lead">{thread.title}</p>
                <p style={{ color: 'var(--text-secondary)' }}>Helper: {thread.helper}</p>
                <p style={{ marginTop: '0.25rem' }}>{thread.last}</p>
              </div>
              {thread.unread > 0 && (
                <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: '50%', padding: '0.35rem 0.55rem', fontWeight: 700 }}>
                  {thread.unread}
                </span>
              )}
            </div>
            <Button variant="secondary" style={{ marginTop: '0.75rem' }}>Open chat</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
