import { AuthRRecord, Scope, AuthRError, InvariantResult } from './types';

// Invariant 4: Scope monotonically narrows
export function assertScopeNarrows(parent: Scope, child: Scope): void {
  const parentActions = new Set(parent.actions);
  const childActions = new Set(child.actions);
  const extra = [...childActions].filter(a => !parentActions.has(a));
  if (extra.length > 0) {
    throw new AuthRError(`scope expansion: actions {${extra.join(', ')}}`);
  }
  
  const parentResources = new Set(parent.resources);
  const childResources = new Set(child.resources);
  const extraRes = [...childResources].filter(r => !parentResources.has(r));
  if (extraRes.length > 0) {
    throw new AuthRError(`scope expansion: resources {${extraRes.join(', ')}}`);
  }
  
  if (child.constraints.max_amount > parent.constraints.max_amount) {
    throw new AuthRError('scope expansion: max_amount exceeds parent');
  }
  
  if (child.constraints.max_delegation_depth > parent.constraints.max_delegation_depth) {
    throw new AuthRError('scope expansion: max_delegation_depth exceeds parent');
  }
}

// Invariant 2: Record not expired
export function checkExpiry(record: AuthRRecord): boolean {
  const expires = new Date(record.expires_at);
  return new Date() <= expires;
}

// Run all 6 invariants and return individual results
export function runAllInvariants(
  chain: AuthRRecord[],
  signatureValid: boolean[]
): InvariantResult[] {
  const results: InvariantResult[] = [];

  // Invariant 1: Signatures valid
  const sigsOk = signatureValid.length > 0 && signatureValid.every(Boolean);
  results.push({
    name: 'Ed25519 signatures valid on all records',
    passed: sigsOk,
    detail: sigsOk
      ? `All ${chain.length} record(s) have valid Ed25519 signatures`
      : 'One or more signatures failed verification'
  });

  // Invariant 2: Not expired
  const notExpired = chain.every(r => checkExpiry(r));
  results.push({
    name: 'No records expired',
    passed: notExpired,
    detail: notExpired
      ? `All records valid until ${chain[chain.length - 1].expires_at}`
      : 'One or more records are past their expires_at timestamp'
  });

  // Invariant 3: Author stable
  const rootAuthor = chain[0]?.author.id;
  const authorStable = chain.every(r => r.author.id === rootAuthor);
  results.push({
    name: 'author.id stable across all hops',
    passed: authorStable,
    detail: authorStable
      ? `Author "${chain[0]?.author.display_name}" consistent across all ${chain.length} record(s)`
      : `Author drift detected - expected ${rootAuthor}`
  });

  // Invariant 4: Scope monotonically narrows
  let scopeOk = true;
  let scopeDetail = 'Scope narrows at each hop - no escalation detected';
  try {
    for (let i = 0; i < chain.length - 1; i++) {
      assertScopeNarrows(chain[i].scope, chain[i + 1].scope);
    }
  } catch (e) {
    scopeOk = false;
    scopeDetail = (e as Error).message;
  }
  results.push({
    name: 'Scope monotonically narrows at each hop',
    passed: scopeOk,
    detail: scopeDetail
  });

  // Invariant 5: Chain continuity
  let chainOk = true;
  let chainDetail = 'Each record correctly references its parent';
  for (let i = 1; i < chain.length; i++) {
    const lastLink = chain[i].provenance.chain[chain[i].provenance.chain.length - 1];
    if (lastLink?.authr_id !== chain[i - 1].authr_id) {
      chainOk = false;
      chainDetail = `Chain break: Hop at index ${i} does not reference parent ID ${chain[i - 1].authr_id}`;
      break;
    }
  }
  results.push({
    name: 'Chain continuity - each record references parent',
    passed: chainOk,
    detail: chainOk
      ? 'All links correctly chain back to the root record'
      : chainDetail
  });

  // Invariant 6: Correlation ID consistent
  const rootCorr = chain[0]?.provenance.correlation_id;
  const corrOk = chain.every(r => r.provenance.correlation_id === rootCorr);
  results.push({
    name: 'correlation_id consistent across entire chain',
    passed: corrOk,
    detail: corrOk
      ? `Correlation ID ${rootCorr} matches across all records`
      : 'correlation_id mismatch detected between records'
  });

  return results;
}

