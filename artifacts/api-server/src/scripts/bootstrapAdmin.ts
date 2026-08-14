import { eq } from 'drizzle-orm';
import { db, technicians } from '@workspace/db';
import { hashPassword } from '../lib/passwords';
import { readBootstrapAdminInput } from '../lib/bootstrapAdmin';

const { name, normalizedName, password } = readBootstrapAdminInput(process.env);
const [existing] = await db.select({ id: technicians.id }).from(technicians).where(eq(technicians.normalizedName, normalizedName)).limit(1);
if (existing) { console.log('Bootstrap admin already exists; no changes made.'); process.exit(0); }
const hashed = await hashPassword(password);
await db.insert(technicians).values({ name, normalizedName, role: 'admin', accessCodeHash: hashed.hash, accessCodeSalt: hashed.salt, accessCodeFingerprint: null });
console.log('Bootstrap admin created. Remove BOOTSTRAP_ADMIN_PASSWORD from the environment.');
