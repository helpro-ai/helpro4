import { BookingDraft, ServiceCategory, TimeHint, UserIntent } from '../types/chat';

const categoryKeywords: Array<{ key: ServiceCategory; words: string[] }> = [
  { key: 'home', words: ['home', 'apartment', 'flat', 'house'] },
  { key: 'office', words: ['office', 'workspace', 'desk', 'meeting room'] },
  { key: 'hotel', words: ['hotel', 'suite', 'lobby', 'guest'] },
];

const timeKeywords: Array<{ key: TimeHint; words: string[] }> = [
  { key: 'today', words: ['today', 'tonight', 'asap', 'now'] },
  { key: 'tomorrow', words: ['tomorrow'] },
  { key: 'weekend', words: ['weekend', 'sat', 'saturday', 'sun', 'sunday'] },
];

export function parseUserIntent(text: string): UserIntent {
  const normalized = text.toLowerCase();
  let category: ServiceCategory = null;
  let timeHint: TimeHint = null;
  const rawEntities: string[] = [];

  for (const entry of categoryKeywords) {
    if (entry.words.some(word => normalized.includes(word))) {
      category = entry.key;
      if (entry.key) rawEntities.push(entry.key);
      break;
    }
  }

  for (const entry of timeKeywords) {
    if (entry.words.some(word => normalized.includes(word))) {
      timeHint = entry.key;
      if (entry.key) rawEntities.push(entry.key);
      break;
    }
  }

  const roomMatch = normalized.match(/(\d+)(\s*)(room|bed|beds|br)/);
  const rooms = roomMatch ? Number(roomMatch[1]) : null;
  if (rooms) rawEntities.push(`${rooms} rooms`);

  const hoursMatch = normalized.match(/(\d+)(\s*)(hour|hr|hours|hrs)/);
  const hours = hoursMatch ? Number(hoursMatch[1]) : null;
  if (hours) rawEntities.push(`${hours} hrs`);

  return { category, timeHint, rooms, hours, rawEntities };
}

export function draftFromIntent(intent: UserIntent, notes?: string): BookingDraft {
  return {
    category: intent.category,
    timeHint: intent.timeHint,
    rooms: intent.rooms || null,
    hours: intent.hours || null,
    notes,
  };
}
