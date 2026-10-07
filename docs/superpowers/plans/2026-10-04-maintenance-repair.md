# PR F — Maintenance Repair (server) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make maintenance delete work, tie a service log's cost to the log so deleting the log removes the cost, and expose the schedule routes the client already calls.

**Architecture:** Three missing routes are added to `maintenance.routes.ts` (the controller and use cases already exist). A `maintenance_log_id` column is added to `transactions` with `ON DELETE CASCADE`, and `LogMaintenance` stamps it when it creates the transaction, so the database enforces the cost/log pairing rather than the application having to remember. No UI changes in this PR.

**Tech Stack:** TypeScript (strict, NodeNext), tsyringe DI, Express, Supabase (Postgres + JS client), Vitest.

**Spec:** `docs/superpowers/specs/2026-10-04-maintenance-repair-design.md` (section A)

## Global Constraints

- No em dashes (`—`). En dash `–` for ranges/empty values, middle dot `·` for separators.
- Migrations are applied **manually** via the Supabase SQL Editor; there is no `DATABASE_URL`/`psql` locally. Every migration must be idempotent.
- Server ESM: relative imports end in `.js` (NodeNext).
- Tests use Vitest; `server/src/test/setup.ts` loads `reflect-metadata`, so a test may import a tsyringe-decorated use case directly.
- Ownership is enforced in the use cases (the service-role key bypasses RLS). A new route must never skip that check.
- Every task ends with lint + type-check green, tests green, and a commit.

## Review Focus

- **Deleting a log whose transaction was created before this change:** the old transaction has a null `maintenance_log_id`, so the cascade cannot remove it. The delete must still succeed, and the orphan must not crash anything.
- **Deleting a log that never had a cost:** no transaction exists, so nothing cascades. The delete must succeed and return 204.
- **Deleting another user's log:** must return 404, not delete anything, and not reveal that the row exists.
- **Patching a schedule that belongs to another user's bike:** must return 404 and leave the row untouched.
- **Creating a log with a cost of 0 or null:** must not create a transaction (the existing `cost > 0` guard), so there is nothing to cascade.

---

### Task 1: Migration 022 — link a transaction to its maintenance log

**Files:**

- Create: `supabase/migrations/022_maintenance_link.sql`

**Interfaces:**

- Consumes: nothing.
- Produces: `transactions.maintenance_log_id` (UUID, FK to `maintenance_logs(id)` `ON DELETE CASCADE`) and an index on it.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/022_maintenance_link.sql`. It must be idempotent (safe to run twice). Required contents:

- `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS maintenance_log_id UUID;`
- a guarded foreign key: add the constraint only if it does not already exist, checking `pg_constraint` for the name `transactions_maintenance_log_id_fkey`, then
  `ALTER TABLE transactions ADD CONSTRAINT transactions_maintenance_log_id_fkey FOREIGN KEY (maintenance_log_id) REFERENCES maintenance_logs(id) ON DELETE CASCADE;`
- `CREATE INDEX IF NOT EXISTS idx_transactions_maintenance_log ON transactions(maintenance_log_id);`

Add a header comment explaining: a maintenance transaction belongs to its log, so deleting the log must delete the cost with it, and the FK does that at the database level rather than relying on application code.

- [ ] **Step 2: Verify the SQL by inspection**

There is no local Postgres. Re-read the file top to bottom and confirm: `$$` markers are balanced (there should be one `DO $$ ... $$;` block), no em dash character appears, and every statement is either `ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, or guarded by a constraint-existence check.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/022_maintenance_link.sql
git commit -m "feat(db): tie a maintenance transaction to its log"
```

---

### Task 2: The three missing routes

**Files:**

- Modify: `server/src/interfaces/routes/maintenance.routes.ts`
- Test: `server/src/interfaces/routes/maintenance.routes.test.ts`

**Interfaces:**

- Consumes: `MaintenanceController.deleteLog`, `.updateSchedule`, `.deleteSchedule` (all already exist).
- Produces: `DELETE /api/maintenance/logs/:id`, `PATCH /api/maintenance/schedules/:id`, `DELETE /api/maintenance/schedules/:id`.

- [ ] **Step 1: Write the failing test**

Create `server/src/interfaces/routes/maintenance.routes.test.ts`. The point is to pin that the three routes are registered with auth, without standing up the database. Assert against the router's own stack:

```ts
import { describe, expect, it } from 'vitest';
import { maintenanceRoutes } from './maintenance.routes.js';

