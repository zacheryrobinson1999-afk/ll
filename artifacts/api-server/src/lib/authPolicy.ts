export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000;
export const MAX_IP_ATTEMPTS = 20;

export function shouldLockAfterFailure(failureCount: number): boolean {
  return failureCount + 1 >= MAX_FAILED_ATTEMPTS;
}

export function isIpThrottled(attemptCount: number): boolean {
  return attemptCount >= MAX_IP_ATTEMPTS;
}

export const INVALID_LOGIN_STATUS = 401;
export const INVALID_LOGIN_RESPONSE = { error: 'Invalid username or password' };

export function isSessionUsable(session: {
  active: boolean;
  expiresAt: Date;
  revokedAt: Date | null;
}, now = new Date()): boolean {
  return session.active && !session.revokedAt && session.expiresAt > now;
}
