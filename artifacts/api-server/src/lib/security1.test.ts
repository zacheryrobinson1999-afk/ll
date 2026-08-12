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
const { createDocsRouter } = await import('../routes/docs');
const { default: apiRouter } = await import('../routes/index');
const { readTechnicianInput, readTechnicianPatch } = await import('./adminService');
const { assertAdministratorUpdateAllowed, shouldRevokeTechnicianSessions, toSafeTechnician } = await import('./adminService');
const { readBootstrapAdminInput } = await import('./bootstrapAdmin');
const { default: adminRouter } = await import('../routes/admin');

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

test('protected document route authenticates before accessing B2', () => {
  const routerStack = (createDocsRouter() as unknown as { stack: Array<{
    route?: { path?: string; stack: Array<{ handle: unknown }> };
  }> }).stack;
  const documentRoute = routerStack.find((layer) => layer.route?.path === '/docs/:filename')?.route;

  assert.ok(documentRoute);
  assert.equal(documentRoute.stack[0]?.handle, requireAuth);
  assert.equal(typeof documentRoute.stack[1]?.handle, 'function');
});

test('document handler preserves filename validation before B2 retrieval', async () => {
  let b2Calls = 0;
  const routerStack = (createDocsRouter(async () => {
    b2Calls += 1;
    return { Body: undefined } as never;
  }) as unknown as { stack: Array<{
    route?: { path?: string; stack: Array<{ handle: (req: unknown, res: unknown) => Promise<void> }> };
  }> }).stack;
  const documentRoute = routerStack.find((layer) => layer.route?.path === '/docs/:filename')?.route;
  let statusCode = 0;
  const response = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json() {
      return this;
    },
  };

  await documentRoute?.stack[1]?.handle(
    { params: { filename: '../private.pdf' } },
    response,
  );
  assert.equal(statusCode, 400);
  assert.equal(b2Calls, 0);
});

test('authenticated document handler reaches its B2 retrieval dependency', async () => {
  let requestedKey = '';
  const routerStack = (createDocsRouter(async (key) => {
    requestedKey = key;
    return { Body: undefined } as never;
  }) as unknown as { stack: Array<{
    route?: { path?: string; stack: Array<{ handle: (req: unknown, res: unknown) => Promise<void> }> };
  }> }).stack;
  const documentRoute = routerStack.find((layer) => layer.route?.path === '/docs/:filename')?.route;
  const response = {
    status() {
      return this;
    },
    json() {
      return this;
    },
  };

  await documentRoute?.stack[1]?.handle(
    { params: { filename: 'manual.pdf' } },
    response,
  );
  assert.equal(requestedKey, 'docs/manual.pdf');
});

test('the API router has no mounted upload routes', () => {
  const serializedStack = JSON.stringify((apiRouter as unknown as { stack: unknown }).stack);
  assert.doesNotMatch(serializedStack, /uploads/i);
});

test('admin account input normalizes names and only accepts four-digit codes', () => {
  assert.deepEqual(readTechnicianInput({ name: '  Ada   Crane ', accessCode: '1234', role: 'admin' }), {
    name: 'Ada Crane', normalizedName: 'ada crane', accessCode: '1234', role: 'admin',
  });
  assert.throws(() => readTechnicianInput({ name: 'Ada', accessCode: '12345' }));
  assert.throws(() => readTechnicianPatch({ active: 'yes' }));
});

test('admin responses omit access-code material and admin changes revoke sessions when required', () => {
  const safe = toSafeTechnician({ id: 'id', name: 'Ada', normalizedName: 'ada', role: 'technician', active: true, accessCodeHash: 'hash', accessCodeSalt: 'salt', accessCodeFingerprint: 'fingerprint', createdAt: new Date(), updatedAt: new Date() } as never);
  assert.doesNotMatch(JSON.stringify(safe), /hash|salt|fingerprint/);
  assert.equal(shouldRevokeTechnicianSessions({ active: false }), true);
  assert.equal(shouldRevokeTechnicianSessions({ codeReset: true }), true);
  assert.equal(shouldRevokeTechnicianSessions({ active: true }), false);
});

test('administrator lockout policy protects self and the last active administrator', () => {
  const self = { id: 'admin-1', role: 'admin' as const, active: true };
  assert.throws(() => assertAdministratorUpdateAllowed({ actorId: 'admin-1', target: self, patch: { active: false }, activeAdminCount: 2 }), /cannot disable your own/);
  assert.throws(() => assertAdministratorUpdateAllowed({ actorId: 'admin-2', target: self, patch: { active: false }, activeAdminCount: 1 }), /At least one active administrator/);
  assert.throws(() => assertAdministratorUpdateAllowed({ actorId: 'admin-2', target: self, patch: { role: 'technician' }, activeAdminCount: 1 }), /At least one active administrator/);
});

test('administrator lockout policy permits safe admin and technician status changes', () => {
  assert.doesNotThrow(() => assertAdministratorUpdateAllowed({ actorId: 'admin-2', target: { id: 'admin-1', role: 'admin', active: true }, patch: { active: false }, activeAdminCount: 2 }));
  assert.doesNotThrow(() => assertAdministratorUpdateAllowed({ actorId: 'admin-1', target: { id: 'tech-1', role: 'technician', active: true }, patch: { active: false }, activeAdminCount: 1 }));
});

test('bootstrap admin requires explicit values and normalizes its name', () => {
  assert.throws(() => readBootstrapAdminInput({}));
  assert.deepEqual(readBootstrapAdminInput({ BOOTSTRAP_ADMIN_NAME: '  First  Admin ', BOOTSTRAP_ADMIN_CODE: '5678' }), {
    name: 'First Admin', normalizedName: 'first admin', accessCode: '5678',
  });
});

test('every admin endpoint has authentication and administrator middleware first', () => {
  const stack = (adminRouter as unknown as { stack: Array<{ handle: unknown }> }).stack;
  assert.equal(stack[0]?.handle, requireAuth);
  assert.equal(stack[1]?.handle, requireAdmin);
});
