import type { NextFunction, Request, Response } from 'express';

export function hasSameOrigin(req: Request): boolean {
  const origin = req.get('origin');
  const host = req.get('host');
  if (!origin || !host) return false;

  try {
    return new URL(origin).origin === `${req.protocol}://${host}`;
  } catch {
    return false;
  }
}

export function requireSameOrigin(req: Request, res: Response, next: NextFunction): void {
  if (!hasSameOrigin(req)) {
    res.status(403).json({ error: 'Invalid request origin' });
    return;
  }
  next();
}
