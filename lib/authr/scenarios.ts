import { Author, Actor, Intent, Scope } from './types';

export const CfoAuthor: Author = {
  id: 'did:web:acme.com:people:jane-doe',
  type: 'Verified Digital Twin',
  role: 'CFO',
  display_name: 'Jane Doe (CFO)',
  grounding: {
    referent_type: 'Verified Digital Twin',
    verified_at: '2026-05-25T11:00:00Z',
    verifier: 'acme-hrms',
    evidence_digest: 'sha256:d8c2c8f6153a60a8a6889e47f9fa688bfb512c125df9d2427a19280d287bc129',
  },
};

export const OrchestratorActor: Actor = {
  id: 'spiffe://acme.com/agents/treasury-orchestrator/instance-42',
  type: 'TEE-Attested Agent',
  model_manifest: {
    code_hash: 'sha256:5f4dcc3b5aa765d61d8327deb882cf99b9e67dcd7e8cf058e57849e6f3326129',
    model_hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    model_version: 'gpt-4o-2024-05-13',
    signer_id: 'did:web:acme.com:security:agent-signer',
  },
  attestation: {
    type: 'AMD-SEV-SNP',
    evidence_digest: 'sha256:9a3f4e3c98d6c701bc20140d342013f990b7931cde92a2a0ef19e27c1264c8f5',
    verified_at: '2026-05-25T11:30:00Z',
  },
};

export const OrchestratorIntent: Intent = {
  purpose: 'approve_wire_transfer',
  statement: 'Release Q2 supplier payment per approved schedule; halt if variance > 5% or counterparty changed in last 48h.',
  risk_tier: 'HIGH',
  human_in_the_loop: true,
};

export const OrchestratorScope: Scope = {
  actions: ['wire.prepare', 'wire.validate', 'wire.approve', 'wire.submit'],
  resources: ['account:acme-opex-7788', 'counterparty:acme-supplies'],
  constraints: {
    max_amount: 250000,
    currency: 'USD',
    max_delegation_depth: 2,
  },
};

export const ValidatorActor: Actor = {
  id: 'spiffe://acme.com/agents/wire-validator/instance-88',
  type: 'TEE-Attested Agent',
  model_manifest: {
    code_hash: 'sha256:2f9d8a3d46a81e3a6c125df9d2427a19280d287bc129b8c2c8f6153a60a8a688',
    model_hash: 'sha256:7f4c5e3d98fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    model_version: 'claude-3-5-sonnet-20240620',
    signer_id: 'did:web:acme.com:security:agent-signer',
  },
  attestation: {
    type: 'Intel-SGX',
    evidence_digest: 'sha256:b1d8f76e3c98d6c701bc20140d342013f990b7931cde92a2a0ef19e27c1264c8f',
    verified_at: '2026-05-25T11:32:00Z',
  },
};

export const ValidatorScope: Scope = {
  actions: ['wire.prepare', 'wire.validate'],
  resources: ['account:acme-opex-7788', 'counterparty:acme-supplies'],
  constraints: {
    max_amount: 250000,
    currency: 'USD',
    max_delegation_depth: 1,
  },
};

// Compromised scope attempt in Step 4
export const CompromisedScope: Scope = {
  actions: ['wire.prepare', 'wire.validate', 'wire.cancel'],
  resources: ['account:acme-opex-7788', 'counterparty:acme-supplies'],
  constraints: {
    max_amount: 250000,
    currency: 'USD',
    max_delegation_depth: 1,
  },
};
