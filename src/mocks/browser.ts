import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const worker = setupWorker(...(handlers as any));
