import dns from 'dns';

// 1. Force Node.js to use public DNS servers instead of Replit's default dns
dns.setServers(['8.8.8.8', '1.1.1.1']);

// 2. Intercept and override lookups for your specific Backblaze region
const originalLookup = dns.lookup;
// @ts-ignore
dns.lookup = function(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  // If the app tries to find Backblaze, instantly hand it the raw IP addresses
  if (hostname === '://backblazeb2.com') {
    // Backblaze US-East IP pool cluster addresses
    const b2IPs = ['104.153.233.130', '104.153.232.130'];
    const selectedIP = b2IPs[Math.floor(Math.random() * b2IPs.length)];

    // @ts-ignore — intentional overload to short-circuit B2 DNS
    return callback(null, selectedIP, 4); 
  }

  // Fallback to normal lookup for everything else (like databases or packages)
  // @ts-ignore — intentional overload passthrough
  return originalLookup.call(dns, hostname, options, callback);
};

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";


