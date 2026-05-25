import { AuthRRecord, VerificationResult } from './types';
import { verifySignature } from './crypto';
import { runAllInvariants } from './invariants';

export class Verifier {
  private publicKey: CryptoKey;

  constructor(publicKey: CryptoKey) {
    this.publicKey = publicKey;
  }

  async verifyChain(chain: AuthRRecord[]): Promise<VerificationResult> {
    if (chain.length === 0) {
      return {
        verified: false,
        invariants: [],
        error: 'Chain is empty'
      };
    }

    try {
      // 1. Verify signatures of each record using the public key
      const sigsValid: boolean[] = [];
      for (const record of chain) {
        const ok = await verifySignature(record, this.publicKey);
        sigsValid.push(ok);
      }

      // 2. Run all invariants
      const invariants = runAllInvariants(chain, sigsValid);
      const allPassed = invariants.every(inv => inv.passed);

      return {
        verified: allPassed,
        invariants,
        error: allPassed ? undefined : 'One or more invariants failed'
      };
    } catch (e) {
      return {
        verified: false,
        invariants: [],
        error: `Verification system failure: ${(e as Error).message}`
      };
    }
  }
}
