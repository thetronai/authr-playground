export interface Grounding {
  referent_type: string;
  verified_at: string;
  verifier: string;
  evidence_digest: string;
}

export interface Author {
  id: string;
  type: string;
  role: string;
  display_name: string;
  grounding: Grounding;
}

export interface ModelManifest {
  code_hash: string;
  model_hash: string;
  model_version: string;
  signer_id: string;
}

export interface Attestation {
  type: string;
  evidence_digest: string;
  verified_at: string;
}

export interface Actor {
  id: string;
  type: string;
  model_manifest: ModelManifest;
  attestation: Attestation;
}

export interface Intent {
  purpose: string;
  statement: string;
  risk_tier: string;
  human_in_the_loop: boolean;
}

export interface ScopeConstraints {
  max_amount: number;
  currency: string;
  max_delegation_depth: number;
}

export interface Scope {
  actions: string[];
  resources: string[];
  constraints: ScopeConstraints;
}

export interface ChainLink {
  authr_id: string;
  depth: number;
  issuer: string;
}

export interface DataSource {
  source_id: string;
  source_hash: string;
  source_type: string;
}

export interface Provenance {
  chain: ChainLink[];
  correlation_id: string;
  data_sources: DataSource[];
}

export interface Drift {
  confidence: number;
  stale_after: string;
  deviation_signals: string[];
}

export interface AuthRSignature {
  alg: string;
  kid: string;
  value: string;
}

export interface AuthRRecord {
  authr_id: string;
  version: string;
  issued_at: string;
  expires_at: string;
  author: Author;
  actor: Actor;
  intent: Intent;
  scope: Scope;
  provenance: Provenance;
  drift: Drift;
  signature?: AuthRSignature;
}

export interface VerificationResult {
  verified: boolean;
  invariants: InvariantResult[];
  error?: string;
}

export interface InvariantResult {
  name: string;
  passed: boolean;
  detail: string;
}

export interface AuditEntry {
  timestamp: string;
  type: 'ROOT ISSUED' | 'HOP ISSUED' | 'CHAIN VERIFIED' | 'ATTACK BLOCKED';
  recordId: string;
  detail: string;
}

export class AuthRError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthRError';
  }
}
