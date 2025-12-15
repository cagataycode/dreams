/**
 * Client-side encryption utilities using Web Crypto API
 * All encryption/decryption happens in the browser - the server never sees plaintext
 */

// Convert ArrayBuffer to base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate a random salt for PBKDF2
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return arrayBufferToBase64(salt.buffer);
}

// Generate a random IV for AES-GCM
export function generateIV(): string {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  return arrayBufferToBase64(iv.buffer);
}

// Derive an encryption key from a passphrase using PBKDF2
async function deriveKey(passphrase: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const saltBuffer = base64ToArrayBuffer(salt);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    passphraseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface EncryptedData {
  encryptedData: string; // base64 encoded ciphertext
  salt: string; // base64 encoded salt
  iv: string; // base64 encoded IV
}

/**
 * Encrypt data with a passphrase
 * Returns encrypted data along with salt and IV needed for decryption
 */
export async function encrypt(
  plaintext: string,
  passphrase: string
): Promise<EncryptedData> {
  const salt = generateSalt();
  const iv = generateIV();

  const key = await deriveKey(passphrase, salt);
  const encoder = new TextEncoder();

  const ivBuffer = base64ToArrayBuffer(iv);
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer,
    },
    key,
    encoder.encode(plaintext)
  );

  return {
    encryptedData: arrayBufferToBase64(encrypted),
    salt,
    iv,
  };
}

/**
 * Decrypt data with a passphrase
 * Requires the same salt and IV that were used during encryption
 */
export async function decrypt(
  encryptedData: string,
  passphrase: string,
  salt: string,
  iv: string
): Promise<string> {
  const key = await deriveKey(passphrase, salt);
  const ivBuffer = base64ToArrayBuffer(iv);
  const encryptedBuffer = base64ToArrayBuffer(encryptedData);

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBuffer,
      },
      key,
      encryptedBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch {
    throw new Error(
      "Decryption failed - incorrect passphrase or corrupted data"
    );
  }
}

/**
 * Verify if a passphrase can decrypt the given encrypted data
 */
export async function verifyPassphrase(
  encryptedData: string,
  passphrase: string,
  salt: string,
  iv: string
): Promise<boolean> {
  try {
    await decrypt(encryptedData, passphrase, salt, iv);
    return true;
  } catch {
    return false;
  }
}
