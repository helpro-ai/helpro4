import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useEffect, useState } from 'react';
import { Booking } from '../types/domain';
import { getBooking, updateBookingStatus } from '../utils/mockDb';
import { BookingChat } from '../components/BookingChat';

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | undefined>();

  useEffect(() => {
    if (id) setBooking(getBooking(id));
  }, [id]);

  const setStatus = (status: Booking['status']) => {
    if (!id) return;
    updateBookingStatus(id, status);
    setBooking(getBooking(id));
  };

  return (
    <div className="page">
      <h1>Booking {id}</h1>
      <Card>
        <p className="muted">Status: {booking?.status || 'accepted'}</p>
        <p className="muted">Schedule: {booking?.scheduledTime || 'TBD'}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button size="sm" onClick={() => setStatus('in_progress')}>Mark in progress</Button>
          <Button variant="secondary" size="sm" onClick={() => setStatus('completed')}>Complete</Button>
          <Button variant="ghost" size="sm" onClick={() => setStatus('cancelled')}>Cancel</Button>
        </div>
      </Card>
      {id && (
        <div className="chat-shell" style={{ marginTop: 16 }}>
          <BookingChat bookingId={id} />
        </div>
      )}
    </div>
  );
}
