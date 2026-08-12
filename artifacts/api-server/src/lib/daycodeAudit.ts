import { db, daycodeUsage } from '@workspace/db';

export type DaycodeAuditEvent = {
  technicianId: string;
  technicianName: string;
  serial: string | null;
  date: string | null;
  ipHash: string;
  outcome: 'success' | 'denied' | 'validation_failed';
  reason?: string;
};

export async function recordDaycodeUsage(event: DaycodeAuditEvent): Promise<void> {
  await db.insert(daycodeUsage).values({
    technicianId: event.technicianId,
    technicianName: event.technicianName,
    craneSerialNumber: event.serial,
    requestedDate: event.date,
    ipHash: event.ipHash,
    outcome: event.outcome,
    denialReason: event.reason,
  });
}
