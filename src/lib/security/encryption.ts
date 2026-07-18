import { createHash, createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 64;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || "ventureforge-default-key-change-in-production-32bytes!";
  return createHash("sha256").update(key).digest();
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  const salt = randomBytes(SALT_LENGTH).toString("hex");

  return `${salt}:${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decrypt(ciphertext: string): string {
  const key = getKey();
  const parts = ciphertext.split(":");

  if (parts.length !== 4) {
    throw new Error("Invalid ciphertext format");
  }

  const [, ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    createHash("sha256")
      .update(salt + password)
      .digest("hex");
    
    const hash = createHash("sha512")
      .update(salt + password)
      .digest("hex");
    
    resolve(`${salt}:${hash}`);
  });
}

export function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const [salt, hash] = storedHash.split(":");
    const computedHash = createHash("sha512")
      .update(salt + password)
      .digest("hex");
    resolve(computedHash === hash);
  });
}

export function generateToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");

  const data = Buffer.from(
    JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 86400000 })
  ).toString("base64url");

  const signature = createHash("sha256")
    .update(`${header}.${data}`)
    .digest("base64url");

  return `${header}.${data}.${signature}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const [header, data, signature] = token.split(".");
    const computedSignature = createHash("sha256")
      .update(`${header}.${data}`)
      .digest("base64url");

    if (signature !== computedSignature) return null;

    const payload = JSON.parse(Buffer.from(data, "base64url").toString());

    if (payload.exp && payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

export function generateApiKey(): string {
  return `vf_${randomBytes(32).toString("hex")}`;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/data:/gi, "")
    .trim();
}

export function generateCSRFToken(): string {
  return randomBytes(32).toString("hex");
}
