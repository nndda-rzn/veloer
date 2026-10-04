import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Library does not auto-clean when globals are off; do it explicitly so
// each component test starts from an empty document.
afterEach(() => cleanup());
