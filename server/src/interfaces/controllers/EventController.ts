import type { Request, Response } from 'express';
import { container } from '../../config/dependencies.js';
import {
  AddEvent,
  UpdateEvent,
  DeleteEvent,
  GetEvents,
} from '../../application/use-cases/events/EventUseCases.js';
import { AddTransaction } from '../../application/use-cases/finance/TransactionUseCases.js';

export class EventController {
  async list(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { upcoming } = req.query;
    const getEvents = container.resolve(GetEvents);
    const events =
      upcoming === 'true'
        ? await getEvents.executeUpcoming(req.user.userId)
        : await getEvents.execute(req.user.userId);
    res.json(events);
  }

  async getById(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const getEvents = container.resolve(GetEvents);
    const events = await getEvents.execute(req.user.userId);
    const event = events.find((e) => e.id === String(id));
    if (!event) {
      res.status(404).json({ error: 'Not Found', message: 'Event not found' });
      return;
    }
    res.json(event);
  }

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const addEvent = container.resolve(AddEvent);
    const event = await addEvent.execute(req.user.userId, req.body);
    res.status(201).json(event);
  }

  async update(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const updateEvent = container.resolve(UpdateEvent);
    const event = await updateEvent.execute(String(id), req.user.userId, req.body);
    if (!event) {
      res.status(404).json({ error: 'Not Found', message: 'Event not found' });
      return;
    }

    // Auto-create transaction when event completed with registration fee
    if (req.body.status === 'completed' && event.registration_fee && event.registration_fee > 0) {
      const addTransaction = container.resolve(AddTransaction);
      await addTransaction.execute(req.user.userId, {
        type: 'expense',
        category: 'event',
        amount: event.registration_fee,
        date: event.date,
        description: `[Event] ${event.name}`,
      });
    }

    res.json(event);
  }

  async delete(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const deleteEvent = container.resolve(DeleteEvent);
    const deleted = await deleteEvent.execute(String(id), req.user.userId);
    if (!deleted) {
      res.status(404).json({ error: 'Not Found', message: 'Event not found' });
      return;
    }
    res.status(204).send();
  }
}
