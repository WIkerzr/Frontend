// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Versión 2.8.2+ ya no usa spread operator (...)
export const worker = setupWorker(...(handlers as any));
