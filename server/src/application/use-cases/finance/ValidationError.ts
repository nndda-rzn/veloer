/**
 * A request-body problem the caller can fix, as opposed to a server fault.
 *
 * Carries `statusCode: 400` so the shared error middleware (which reads
 * `err.statusCode`) answers 400 with the message instead of a blanket 500.
 * Kept as a plain Error subclass rather than a hierarchy: finance is the only
 * place that validates input so far, and one class avoids inventing a taxonomy
 * nobody else uses.
 */
export class ValidationError extends Error {
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Guard used by every finance write: amounts are always positive IDR, and the
 * date fields are mandatory. `amount === 0` is rejected too — a zero-amount
 * transaction carries no information and only clutters the ledger.
 */
export function assertPositiveAmount(amount: unknown): void {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    throw new ValidationError('amount must be a positive number');
  }
}
