import { createHmac, randomBytes } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db, sessions, technicians } from '@workspace/db';

import { getSecurityConfig } from './securityConfig';
import { isSessionUsable } from './authPolicy';

export const SESSION_COOKIE_NAME = 'cranehub_session';

export type AuthenticatedTechnician = {
  sessionId: string;
  technicianId: string;
  name: string;
  role: 'technician' | 'admin';
  expiresAt: Date;
};

function hashSessionToken(token: string): string {
  return createHmac('sha256', getSecurityConfig().sessionSecret)
    .update(token, 'utf8')
    .digest('base64url');
}

export async function createSession(technicianId: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + getSecurityConfig().sessionDurationMs);

  await db.insert(sessions).values({
    technicianId,
    tokenHash: hashSessionToken(token),
    expiresAt,
  });

  return { token, expiresAt };
}

export async function getAuthenticatedTechnician(
  token: string | undefined,
): Promise<AuthenticatedTechnician | null> {
  if (!token) return null;

  const [row] = await db
    .select({
      sessionId: sessions.id,
      technicianId: technicians.id,
      name: technicians.name,
      role: technicians.role,
      active: technicians.active,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(technicians, eq(sessions.technicianId, technicians.id))
    .where(
      and(
        eq(sessions.tokenHash, hashSessionToken(token)),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!row || !isSessionUsable({ ...row, revokedAt: null })) return null;

  await db
    .update(sessions)
    .set({ lastUsedAt: new Date() })
    .where(eq(sessions.id, row.sessionId));

  return {
    sessionId: row.sessionId,
    technicianId: row.technicianId,
    name: row.name,
    role: row.role,
    expiresAt: row.expiresAt,
  };
}

export async function revokeSession(token: string | undefined): Promise<void> {
  if (!token) return;

  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(sessions.tokenHash, hashSessionToken(token)),
        isNull(sessions.revokedAt),
      ),
    );
}