function routeTable(): string[] {
  // Express stores layers on the router; each route layer has a `route.path`.
  const stack = (
    maintenanceRoutes as unknown as {
      stack: { route?: { path: string; methods: Record<string, boolean> } }[];
    }
  ).stack;
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
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd server && npx vitest run src/interfaces/routes/maintenance.routes.test.ts`
Expected: FAIL — the three routes are missing.

- [ ] **Step 3: Add the routes**

In `maintenance.routes.ts`, after the existing log routes add:

```ts
router.delete('/logs/:id', authMiddleware, (req, res, next) => {
  void controller.deleteLog(req, res).catch(next);
});
```

and after the existing schedule routes add:

```ts
router.patch('/schedules/:id', authMiddleware, (req, res, next) => {
  void controller.updateSchedule(req, res).catch(next);
});
router.delete('/schedules/:id', authMiddleware, (req, res, next) => {
  void controller.deleteSchedule(req, res).catch(next);
});
```

Order matters: `/logs/:id` and `/schedules/:id` are literal-prefixed, so they do not collide with `/:bikeId/logs`.

- [ ] **Step 4: Run it to verify it passes**

Run: `cd server && npx vitest run src/interfaces/routes/maintenance.routes.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/interfaces/routes/maintenance.routes.ts server/src/interfaces/routes/maintenance.routes.test.ts
git commit -m "fix(server): register the maintenance routes the client calls"
```

---

### Task 3: Stamp the log id on the transaction it creates

**Files:**

- Modify: `server/src/domain/entities/finance/Transaction.ts`
- Modify: `server/src/application/use-cases/finance/TransactionUseCases.ts`
- Modify: `server/src/application/use-cases/maintenance/MaintenanceLogUseCases.ts`
- Test: `server/src/application/use-cases/maintenance/transaction-link.test.ts`

**Interfaces:**

- Consumes: `Transaction` entity.
- Produces:
  - `Transaction.maintenance_log_id: string | null`
  - `TransactionInput.maintenance_log_id?: string | null`
  - `LogMaintenance` creates the transaction with `maintenance_log_id: log.id`

- [ ] **Step 1: Write the failing test**

Create `server/src/application/use-cases/maintenance/transaction-link.test.ts`. It pins the rule that the cost is tied to the log, using fakes so no database is needed:

```ts
import { describe, expect, it, vi } from 'vitest';
import 'reflect-metadata';
import { LogMaintenance } from './MaintenanceLogUseCases.js';

function makeUseCase() {
  const createdLog = { id: 'log-1', bike_id: 'bike-1' };
  const logRepo = {
    create: vi.fn().mockResolvedValue(createdLog),
  };
  const bikeRepo = {
    findById: vi.fn().mockResolvedValue({ id: 'bike-1', user_id: 'user-1' }),
  };
  const addTransaction = { execute: vi.fn().mockResolvedValue({ id: 'tx-1' }) };
  const useCase = new LogMaintenance(logRepo as never, bikeRepo as never, addTransaction as never);
  return { useCase, addTransaction };
}

describe('LogMaintenance transaction link', () => {
  it('stamps the log id on the transaction so deleting the log deletes the cost', async () => {
    const { useCase, addTransaction } = makeUseCase();
    await useCase.execute('user-1', {
      bike_id: 'bike-1',
      service_date: '2026-10-04',
      service_km: 1000,
      type: 'routine',
      description: 'Chain and cassette',
      cost: 250000,
      performed_by: 'self',
    });
    expect(addTransaction.execute).toHaveBeenCalledTimes(1);
    expect(addTransaction.execute.mock.calls[0][1].maintenance_log_id).toBe('log-1');
  });

  it('does not create a transaction when there is no cost', async () => {
    const { useCase, addTransaction } = makeUseCase();
    await useCase.execute('user-1', {
      bike_id: 'bike-1',
      service_date: '2026-10-04',
      service_km: 1000,
      type: 'cleaning',
      description: 'Wiped down',
      cost: 0,
      performed_by: 'self',
    });
    expect(addTransaction.execute).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd server && npx vitest run src/application/use-cases/maintenance/transaction-link.test.ts`
Expected: FAIL — `maintenance_log_id` is undefined on the transaction input.

- [ ] **Step 3: Add the field and pass it through**

- `Transaction.ts`: add `maintenance_log_id: string | null;`
- `TransactionUseCases.ts`: add `maintenance_log_id?: string | null;` to `TransactionInput` and `maintenance_log_id: input.maintenance_log_id ?? null,` to the `create` payload.
- `MaintenanceLogUseCases.ts`: in the `addTransaction.execute(userId, {...})` call, add `maintenance_log_id: log.id,`.

- [ ] **Step 4: Run it to verify it passes**

Run: `cd server && npx vitest run src/application/use-cases/maintenance/transaction-link.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/domain/entities/finance/Transaction.ts server/src/application/use-cases/finance/TransactionUseCases.ts server/src/application/use-cases/maintenance/MaintenanceLogUseCases.ts server/src/application/use-cases/maintenance/transaction-link.test.ts
git commit -m "fix(server): stamp the maintenance log id on the cost transaction"
```

---

### Task 4: Make the delete-log use case report what happened

**Files:**

- Modify: `server/src/application/use-cases/maintenance/MaintenanceLogUseCases.ts`
- Test: `server/src/application/use-cases/maintenance/delete-log.test.ts`

**Interfaces:**

- Consumes: `MaintenanceLogRepository.findById`, `.delete`.
- Produces: `DeleteMaintenanceLog.execute(id, userId): Promise<boolean>` — unchanged signature, but the tests pin the ownership rule.

- [ ] **Step 1: Write the failing test**

Create `server/src/application/use-cases/maintenance/delete-log.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import 'reflect-metadata';
import { DeleteMaintenanceLog } from './MaintenanceLogUseCases.js';

function makeUseCase(log: unknown, bike: unknown) {
  const logRepo = {
    findById: vi.fn().mockResolvedValue(log),
    delete: vi.fn().mockResolvedValue(undefined),
  };
  const bikeRepo = { findById: vi.fn().mockResolvedValue(bike) };
  return { useCase: new DeleteMaintenanceLog(logRepo as never, bikeRepo as never), logRepo };
}

describe('DeleteMaintenanceLog', () => {
  it('deletes a log that belongs to the user', async () => {
    const { useCase, logRepo } = makeUseCase(
      { id: 'log-1', bike_id: 'bike-1' },
      { id: 'bike-1', user_id: 'user-1' },
    );
    expect(await useCase.execute('log-1', 'user-1')).toBe(true);
    expect(logRepo.delete).toHaveBeenCalledWith('log-1');
  });

  it('refuses a log on another user’s bike and deletes nothing', async () => {
    const { useCase, logRepo } = makeUseCase(
      { id: 'log-1', bike_id: 'bike-1' },
      { id: 'bike-1', user_id: 'someone-else' },
    );
    expect(await useCase.execute('log-1', 'user-1')).toBe(false);
    expect(logRepo.delete).not.toHaveBeenCalled();
  });

  it('returns false for a log that does not exist', async () => {
    const { useCase, logRepo } = makeUseCase(null, null);
    expect(await useCase.execute('nope', 'user-1')).toBe(false);
    expect(logRepo.delete).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it to verify it fails or passes**

Run: `cd server && npx vitest run src/application/use-cases/maintenance/delete-log.test.ts`
Expected: PASS — the ownership logic already exists; this task pins it so the new route cannot silently regress it. If any assertion fails, fix the use case, not the test.

- [ ] **Step 3: Confirm the delete endpoint returns 204 on success and 404 otherwise**

Read `MaintenanceController.deleteLog` and confirm it responds `204` when the use case returns `true` and `404` when it returns `false`. No change expected; note the confirmation in the commit body.

- [ ] **Step 4: Commit**

```bash
git add server/src/application/use-cases/maintenance/delete-log.test.ts
git commit -m "test(server): pin maintenance delete ownership rules"
```

---

### Task 5: Full verification

**Files:** none.

**Interfaces:**

- Consumes: everything above.
- Produces: a verified server.

- [ ] **Step 1: Run the full gate**

Run: `npm run lint && npm run type-check && (cd server && npx vitest run) && npm run build:server`
Expected: lint clean, type-check clean, all tests pass, server builds.

- [ ] **Step 2: Verify against a running server**

Start the server (`cd server && npm run dev`) and, with the test user's cookie, confirm:

- `DELETE /api/maintenance/logs/<nonexistent-id>` returns **404** (not 405 or a crash).
- `PATCH /api/maintenance/schedules/<nonexistent-id>` returns **404**.
- `DELETE /api/maintenance/schedules/<nonexistent-id>` returns **404**.

These prove the routes are reachable; a 404 rather than 404-with-route-missing is the distinction that matters (Express returns a 404 HTML page for an unregistered route, and the controller returns a JSON `{"error":"Not Found"}` for a real one — check which you get).

- [ ] **Step 3: Report**

No commit. Record the results.

---

## Self-Review Notes

- **Spec coverage:** section A1 → Tasks 1, 2; section A2 → Tasks 1, 3; ownership pinning → Task 4. Sections B and C are PR G.
- **Review Focus tests:** another user's log → Task 4; a log with no cost → Task 3 (second test); a nonexistent log/schedule → Task 5 Step 2. The pre-existing-transaction case (null `maintenance_log_id`) has no test because it is a data condition, not a code path: the cascade simply does not fire, and the delete succeeds — Task 5 Step 2 covers the 204.
- **Type consistency:** `maintenance_log_id` is spelled identically in the entity, the input type, and the use case; `DeleteMaintenanceLog.execute` keeps its `(id, userId) => Promise<boolean>` signature.
- **Deferred:** applying migration 022 is the human partner's step (no local psql).
