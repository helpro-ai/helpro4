import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { catalog } from '../data/catalog';
import { TaskRequest } from '../types/domain';
import { generateRequestId } from '../utils/requestId';
import { saveRequest, seedIfEmpty } from '../utils/mockDb';
import { useNavigate } from 'react-router-dom';
import { parseUserIntent } from '../utils/nlp';

const priceModes = [
  { key: 'fixed', label: 'Fixed price' },
  { key: 'bid', label: 'Request offers' },
] as const;

export default function RequestsNew() {
  const [category, setCategory] = useState<string>('moving-delivery');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [timeWindow, setTimeWindow] = useState('');
  const [accessNotes, setAccessNotes] = useState('');
  const [budget, setBudget] = useState('');
  const [priceMode, setPriceMode] = useState<'fixed' | 'bid'>('bid');
  const navigate = useNavigate();

  useEffect(() => {
    seedIfEmpty();
  }, []);

  const intent = useMemo(() => parseUserIntent(description), [description]);

  useEffect(() => {
    if (intent.category) setCategory(intent.category);
    if (intent.timeHint && !timeWindow) setTimeWindow(intent.timeHint);
  }, [intent, timeWindow]);

  const onSubmit = (publish: boolean) => {
    if (!title || !description || !pickupAddress) return;
    const request: TaskRequest = {
      id: generateRequestId(),
      customerId: 'local-customer',
      title,
      description,
      category: category as any,
      pickupAddress,
      dropoffAddress: dropoffAddress || undefined,
      timeWindow,
      photos: [],
      priceMode,
      budget: budget ? Number(budget) : undefined,
      createdAt: new Date().toISOString(),
      accessNotes,
      status: publish ? 'published' : 'draft',
    } as any;
    saveRequest(request);
    navigate('/app/requests');
  };

  return (
    <div className="page">
      <h1>Post a request</h1>
      <Card>
        <div className="grid" style={{ gap: 12 }}>
          <div>
            <p className="eyebrow">Categories</p>
            <div className="hero__tags">
              {catalog.map(cat => (
                <Chip key={cat.id} onClick={() => setCategory(cat.id)} className={category === cat.id ? 'active-chip' : ''}>
                  {cat.icon} {cat.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="page__form">
            <label>
              Title
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="What do you need?" required />
            </label>
            <label>
              Description
              <textarea className="input" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Add details, size, timing" />
            </label>
            <label>
              Pickup address
              <Input value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} placeholder="Street, city" required />
            </label>
            <label>
              Dropoff address (optional)
              <Input value={dropoffAddress} onChange={e => setDropoffAddress(e.target.value)} placeholder="Optional" />
            </label>
            <label>
              Time window
              <Input value={timeWindow} onChange={e => setTimeWindow(e.target.value)} placeholder="e.g., Tomorrow 4-6pm" />
            </label>
            <label>
              Access notes (stairs/elevator)
              <Input value={accessNotes} onChange={e => setAccessNotes(e.target.value)} placeholder="Stairs, elevator, codes" />
            </label>
            <div className="hero__tags">
              {priceModes.map(mode => (
                <Chip key={mode.key} onClick={() => setPriceMode(mode.key)} className={priceMode === mode.key ? 'active-chip' : ''}>
                  {mode.label}
                </Chip>
              ))}
            </div>
            {priceMode === 'fixed' && (
              <label>
                Budget (€)
                <Input value={budget} onChange={e => setBudget(e.target.value)} type="number" />
              </label>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Button onClick={() => onSubmit(true)}>Publish</Button>
              <Button variant="secondary" onClick={() => onSubmit(false)}>Save draft</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
