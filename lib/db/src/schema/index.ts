import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const technicianRole = pgEnum('technician_role', [
  'technician',
  'admin',
]);

export const loginAttemptOutcome = pgEnum('login_attempt_outcome', [
  'success',
  'failed',
  'disabled',
  'locked',
]);

export const daycodeUsageOutcome = pgEnum('daycode_usage_outcome', [
  'success',
  'denied',
  'validation_failed',
]);

export const technicians = pgTable(
  'technicians',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    role: technicianRole('role').notNull().default('technician'),
    active: boolean('active').notNull().default(true),
    accessCodeHash: text('access_code_hash').notNull(),
    accessCodeSalt: text('access_code_salt').notNull(),
    // Legacy column retained for a safe rollout. Passwords never receive a
    // reversible or deterministic fingerprint; new rows store NULL here.
    accessCodeFingerprint: text('access_code_fingerprint'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('technicians_normalized_name_unique').on(table.normalizedName),
  ],
);

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    technicianId: uuid('technician_id')
      .notNull()
      .references(() => technicians.id),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('sessions_token_hash_unique').on(table.tokenHash),
    index('sessions_technician_id_idx').on(table.technicianId),
    index('sessions_expires_at_idx').on(table.expiresAt),
  ],
);

export const loginAttempts = pgTable(
  'login_attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    technicianId: uuid('technician_id').references(() => technicians.id),
    normalizedName: text('normalized_name').notNull(),
    ipHash: text('ip_hash').notNull(),
    outcome: loginAttemptOutcome('outcome').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('login_attempts_name_created_at_idx').on(
      table.normalizedName,
      table.createdAt,
    ),
    index('login_attempts_technician_created_at_idx').on(
      table.technicianId,
      table.createdAt,
    ),
  ],
);

export const daycodeUsage = pgTable(
  'daycode_usage',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    technicianId: uuid('technician_id').references(() => technicians.id),
    technicianName: text('technician_name').notNull(),
    craneSerialNumber: text('crane_serial_number'),
    requestedDate: text('requested_date'),
    outcome: daycodeUsageOutcome('outcome').notNull(),
    denialReason: text('denial_reason'),
    ipHash: text('ip_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('daycode_usage_created_at_idx').on(table.createdAt),
    index('daycode_usage_technician_created_at_idx').on(
      table.technicianId,
      table.createdAt,
    ),
    index('daycode_usage_serial_created_at_idx').on(
      table.craneSerialNumber,
      table.createdAt,
    ),
  ],
);
