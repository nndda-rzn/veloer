import { inject, injectable } from 'tsyringe';
import type { EventRepository } from '../../../domain/repositories/events/EventRepository.js';
import type { Event } from '../../../domain/entities/events/Event.js';

export interface AddEventInput {
  name: string;
  type: Event['type'];
  date: string;
  location?: string | null;
  distance?: number | null;
  registration_fee?: number | null;
  status?: Event['status'];
  notes?: string | null;
  bike_id?: string | null;
}

@injectable()
export class AddEvent {
  constructor(@inject('EventRepository') private eventRepo: EventRepository) {}

  async execute(userId: string, input: AddEventInput): Promise<Event> {
    return this.eventRepo.create({
      user_id: userId,
      name: input.name,
      type: input.type,
      date: input.date,
      location: input.location ?? null,
      distance: input.distance ?? null,
      registration_fee: input.registration_fee ?? null,
      status: input.status ?? 'registered',
      result: null,
      notes: input.notes ?? null,
      bike_id: input.bike_id ?? null,
      activity_id: null,
    });
  }
}

@injectable()
export class UpdateEvent {
  constructor(@inject('EventRepository') private eventRepo: EventRepository) {}

  async execute(id: string, userId: string, data: Partial<Event>): Promise<Event | null> {
    return this.eventRepo.update(id, userId, data);
  }
}

@injectable()
export class DeleteEvent {
  constructor(@inject('EventRepository') private eventRepo: EventRepository) {}

  async execute(id: string, userId: string): Promise<boolean> {
    const event = await this.eventRepo.findById(id, userId);
    if (!event) return false;
    await this.eventRepo.delete(id, userId);
    return true;
  }
}

@injectable()
export class GetEvents {
  constructor(@inject('EventRepository') private eventRepo: EventRepository) {}

  async execute(userId: string): Promise<Event[]> {
    return this.eventRepo.findByUserId(userId);
  }

  async executeUpcoming(userId: string, daysAhead?: number): Promise<Event[]> {
    return this.eventRepo.findUpcoming(userId, daysAhead);
  }
}
