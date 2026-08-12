import assert from 'node:assert/strict';
import test from 'node:test';

process.env.SESSION_SECRET = 'session-test-secret-7f42a9c8d1e0b6f5a4c3d2e1';
process.env.ACCESS_CODE_PEPPER = 'pepper-test-secret-c9e8d7f6a5b4c3d2e1f0a9b8';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

const {
  hashAccessCode,
  performDummyAccessCodeVerification,
  verifyAccessCode,
} = await import('./accessCodes');
const { validateSecurityConfig } = await import('./securityConfig');
const {
  INVALID_LOGIN_RESPONSE,
  INVALID_LOGIN_STATUS,
  MAX_FAILED_ATTEMPTS,
  MAX_IP_ATTEMPTS,
  isIpThrottled,
  isSessionUsable,
  shouldLockAfterFailure,
} = await import(
  './authPolicy'
);
const { requireAdmin, requireAuth } = await import('../middleware/auth');
const { hasSameOrigin } = await import('../middleware/sameOrigin');
const { technicians } = await import('@workspace/db');
const { generateDailyCodes, validateDailyCodeInput } = await import('./dailyCodes');
const { generateAuditedDaycodes } = await import('./daycodeService');

test('valid access code verifies against a salted scrypt hash', async () => {
  const stored = await hashAccessCode('1234');

  assert.notEqual(stored.hash, '1234');
  assert.notEqual(stored.salt, '1234');
  assert.equal(await verifyAccessCode('1234', stored.hash, stored.salt), true);
});

test('wrong access code is rejected', async () => {
  const stored = await hashAccessCode('1234');

  assert.equal(await verifyAccessCode('9999', stored.hash, stored.salt), false);
});

test('dummy scrypt verification runs for early login failures', async () => {
  await assert.doesNotReject(performDummyAccessCodeVerification());
  const stored = await hashAccessCode('1234');
  assert.equal(await verifyAccessCode('not-a-pin', stored.hash, stored.salt), false);
});

test('identical and obviously repeated secrets are rejected', () => {
  const base = {
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    SESSION_SECRET: 'session-validation-secret-7f42a9c8d1e0b6f5a4c3d2e1',
    ACCESS_CODE_PEPPER: 'pepper-validation-secret-c9e8d7f6a5b4c3d2e1f0a9b8',
  };

  assert.throws(() => validateSecurityConfig({ ...base, ACCESS_CODE_PEPPER: base.SESSION_SECRET }));
  assert.throws(() => validateSecurityConfig({ ...base, SESSION_SECRET: 'x'.repeat(48) }));
});

test('lockout begins on the configured failed-attempt threshold', () => {
  assert.equal(shouldLockAfterFailure(MAX_FAILED_ATTEMPTS - 2), false);
  assert.equal(shouldLockAfterFailure(MAX_FAILED_ATTEMPTS - 1), true);
});

test('per-IP throttle begins at the documented 20 attempts per 15 minutes', () => {
  assert.equal(isIpThrottled(MAX_IP_ATTEMPTS - 1), false);
  assert.equal(isIpThrottled(MAX_IP_ATTEMPTS), true);
});

test('all login failures share one generic status and response policy', () => {
  assert.equal(INVALID_LOGIN_STATUS, 401);
  assert.deepEqual(INVALID_LOGIN_RESPONSE, { error: 'Invalid name or access code' });
});

test('disabled, expired, and revoked sessions are unusable', () => {
  const future = new Date(Date.now() + 60_000);
  const past = new Date(Date.now() - 60_000);

  assert.equal(isSessionUsable({ active: false, expiresAt: future, revokedAt: null }), false);
  assert.equal(isSessionUsable({ active: true, expiresAt: past, revokedAt: null }), false);
  assert.equal(isSessionUsable({ active: true, expiresAt: future, revokedAt: new Date() }), false);
  assert.equal(isSessionUsable({ active: true, expiresAt: future, revokedAt: null }), true);
});

test('admin middleware rejects technicians and permits administrators', () => {
  let statusCode = 0;
  let nextCalled = false;
  const response = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json() {
      return this;
    },
  };

  requireAdmin({ auth: { role: 'technician' } } as never, response as never, () => {
    nextCalled = true;
  });
  assert.equal(statusCode, 403);
  assert.equal(nextCalled, false);

  requireAdmin({ auth: { role: 'admin' } } as never, response as never, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);
});

test('authentication middleware rejects requests without a session token', async () => {
  let statusCode = 0;
  let nextCalled = false;
  const response = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json() {
      return this;
    },
  };

  await requireAuth({ cookies: {} } as never, response as never, () => {
    nextCalled = true;
  });
  assert.equal(statusCode, 401);
  assert.equal(nextCalled, false);
});

test('same-origin validation accepts Render-proxied HTTPS and rejects other origins', () => {
  const request = (origin: string) => ({
    protocol: 'https',
    get: (header: string) => (header === 'origin' ? origin : 'cranehub.example.com'),
  });

  assert.equal(hasSameOrigin(request('https://cranehub.example.com') as never), true);
  assert.equal(hasSameOrigin(request('https://attacker.example') as never), false);
  assert.equal(hasSameOrigin(request('') as never), false);
});

test('technician updated_at is configured to update through Drizzle writes', () => {
  const updatedAt = technicians.updatedAt as unknown as { onUpdateFn?: () => unknown };
  assert.equal(typeof updatedAt.onUpdateFn, 'function');
});

test('server daycode generator preserves the existing known LICCON result', () => {
  assert.deepEqual(generateDailyCodes('123456', '010126'), {
    first: '3017',
    second: '2020',
  });
});

test('server daycode validation rejects invalid serials and impossible dates', () => {
  assert.throws(() => validateDailyCodeInput('12AB', '010126'));
  assert.throws(() => validateDailyCodeInput('123456', '310226'));
});

test('daycode audit is persisted before a generated code is released', async () => {
  const events: unknown[] = [];
  const result = await generateAuditedDaycodes(
    { serial: '123456', date: '010126' },
    { technicianId: '00000000-0000-0000-0000-000000000001', technicianName: 'Test Tech', ipHash: 'ip' },
    async (event) => {
      events.push(event);
    },
  );

  assert.deepEqual(result, { first: '3017', second: '2020' });
  assert.deepEqual(events, [{
    technicianId: '00000000-0000-0000-0000-000000000001',
    technicianName: 'Test Tech',
    ipHash: 'ip',
    serial: '123456',
    date: '010126',
    outcome: 'success',
  }]);
  assert.doesNotMatch(JSON.stringify(events), /3017|2020/);
});

test('audit failures prevent a generated code from being released', async () => {
  await assert.rejects(
    generateAuditedDaycodes(
      { serial: '123456', date: '010126' },
      { technicianId: '00000000-0000-0000-0000-000000000001', technicianName: 'Test Tech', ipHash: 'ip' },
      async () => { throw new Error('audit unavailable'); },
    ),
    /audit unavailable/,
  );
});

test('invalid authenticated daycode requests are audited without generated codes', async () => {
  const events: unknown[] = [];
  await assert.rejects(
    generateAuditedDaycodes(
      { serial: 'bad', date: '010126' },
      { technicianId: '00000000-0000-0000-0000-000000000001', technicianName: 'Test Tech', ipHash: 'ip' },
      async (event) => { events.push(event); },
    ),
  );
  assert.deepEqual(events, [{
    technicianId: '00000000-0000-0000-0000-000000000001',
    technicianName: 'Test Tech',
    ipHash: 'ip',
    serial: 'bad',
    date: '010126',
    outcome: 'validation_failed',
    reason: 'invalid_input',
  }]);
});
