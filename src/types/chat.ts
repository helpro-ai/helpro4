export type ServiceCategory = 'home' | 'office' | 'hotel' | null;
export type TimeHint = 'today' | 'tomorrow' | 'weekend' | null;

export interface UserIntent {
  category: ServiceCategory;
  timeHint: TimeHint;
  rooms?: number | null;
  hours?: number | null;
  rawEntities: string[];
}

export interface BookingDraft {
  category: ServiceCategory;
  timeHint: TimeHint;
  rooms?: number | null;
  hours?: number | null;
  notes?: string;
}
