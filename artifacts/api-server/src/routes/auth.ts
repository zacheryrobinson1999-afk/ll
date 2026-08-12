import { and, desc, eq, gte } from 'drizzle-orm';
import { Router, type Request, type Response } from 'express';
import { db, loginAttempts, technicians } from '@workspace/db';

import {
  hashClientIp,
  normalizeTechnicianName,
  performDummyAccessCodeVerification,
  verifyAccessCode,
} from '../lib/accessCodes';
import {
  SESSION_COOKIE_NAME,
  createSession,
  getAuthenticatedTechnician,
  revokeSession,
} from '../lib/sessions';
import { getSecurityConfig } from '../lib/securityConfig';
import {
  INVALID_LOGIN_RESPONSE,
  INVALID_LOGIN_STATUS,
  LOCKOUT_MS,
  MAX_FAILED_ATTEMPTS,
  isIpThrottled,
  shouldLockAfterFailure,
} from '../lib/authPolicy';
import { requireSameOrigin } from '../middleware/sameOrigin';

const router = Router();
type AttemptOutcome = 'success' | 'failed' | 'disabled' | 'locked';

function requestIp(req: Request): string {
  return req.ip || 'unknown';
}

function readLoginBody(body: unknown): { name: string; accessCode: string } | null {
  if (
    !body ||
    typeof body !== 'object' ||
    typeof (body as Record<string, unknown>).name !== 'string' ||
    typeof (body as Record<string, unknown>).accessCode !== 'string'
  ) {
    return null;
  }

  const { name, accessCode } = body as { name: string; accessCode: string };
  if (name.length > 160 || accessCode.length > 32) return null;
  return { name, accessCode };
}

async function recordAttempt(
  normalizedName: string,
  ipHash: string,
  outcome: AttemptOutcome,
  technicianId?: string,
): Promise<void> {
  await db.insert(loginAttempts).values({
    normalizedName,
    ipHash,
    outcome,
    technicianId,
  });
}

async function isLockedOut(normalizedName: string, ipHash: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - LOCKOUT_MS);
  const attempts = await db
    .select({ outcome: loginAttempts.outcome })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.normalizedName, normalizedName),
        eq(loginAttempts.ipHash, ipHash),
        gte(loginAttempts.createdAt, cutoff),
      ),
    )
    .orderBy(desc(loginAttempts.createdAt))
    .limit(MAX_FAILED_ATTEMPTS);

  return attempts.some((attempt) => attempt.outcome === 'locked');
}

async function failedAttemptsSinceLastSuccess(
  normalizedName: string,
  ipHash: string,
): Promise<number> {
  const cutoff = new Date(Date.now() - LOCKOUT_MS);
  const attempts = await db
    .select({ outcome: loginAttempts.outcome })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.normalizedName, normalizedName),
        eq(loginAttempts.ipHash, ipHash),
        gte(loginAttempts.createdAt, cutoff),
      ),
    )
    .orderBy(desc(loginAttempts.createdAt))
    .limit(MAX_FAILED_ATTEMPTS);

  let failures = 0;
  for (const attempt of attempts) {
    if (attempt.outcome === 'success') break;
    if (attempt.outcome === 'failed') failures += 1;
  }
  return failures;
}

async function ipAttemptsInWindow(ipHash: string): Promise<number> {
  const cutoff = new Date(Date.now() - LOCKOUT_MS);
  const attempts = await db
    .select({ id: loginAttempts.id })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.ipHash, ipHash),
        gte(loginAttempts.createdAt, cutoff),
      ),
    )
    .limit(MAX_FAILED_ATTEMPTS * 5);

  return attempts.length;
}

function setSessionCookie(res: Response, token: string): void {
  const { sessionDurationMs } = getSecurityConfig();
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: sessionDurationMs,
    path: '/',
  });
}

function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

router.post('/auth/login', async (req, res, next) => {
  try {
    const input = readLoginBody(req.body);
    const normalizedName = input ? normalizeTechnicianName(input.name) : '';
    const ipHash = hashClientIp(requestIp(req));

    if (!input || !normalizedName) {
      await performDummyAccessCodeVerification();
      await recordAttempt(normalizedName || 'invalid', ipHash, 'failed');
      res.status(INVALID_LOGIN_STATUS).json(INVALID_LOGIN_RESPONSE);
      return;
    }

    const [technician] = await db
      .select()
      .from(technicians)
      .where(eq(technicians.normalizedName, normalizedName))
      .limit(1);

    const [locked, ipThrottled] = await Promise.all([
      isLockedOut(normalizedName, ipHash),
      ipAttemptsInWindow(ipHash),
    ]);
    if (locked || isIpThrottled(ipThrottled)) {
      await performDummyAccessCodeVerification();
      await recordAttempt(normalizedName, ipHash, 'locked', technician?.id);
      res.status(INVALID_LOGIN_STATUS).json(INVALID_LOGIN_RESPONSE);
      return;
    }

    if (!technician) {
      await performDummyAccessCodeVerification();
      const failures = await failedAttemptsSinceLastSuccess(normalizedName, ipHash);
      await recordAttempt(
        normalizedName,
        ipHash,
        shouldLockAfterFailure(failures) ? 'locked' : 'failed',
      );
      res.status(INVALID_LOGIN_STATUS).json(INVALID_LOGIN_RESPONSE);
      return;
    }

    if (!technician.active) {
      await performDummyAccessCodeVerification();
      await recordAttempt(normalizedName, ipHash, 'disabled', technician.id);
      res.status(INVALID_LOGIN_STATUS).json(INVALID_LOGIN_RESPONSE);
      return;
    }

    const validCode = await verifyAccessCode(
      input.accessCode,
      technician.accessCodeHash,
      technician.accessCodeSalt,
    );

    if (!validCode) {
      const failures = await failedAttemptsSinceLastSuccess(normalizedName, ipHash);
      await recordAttempt(
        normalizedName,
        ipHash,
        shouldLockAfterFailure(failures) ? 'locked' : 'failed',
        technician.id,
      );
      res.status(INVALID_LOGIN_STATUS).json(INVALID_LOGIN_RESPONSE);
      return;
    }

    const { token, expiresAt } = await createSession(technician.id);
    await recordAttempt(normalizedName, ipHash, 'success', technician.id);
    setSessionCookie(res, token);

    res.json({
      technician: {
        id: technician.id,
        name: technician.name,
        role: technician.role,
      },
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/logout', requireSameOrigin, async (req, res, next) => {
  try {
    await revokeSession(req.cookies?.[SESSION_COOKIE_NAME]);
    clearSessionCookie(res);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get('/auth/session', async (req, res, next) => {
  try {
    const auth = await getAuthenticatedTechnician(req.cookies?.[SESSION_COOKIE_NAME]);
    if (!auth) {
      clearSessionCookie(res);
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    res.json({
      technician: {
        id: auth.technicianId,
        name: auth.name,
        role: auth.role,
      },
      expiresAt: auth.expiresAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
