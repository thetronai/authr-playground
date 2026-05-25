import { AuthRRecord, AuthRSignature } from './types';
import { canonicalBytes } from './canonical';

export interface KeyPair {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
}

export async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'Ed25519' },
    true,
    ['sign', 'verify']
  );
  return keyPair as KeyPair;
}

export function signablePayload(record: AuthRRecord): Uint8Array {
  // Remove signature field before signing - same as Python _signable_payload()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { signature, ...recordWithoutSig } = record;
  return canonicalBytes(recordWithoutSig);
}

export async function signRecord(
  record: AuthRRecord,
  privateKey: CryptoKey,
  kid: string
): Promise<AuthRSignature> {
  const payload = signablePayload(record);
  const sigBytes = await crypto.subtle.sign('Ed25519', privateKey, payload as any);
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sigBytes)));
  return { alg: 'EdDSA', kid, value: sigB64 };
}

export async function verifySignature(
  record: AuthRRecord,
  publicKey: CryptoKey
): Promise<boolean> {
  if (!record.signature) return false;
  const payload = signablePayload(record);
  try {
    const sigBytes = Uint8Array.from(atob(record.signature.value), c => c.charCodeAt(0));
    return await crypto.subtle.verify('Ed25519', publicKey, sigBytes, payload as any);
  } catch (e) {
    console.error('Signature verification error:', e);
    return false;
  }
}

