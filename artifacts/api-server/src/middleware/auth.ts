import type { NextFunction, Request, Response } from 'express';

import { SESSION_COOKIE_NAME, getAuthenticatedTechnician } from '../lib/sessions';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const auth = await getAuthenticatedTechnician(req.cookies?.[SESSION_COOKIE_NAME]);

    if (!auth) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    req.auth = auth;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.auth || req.auth.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access required' });
    return;
  }

  next();
}
