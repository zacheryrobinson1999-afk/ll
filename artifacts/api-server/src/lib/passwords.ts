import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';

import { deriveSecurityKey } from './securityConfig';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const DUMMY_SALT = 'cranehub-login-dummy-salt-v2';
const DUMMY_PASSWORD = 'cranehub-dummy-password';
const DUMMY_HASH = Buffer.from('0'.repeat(KEY_LENGTH)).toString('base64url');

export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 128;

export type HashedPassword = {
  hash: string;
  salt: string;
};

export function normalizeUsername(username: string): string {
  return username
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('en-AU');
}

export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH;
}

export async function hashPassword(password: string): Promise<HashedPassword> {
  if (!isValidPassword(password)) {
    throw new Error(`Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`);
  }

  const salt = randomBytes(16).toString('base64url');
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return { hash: Buffer.from(derived).toString('base64url'), salt };
}

/**
 * Verifies both current passwords and legacy four-digit credentials. The legacy
 * credentials remain login-only; all create/reset operations call hashPassword
 * and therefore require a proper password.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  salt: string,
): Promise<boolean> {
  if (!password || password.length > MAX_PASSWORD_LENGTH) {
    await verifyPassword(DUMMY_PASSWORD, DUMMY_HASH, DUMMY_SALT);
    return false;
  }

  const expected = Buffer.from(storedHash, 'base64url');
  const actual = Buffer.from((await scrypt(password, salt, KEY_LENGTH)) as Buffer);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Equalises the slow-hash work for login failures without a real account. */
export async function performDummyPasswordVerification(): Promise<void> {
  await verifyPassword(DUMMY_PASSWORD, DUMMY_HASH, DUMMY_SALT);
}

export function hashClientIp(ip: string): string {
  return createHmac('sha256', deriveSecurityKey('audit-ip-hash'))
    .update(ip, 'utf8')
    .digest('base64url');
}
