import { isValidAccessCode, normalizeTechnicianName } from './accessCodes';

export function readBootstrapAdminInput(environment: NodeJS.ProcessEnv): { name: string; normalizedName: string; accessCode: string } {
  const name = environment.BOOTSTRAP_ADMIN_NAME?.trim().replace(/\s+/g, ' ');
  const accessCode = environment.BOOTSTRAP_ADMIN_CODE;
  if (!name || !accessCode || !isValidAccessCode(accessCode)) {
    throw new Error('BOOTSTRAP_ADMIN_NAME and a four-digit BOOTSTRAP_ADMIN_CODE are required');
  }
  return { name, normalizedName: normalizeTechnicianName(name), accessCode };
}
