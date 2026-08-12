import { and, count, desc, eq, gte, ilike, lte } from 'drizzle-orm';
import { db, daycodeUsage, technicians } from '@workspace/db';

import { hashAccessCode, isValidAccessCode, normalizeTechnicianName } from './accessCodes';
import { revokeTechnicianSessions } from './sessions';

export type TechnicianRole = 'technician' | 'admin';

export type SafeTechnician = {
  id: string;
  name: string;
  role: TechnicianRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function shouldRevokeTechnicianSessions(change: { active?: boolean; codeReset?: boolean }): boolean {
  return change.active === false || change.codeReset === true;
}

export function assertAdministratorUpdateAllowed(input: {
  actorId: string;
  target: { id: string; role: TechnicianRole; active: boolean };
  patch: { role?: TechnicianRole; active?: boolean };
  activeAdminCount: number;
}): void {
  const isRemovingActiveAdmin = input.target.role === 'admin' && input.target.active
    && (input.patch.active === false || input.patch.role === 'technician');
  if (!isRemovingActiveAdmin) return;
  if (input.target.id === input.actorId && input.patch.active === false) {
    throw new Error('You cannot disable your own administrator account.');
  }
  if (input.activeAdminCount <= 1) {
    throw new Error('At least one active administrator must remain.');
  }
}

export function toSafeTechnician(row: typeof technicians.$inferSelect): SafeTechnician {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    active: row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function readTechnicianInput(body: unknown): { name: string; normalizedName: string; accessCode: string; role: TechnicianRole } {
  if (!body || typeof body !== 'object') throw new Error('Invalid technician details');
  const value = body as Record<string, unknown>;
  const name = typeof value.name === 'string' ? value.name.trim().replace(/\s+/g, ' ') : '';
  const accessCode = typeof value.accessCode === 'string' ? value.accessCode : '';
  const role = value.role === 'admin' ? 'admin' : value.role === undefined || value.role === 'technician' ? 'technician' : null;
  if (!name || name.length > 160 || !role || !isValidAccessCode(accessCode)) {
    throw new Error('Name, role, and a four-digit access code are required');
  }
  return { name, normalizedName: normalizeTechnicianName(name), accessCode, role };
}

export function readTechnicianPatch(body: unknown): { name?: string; normalizedName?: string; role?: TechnicianRole; active?: boolean } {
  if (!body || typeof body !== 'object') throw new Error('Invalid technician details');
  const value = body as Record<string, unknown>;
  const patch: { name?: string; normalizedName?: string; role?: TechnicianRole; active?: boolean } = {};
  if ('name' in value) {
    if (typeof value.name !== 'string') throw new Error('Invalid technician name');
    const name = value.name.trim().replace(/\s+/g, ' ');
    if (!name || name.length > 160) throw new Error('Invalid technician name');
    patch.name = name;
    patch.normalizedName = normalizeTechnicianName(name);
  }
  if ('role' in value) {
    if (value.role !== 'technician' && value.role !== 'admin') throw new Error('Invalid technician role');
    patch.role = value.role;
  }
  if ('active' in value) {
    if (typeof value.active !== 'boolean') throw new Error('Invalid technician status');
    patch.active = value.active;
  }
  if (!Object.keys(patch).length) throw new Error('No technician changes supplied');
  return patch;
}

export async function createTechnician(input: ReturnType<typeof readTechnicianInput>): Promise<SafeTechnician> {
  const code = await hashAccessCode(input.accessCode);
  const [created] = await db.insert(technicians).values({
    name: input.name, normalizedName: input.normalizedName, role: input.role,
    accessCodeHash: code.hash, accessCodeSalt: code.salt, accessCodeFingerprint: code.fingerprint,
  }).returning();
  return toSafeTechnician(created!);
}

export async function updateTechnician(actorId: string, id: string, patch: ReturnType<typeof readTechnicianPatch>): Promise<SafeTechnician | null> {
  const [target] = await db.select({ id: technicians.id, role: technicians.role, active: technicians.active })
    .from(technicians).where(eq(technicians.id, id)).limit(1);
  if (!target) return null;
  if (target.role === 'admin' && target.active && (patch.active === false || patch.role === 'technician')) {
    const [result] = await db.select({ total: count() }).from(technicians)
      .where(and(eq(technicians.role, 'admin'), eq(technicians.active, true)));
    assertAdministratorUpdateAllowed({ actorId, target, patch, activeAdminCount: Number(result?.total ?? 0) });
  }
  const [updated] = await db.update(technicians).set(patch).where(eq(technicians.id, id)).returning();
  if (updated && shouldRevokeTechnicianSessions(patch)) await revokeTechnicianSessions(id);
  return updated ? toSafeTechnician(updated) : null;
}

export async function resetTechnicianCode(id: string, accessCode: string): Promise<SafeTechnician | null> {
  if (!isValidAccessCode(accessCode)) throw new Error('A four-digit access code is required');
  const code = await hashAccessCode(accessCode);
  const [updated] = await db.update(technicians).set({
    accessCodeHash: code.hash, accessCodeSalt: code.salt, accessCodeFingerprint: code.fingerprint,
  }).where(eq(technicians.id, id)).returning();
  if (updated && shouldRevokeTechnicianSessions({ codeReset: true })) await revokeTechnicianSessions(id);
  return updated ? toSafeTechnician(updated) : null;
}

export async function listDaycodeUsage(filters: { technician?: string; serial?: string; outcome?: 'success' | 'denied' | 'validation_failed'; from?: Date; to?: Date; limit: number; offset: number }) {
  const conditions = [];
  if (filters.technician) conditions.push(ilike(daycodeUsage.technicianName, `%${filters.technician}%`));
  if (filters.serial) conditions.push(eq(daycodeUsage.craneSerialNumber, filters.serial));
  if (filters.outcome) conditions.push(eq(daycodeUsage.outcome, filters.outcome));
  if (filters.from) conditions.push(gte(daycodeUsage.createdAt, filters.from));
  if (filters.to) conditions.push(lte(daycodeUsage.createdAt, filters.to));
  return db.select({ id: daycodeUsage.id, technicianName: daycodeUsage.technicianName, craneSerialNumber: daycodeUsage.craneSerialNumber, requestedDate: daycodeUsage.requestedDate, outcome: daycodeUsage.outcome, denialReason: daycodeUsage.denialReason, createdAt: daycodeUsage.createdAt })
    .from(daycodeUsage).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(daycodeUsage.createdAt)).limit(filters.limit).offset(filters.offset);
}
