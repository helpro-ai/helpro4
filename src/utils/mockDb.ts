import { Booking, BookingStatus, Message, Offer, TaskRequest } from '../types/domain';
import { generateRequestId } from './requestId';

const KEYS = {
  requests: 'helpro_requests',
  offers: 'helpro_offers',
  bookings: 'helpro_bookings',
  messages: 'helpro_messages',
};

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T[]) : [];
}

function write<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function listRequests(): TaskRequest[] {
  return read<TaskRequest>(KEYS.requests);
}

export function saveRequest(request: TaskRequest) {
  const items = listRequests();
  const existingIndex = items.findIndex(r => r.id === request.id);
  if (existingIndex >= 0) {
    items[existingIndex] = request;
  } else {
    items.push(request);
  }
  write(KEYS.requests, items);
}

export function getRequest(id: string): TaskRequest | undefined {
  return listRequests().find(r => r.id === id);
}

export function listOffers(requestId: string): Offer[] {
  return read<Offer>(KEYS.offers).filter(o => o.requestId === requestId);
}

export function saveOffer(offer: Offer) {
  const offers = read<Offer>(KEYS.offers);
  offers.push(offer);
  write(KEYS.offers, offers);
}

export function createBooking(input: Omit<Booking, 'id' | 'createdAt'>): Booking {
  const bookings = read<Booking>(KEYS.bookings);
  const booking: Booking = { ...input, id: generateRequestId(), createdAt: new Date().toISOString() };
  bookings.push(booking);
  write(KEYS.bookings, bookings);
  return booking;
}

export function updateBookingStatus(id: string, status: BookingStatus) {
  const bookings = read<Booking>(KEYS.bookings);
  const index = bookings.findIndex(b => b.id === id);
  if (index >= 0) {
    bookings[index].status = status;
    write(KEYS.bookings, bookings);
  }
}

export function getBooking(id: string): Booking | undefined {
  return read<Booking>(KEYS.bookings).find(b => b.id === id);
}

export function listMessages(bookingId: string): Message[] {
  return read<Message>(KEYS.messages).filter(m => m.bookingId === bookingId);
}

export function addMessage(message: Message) {
  const messages = read<Message>(KEYS.messages);
  messages.push(message);
  write(KEYS.messages, messages);
}

export function seedIfEmpty() {
  if (listRequests().length === 0) {
    const sample: TaskRequest = {
      id: 'REQ-seed',
      customerId: 'seed-customer',
      title: 'Deliver wardrobe',
      description: 'Wardrobe pickup from storage, needs two people',
      category: 'moving-delivery',
      pickupAddress: 'Storage 21',
      dropoffAddress: 'Hill St 4',
      timeWindow: 'Tomorrow 4-6pm',
      photos: [],
      priceMode: 'bid',
      budget: 120,
      createdAt: new Date().toISOString(),
    } as any;
    saveRequest(sample);
  }
}
