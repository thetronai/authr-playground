import { Author, Actor, Intent, Scope, DataSource, AuthRRecord,
         Provenance, Drift, ChainLink } from './types';
import { KeyPair, generateKeyPair, signRecord } from './crypto';
import { assertScopeNarrows } from './invariants';

function newId(): string {
  return `urn:authr:${crypto.randomUUID()}`;
}

function now(): string {
  return new Date().toISOString().replace('.000Z', 'Z');
}

function inMinutes(m: number): string {
  return new Date(Date.now() + m * 60000).toISOString().replace('.000Z', 'Z');
}

export class IssuingAuthority {
  private keyPair: KeyPair | null = null;
  public kid: string;

  constructor(kid: string = 'authr-issuer-key-1') {
    this.kid = kid;
  }

  async initialize(): Promise<void> {
    this.keyPair = await generateKeyPair();
  }

  getPublicKey(): CryptoKey {
    if (!this.keyPair) throw new Error('Not initialized - call initialize() first');
    return this.keyPair.publicKey;
  }

  async issueRoot(params: {
    author: Author;
    actor: Actor;
    intent: Intent;
    scope: Scope;
    dataSources?: DataSource[];
    correlationId?: string;
    confidence?: number;
    ttlMinutes?: number;
  }): Promise<AuthRRecord> {
    if (!this.keyPair) throw new Error('Not initialized');

    const { author, actor, intent, scope,
            dataSources = [], correlationId, confidence = 0.97, ttlMinutes = 30 } = params;

    const record: AuthRRecord = {
      authr_id: newId(),
      version: '0.1',
      issued_at: now(),
      expires_at: inMinutes(ttlMinutes),
      author,
      actor,
      intent,
      scope,
      provenance: {
        chain: [],
        correlation_id: correlationId ?? `corr-${crypto.randomUUID()}`,
        data_sources: dataSources,
      },
      drift: {
        confidence,
        stale_after: inMinutes(ttlMinutes),
        deviation_signals: [],
      },
    };

    record.signature = await signRecord(record, this.keyPair.privateKey, this.kid);
    return record;
  }

  async extend(params: {
    parent: AuthRRecord;
    actor: Actor;
    attenuatedScope: Scope;
    confidence?: number;
  }): Promise<AuthRRecord> {
    if (!this.keyPair) throw new Error('Not initialized');

    const { parent, actor, attenuatedScope, confidence = 0.95 } = params;

    // Check scope narrowing
    assertScopeNarrows(parent.scope, attenuatedScope);

    // Build chain link from parent
    const link: ChainLink = {
      authr_id: parent.authr_id,
      depth: parent.provenance.chain.length,
      issuer: this.kid,
    };

    const record: AuthRRecord = {
      authr_id: newId(),
      version: '0.1',
      issued_at: now(),
      expires_at: parent.expires_at, // inherits expiry from parent
      author: parent.author,         // reference identical author
      actor,
      intent: parent.intent,         // inherits intent
      scope: attenuatedScope,
      provenance: {
        chain: [...parent.provenance.chain, link],
        correlation_id: parent.provenance.correlation_id, // inherits correlation ID
        data_sources: [],
      },
      drift: {
        confidence,
        stale_after: parent.expires_at,
        deviation_signals: [],
      },
    };

    record.signature = await signRecord(record, this.keyPair.privateKey, this.kid);
    return record;
  }
}

