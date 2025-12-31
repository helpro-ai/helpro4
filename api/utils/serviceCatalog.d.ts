export type Locale = 'en' | 'sv' | 'de' | 'es' | 'fa';

export interface ServiceDefinition {
  id: string;
  groupId?: string;
  labels: Record<Locale, string>;
  descriptions: Record<Locale, string>;
  icon: string;
  keywords: Record<Locale, string[]>;
  typicalUnit?: 'hours' | 'items' | 'rooms' | 'sqm';
  subcategories?: string[];
}

export const SERVICE_CATALOG: ServiceDefinition[];

export function getServiceById(serviceId: string): ServiceDefinition | undefined;
export function getServiceName(serviceId: string, locale: Locale): string;
export function getAllServiceIds(): string[];
