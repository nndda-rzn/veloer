import type { Event } from '../../entities/events/Event.js';

export interface EventRepository {
  findByUserId(userId: string): Promise<Event[]>;
  findUpcoming(userId: string, daysAhead?: number): Promise<Event[]>;
  findById(id: string, userId: string): Promise<Event | null>;
  create(data: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event>;
  update(id: string, userId: string, data: Partial<Event>): Promise<Event | null>;
  delete(id: string, userId: string): Promise<void>;
}
