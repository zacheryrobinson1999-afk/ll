import { eq } from 'drizzle-orm';
import { db, technicians } from '@workspace/db';
import { hashAccessCode } from '../lib/accessCodes';
import { readBootstrapAdminInput } from '../lib/bootstrapAdmin';

const { name, normalizedName, accessCode } = readBootstrapAdminInput(process.env);
const [existing] = await db.select({ id: technicians.id }).from(technicians).where(eq(technicians.normalizedName, normalizedName)).limit(1);
if (existing) { console.log('Bootstrap admin already exists; no changes made.'); process.exit(0); }
const hashed = await hashAccessCode(accessCode);
await db.insert(technicians).values({ name, normalizedName, role: 'admin', accessCodeHash: hashed.hash, accessCodeSalt: hashed.salt, accessCodeFingerprint: hashed.fingerprint });
console.log('Bootstrap admin created. Remove BOOTSTRAP_ADMIN_CODE from the environment.');
