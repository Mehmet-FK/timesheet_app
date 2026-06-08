import crypto from "crypto";

const KEY_LENGTH = 64;

function scrypt(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt);
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password, passwordHash) {
  if (!passwordHash) return false;
  const [algorithm, salt, storedHash] = passwordHash.split(":");
  if (algorithm !== "scrypt" || !salt || !storedHash) return false;

  const derivedKey = await scrypt(password, salt);
  const storedBuffer = Buffer.from(storedHash, "hex");

  return storedBuffer.length === derivedKey.length && crypto.timingSafeEqual(storedBuffer, derivedKey);
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function makeSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}
