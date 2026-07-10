import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Hashes a password using scrypt.
 * Returns a string in the format "scrypt.salt.hash"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `scrypt.${salt}.${derivedKey.toString("hex")}`;
}

/**
 * Verifies a password against a stored hash created by hashPassword.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, salt, hash] = storedHash.split(".");
  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), derivedKey);
}
