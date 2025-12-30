export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'helper';
  avatar?: string;
  rating?: number;
  reviewCount?: number;
}

export interface Request {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  description: string;
  category: 'moving' | 'delivery' | 'recycling' | 'shopping' | 'home-task';
  budget: number;
  location: string;
  scheduledDate?: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Booking {
  id: string;
  requestId: string;
  customerId: string;
  helperId: string;
  helperName: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  price: number;
  scheduledDate: string;
  completedAt?: string;
  rating?: number;
  review?: string;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}
