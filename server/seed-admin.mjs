import pg from "pg";
import crypto from "node:crypto";
import { promisify } from "node:util";
import "dotenv/config";

const { Pool } = pg;
const scrypt = promisify(crypto.scrypt);

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

async function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt.${salt}.${derivedKey.toString("hex")}`;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    const email = "brianngatia845@gmail.com";
    const password = "B@sketba11";
    const passwordHash = await hashPassword(password);
    const openId = crypto.randomUUID();

    const existing = await client.query(
      'SELECT id FROM "users" WHERE "email" = $1',
      [email]
    );
    if (existing.rows.length > 0) {
      await client.query(
        'UPDATE "users" SET "role" = \'admin\', "passwordHash" = $1, "loginMethod" = \'local\' WHERE "email" = $2',
        [passwordHash, email]
      );
      console.log(`Admin user updated: ${email}`);
    } else {
      await client.query(
        `INSERT INTO "users" ("openId", "name", "email", "loginMethod", "role", "passwordHash", "emailVerified")
         VALUES ($1, $2, $3, 'local', 'admin', $4, true)`,
        [openId, "Brian Ngatia", email, passwordHash]
      );
      console.log(`Admin user created: ${email}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error("Failed to seed admin user:", err);
  process.exit(1);
});
