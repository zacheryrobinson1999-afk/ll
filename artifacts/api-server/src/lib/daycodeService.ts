import { generateDailyCodes, validateDailyCodeInput, type DailyCodeResult } from './dailyCodes';
import type { DaycodeAuditEvent } from './daycodeAudit';

type AuditWriter = (event: DaycodeAuditEvent) => Promise<void>;

export async function generateAuditedDaycodes(
  input: { serial: string; date: string },
  audit: Omit<DaycodeAuditEvent, 'serial' | 'date' | 'outcome' | 'reason'>,
  writeAudit: AuditWriter,
): Promise<DailyCodeResult> {
  let validated: { serial: string; date: string };
  try {
    validated = validateDailyCodeInput(input.serial, input.date);
  } catch (error) {
    await writeAudit({
      ...audit,
      serial: typeof input.serial === 'string' ? input.serial.slice(0, 64) : null,
      date: typeof input.date === 'string' ? input.date.slice(0, 16) : null,
      outcome: 'validation_failed',
      reason: 'invalid_input',
    });
    throw error;
  }

  const result = generateDailyCodes(validated.serial, validated.date);
  await writeAudit({
    ...audit,
    serial: validated.serial,
    date: validated.date,
    outcome: 'success',
  });
  return result;
}
