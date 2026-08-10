import type { Request, Response } from 'express';
import { container } from '../../config/dependencies.js';
import { AddBike } from '../../application/use-cases/inventory/AddBike.js';
import { UpdateBike } from '../../application/use-cases/inventory/UpdateBike.js';
import { DeleteBike } from '../../application/use-cases/inventory/DeleteBike.js';
import { GetBikes, GetBikeById } from '../../application/use-cases/inventory/GetBikes.js';
import { AddComponent } from '../../application/use-cases/inventory/AddComponent.js';
import {
  GetComponents,
  UpdateComponent,
  DeleteComponent,
} from '../../application/use-cases/inventory/ManageComponents.js';

export class InventoryController {
  // --- BIKES ---

  async listBikes(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const getBikes = container.resolve(GetBikes);
    const bikes = await getBikes.execute(req.user.userId);
    res.json(bikes);
  }

  async getBike(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const getBikeById = container.resolve(GetBikeById);
    const bike = await getBikeById.execute(String(id), req.user.userId);
    if (!bike) {
      res.status(404).json({ error: 'Not Found', message: 'Bike not found' });
      return;
    }
    res.json(bike);
  }

  async createBike(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const addBike = container.resolve(AddBike);
    const bike = await addBike.execute(req.user.userId, req.body);
    res.status(201).json(bike);
  }

  async updateBike(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const updateBike = container.resolve(UpdateBike);
    const bike = await updateBike.execute(String(id), req.user.userId, req.body);
    if (!bike) {
      res.status(404).json({ error: 'Not Found', message: 'Bike not found' });
      return;
    }
    res.json(bike);
  }

  async deleteBike(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const deleteBike = container.resolve(DeleteBike);
    const deleted = await deleteBike.execute(String(id), req.user.userId);
    if (!deleted) {
      res.status(404).json({ error: 'Not Found', message: 'Bike not found' });
      return;
    }
    res.status(204).send();
  }

  // --- COMPONENTS ---

  async listComponents(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { bikeId } = req.params;
    const getComponents = container.resolve(GetComponents);
    const components = await getComponents.executeByBikeId(String(bikeId));
    res.json(components);
  }

  async createComponent(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const addComponent = container.resolve(AddComponent);
    const component = await addComponent.execute(req.body);
    res.status(201).json(component);
  }

  async updateComponent(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const updateComponent = container.resolve(UpdateComponent);
    const component = await updateComponent.execute(String(id), req.body);
    if (!component) {
      res.status(404).json({ error: 'Not Found', message: 'Component not found' });
      return;
    }
    res.json(component);
  }

  async deleteComponent(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const deleteComponent = container.resolve(DeleteComponent);
    const deleted = await deleteComponent.execute(String(id));
    if (!deleted) {
      res.status(404).json({ error: 'Not Found', message: 'Component not found' });
      return;
    }
    res.status(204).send();
  }
}
