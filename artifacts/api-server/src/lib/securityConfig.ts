const MIN_SECRET_LENGTH = 32;

export type SecurityConfig = {
  sessionSecret: string;
  sessionDurationMs: number;
};

function isObviouslyWeakSecret(value: string): boolean {
  return /^(.)\1+$/.test(value) || new Set(value).size < 8;
}

function requireSecret(
  env: NodeJS.ProcessEnv,
  name: 'SESSION_SECRET',
): string {
  const value = env[name];

  if (
    !value ||
    value.length < MIN_SECRET_LENGTH ||
    value.startsWith('change-me') ||
    isObviouslyWeakSecret(value)
  ) {
    throw new Error(`${name} must be set to a random value of at least ${MIN_SECRET_LENGTH} characters`);
  }

  return value;
}

/** Validates all credentials needed before the API begins accepting requests. */
export function validateSecurityConfig(env: NodeJS.ProcessEnv = process.env): SecurityConfig {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set before starting the API server');
  }

  const sessionSecret = requireSecret(env, 'SESSION_SECRET');
  return {
    sessionSecret,
    sessionDurationMs: 8 * 60 * 60 * 1000,
  };
}

export const getSecurityConfig = (): SecurityConfig => validateSecurityConfig();

/** Derives purpose-scoped keys without reusing a root secret directly. */
export function deriveSecurityKey(purpose: string): Buffer {
  return createHmac('sha256', getSecurityConfig().sessionSecret)
    .update(`cranehub:${purpose}`, 'utf8')
    .digest();
}
import { createHmac } from 'node:crypto';
