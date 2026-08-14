import { isValidPassword, normalizeUsername } from './passwords';

export function readBootstrapAdminInput(environment: NodeJS.ProcessEnv): { name: string; normalizedName: string; password: string } {
  const name = environment.BOOTSTRAP_ADMIN_NAME?.trim().replace(/\s+/g, ' ');
  const password = environment.BOOTSTRAP_ADMIN_PASSWORD;
  if (!name || !password || !isValidPassword(password)) {
    throw new Error('BOOTSTRAP_ADMIN_NAME and a 10 to 128 character BOOTSTRAP_ADMIN_PASSWORD are required');
  }
  return { name, normalizedName: normalizeUsername(name), password };
}
