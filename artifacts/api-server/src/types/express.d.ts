import type { AuthenticatedTechnician } from '../lib/sessions';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedTechnician;
    }
  }
}

export {};
