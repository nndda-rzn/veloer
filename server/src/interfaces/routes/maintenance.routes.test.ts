import { describe, expect, it } from 'vitest';
import { maintenanceRoutes } from './maintenance.routes.js';

interface RouteLayer {
  route?: { path: string; methods: Record<string, boolean> };
}

/** The methods and paths this router actually registers. */
function routeTable(): string[] {
  const stack = (maintenanceRoutes as unknown as { stack: RouteLayer[] }).stack;
  const out: string[] = [];
  for (const layer of stack) {
    if (!layer.route) continue;
    const methods = Object.keys(layer.route.methods).filter((m) => layer.route!.methods[m]);
    for (const m of methods) out.push(`${m.toUpperCase()} ${layer.route.path}`);
  }
  return out;
}

describe('maintenance routes', () => {
  it('registers the delete-log route the client calls', () => {
    expect(routeTable()).toContain('DELETE /logs/:id');
  });

  it('registers the schedule update and delete routes the client calls', () => {
    const table = routeTable();
    expect(table).toContain('PATCH /schedules/:id');
    expect(table).toContain('DELETE /schedules/:id');
  });

  it('keeps the routes the UI already uses', () => {
    const table = routeTable();
    expect(table).toContain('GET /:bikeId/logs');
    expect(table).toContain('POST /:bikeId/logs');
    expect(table).toContain('GET /:bikeId/schedules');
    expect(table).toContain('POST /:bikeId/schedules');
    expect(table).toContain('GET /due');
  });
});
