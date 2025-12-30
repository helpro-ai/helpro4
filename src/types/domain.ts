export type Role = 'customer' | 'provider';

export type ServiceCategory = 'home' | 'office' | 'hotel' | 'delivery' | 'recycling';

export interface UserProfile {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  rating?: number;
  reviewCount?: number;
  vehicleType?: string;
}

export interface TaskRequest {
  id: string;
  customerId: string;
  title: string;
  description: string;
  category: ServiceCategory;
  pickupAddress: string;
  dropoffAddress?: string;
  timeWindow: string;
  photos: string[];
  priceMode: 'fixed' | 'bid';
  budget?: number;
  createdAt: string;
}

export interface Offer {
  id: string;
  requestId: string;
  providerId: string;
  amount: number;
  message: string;
  availability: string;
  vehicleType?: string;
  createdAt: string;
}

export type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  requestId: string;
  customerId: string;
  providerId: string;
  status: BookingStatus;
  acceptedOfferId?: string;
  scheduledTime?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}
