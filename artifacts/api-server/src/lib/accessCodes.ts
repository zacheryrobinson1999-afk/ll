import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';

import { deriveSecurityKey, getSecurityConfig } from './securityConfig';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const DUMMY_SALT = 'cranehub-login-dummy-salt-v1';
const DUMMY_HASH = Buffer.from('0'.repeat(KEY_LENGTH)).toString('base64url');

export type HashedAccessCode = {
  hash: string;
  salt: string;
  fingerprint: string;
};

export function normalizeTechnicianName(name: string): string {
  return name
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('en-AU');
}

export function isValidAccessCode(code: string): boolean {
  return /^\d{4}$/.test(code);
}

function fingerprintAccessCode(code: string): string {
  return createHmac('sha256', getSecurityConfig().accessCodePepper)
    .update(code, 'utf8')
    .digest('base64url');
}

export async function hashAccessCode(code: string): Promise<HashedAccessCode> {
  if (!isValidAccessCode(code)) {
    throw new Error('Access codes must contain exactly four digits');
  }

  const salt = randomBytes(16).toString('base64url');
  const derived = (await scrypt(code, salt, KEY_LENGTH)) as Buffer;

  return {
    hash: Buffer.from(derived).toString('base64url'),
    salt,
    fingerprint: fingerprintAccessCode(code),
  };
}

export async function verifyAccessCode(
  code: string,
  storedHash: string,
  salt: string,
): Promise<boolean> {
  if (!isValidAccessCode(code)) {
    await verifyAccessCode('0000', DUMMY_HASH, DUMMY_SALT);
    return false;
  }

  const expected = Buffer.from(storedHash, 'base64url');
  const actual = Buffer.from((await scrypt(code, salt, KEY_LENGTH)) as Buffer);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Equalises the slow-hash work for login failures without a real technician. */
export async function performDummyAccessCodeVerification(): Promise<void> {
  await verifyAccessCode('0000', DUMMY_HASH, DUMMY_SALT);
}

export function hashClientIp(ip: string): string {
  return createHmac('sha256', deriveSecurityKey('audit-ip-hash'))
    .update(ip, 'utf8')
    .digest('base64url');
}
