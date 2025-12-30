export interface CreateRequestDTO {
  title: string;
  description: string;
  category: 'moving' | 'delivery' | 'recycling' | 'shopping' | 'home-task';
  budget: number;
  location: string;
  scheduledDate?: string;
}
