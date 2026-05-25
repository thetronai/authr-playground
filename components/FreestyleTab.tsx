'use client';

import React, { useState } from 'react';
import { usePlayground } from '@/store/playground-context';
import { Author, Actor, Intent, Scope, AuthRRecord } from '@/lib/authr/types';
import { assertScopeNarrows } from '@/lib/authr/invariants';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, ShieldCheck, ShieldAlert, Plus, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FreestyleTab() {
  const { state, dispatch } = usePlayground();
  const { issuingAuthority } = state;

  // Root Form States
  const [authorName, setAuthorName] = useState('Alice Smith');
  const [authorRole, setAuthorRole] = useState('VP of Engineering');
  const [authorId, setAuthorId] = useState('did:web:example.com:people:alice-smith');
  const [agentId, setAgentId] = useState('spiffe://example.com/agents/deploy-orchestrator');
  const [intentStatement, setIntentStatement] = useState('Deploy v1.8 to production; halt if integration tests fail.');
  const [riskTier, setRiskTier] = useState('HIGH');
  const [hitl, setHitl] = useState(true);
  const [maxAmount, setMaxAmount] = useState(0);
  const [ttl, setTtl] = useState(30);
  const [maxHops, setMaxHops] = useState(2);

  // Actions & Resources tag lists
  const [actions, setActions] = useState<string[]>(['deploy.prepare', 'deploy.execute', 'deploy.rollback']);
  const [actionInput, setActionInput] = useState('');
  const [resources, setResources] = useState<string[]>(['cluster:prod-east-1', 'repo:core-backend']);
  const [resourceInput, setResourceInput] = useState('');

  // Delegation Hop Form States
  const [delegatedRecord, setDelegatedRecord] = useState<AuthRRecord | null>(null);
  const [customRootRecord, setCustomRootRecord] = useState<AuthRRecord | null>(null);
  const [delegatedAgentId, setDelegatedAgentId] = useState('spiffe://example.com/agents/deploy-executor-sub');
  const [delegatedActions, setDelegatedActions] = useState<string[]>(['deploy.execute']);
  const [delActionInput, setDelActionInput] = useState('');
  const [delError, setDelError] = useState<string | null>(null);

  // Helper to add action tag
  const addAction = (input: string, setList: React.Dispatch<React.SetStateAction<string[]>>, setInp: React.Dispatch<React.SetStateAction<string>>) => {
    const trimmed = input.trim();
    if (trimmed) {
      setList(prev => Array.from(new Set([...prev, trimmed])));
      setInp('');
    }
  };

  const removeAction = (item: string, setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(prev => prev.filter(x => x !== item));
  };

  const handleMintRoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuingAuthority) return;

    try {
      const author: Author = {
        id: authorId,
        type: 'Verified Digital Twin',
        role: authorRole,
        display_name: `${authorName} (${authorRole})`,
        grounding: {
          referent_type: 'Verified Digital Twin',
          verified_at: new Date().toISOString(),
          verifier: 'example-identity-provider',
          evidence_digest: 'sha256:freestyle_author_digest_hash_value_placeholder_12345',
        },
      };

      const actor: Actor = {
        id: agentId,
        type: 'TEE-Attested Agent',
        model_manifest: {
          code_hash: 'sha256:freestyle_manifest_hash_code_placeholder_67890',
          model_hash: 'sha256:freestyle_model_weights_hash_placeholder_abcde',
          model_version: 'custom-deploy-agent-v2',
          signer_id: 'did:web:example.com:security:developer-key',
        },
        attestation: {
          type: 'AMD-SEV-SNP',
          evidence_digest: 'sha256:freestyle_attestation_proof_digest_hash_value',
          verified_at: new Date().toISOString(),
        },
      };

      const intent: Intent = {
        purpose: 'custom_freestyle_action',
        statement: intentStatement,
        risk_tier: riskTier,
        human_in_the_loop: hitl,
      };

      const scope: Scope = {
        actions,
        resources,
        constraints: {
          max_amount: maxAmount,
          currency: 'USD',
          max_delegation_depth: maxHops,
        },
      };

      const record = await issuingAuthority.issueRoot({
        author,
        actor,
        intent,
        scope,
        ttlMinutes: ttl,
      });

      setCustomRootRecord(record);
      setDelegatedRecord(null);
      setDelError(null);
      
      // Initialize delegated actions with subset of parent actions
      setDelegatedActions(actions.slice(0, 1));

      // Overwrite global viewer state so user sees their new record
      dispatch({ type: 'MINT_ROOT', payload: record });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMintHop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuingAuthority || !customRootRecord) return;
    setDelError(null);

    const childScope: Scope = {
      actions: delegatedActions,
      resources: customRootRecord.scope.resources,
      constraints: {
        max_amount: customRootRecord.scope.constraints.max_amount,
        currency: 'USD',
        max_delegation_depth: Math.max(0, customRootRecord.scope.constraints.max_delegation_depth - 1),
      },
    };

    const childActor: Actor = {
      id: delegatedAgentId,
      type: 'TEE-Attested Agent',
      model_manifest: {
        code_hash: 'sha256:sub_agent_code_hash_value_placeholder',
        model_hash: 'sha256:sub_agent_model_weights_hash_value',
        model_version: 'sub-executor-v1',
        signer_id: 'did:web:example.com:security:developer-key',
      },
      attestation: {
        type: 'Intel-SGX',
        evidence_digest: 'sha256:sub_agent_attestation_evidence_hash',
        verified_at: new Date().toISOString(),
      },
    };

    try {
      // Validate scope narrowing in UI thread first to display clean errors
      assertScopeNarrows(customRootRecord.scope, childScope);

      // Issue delegation link
      const hop = await issuingAuthority.extend({
        parent: customRootRecord,
        actor: childActor,
        attenuatedScope: childScope,
      });

      setDelegatedRecord(hop);
      dispatch({ type: 'DELEGATE', payload: hop });
    } catch (err) {
      setDelError((err as Error).message);
    }
  };

  const resetForm = () => {
    setAuthorName('Alice Smith');
    setAuthorRole('VP of Engineering');
    setAuthorId('did:web:example.com:people:alice-smith');
    setAgentId('spiffe://example.com/agents/deploy-orchestrator');
    setIntentStatement('Deploy v1.8 to production; halt if integration tests fail.');
    setRiskTier('HIGH');
    setHitl(true);
    setActions(['deploy.prepare', 'deploy.execute', 'deploy.rollback']);
    setResources(['cluster:prod-east-1', 'repo:core-backend']);
    setMaxAmount(0);
    setTtl(30);
    setMaxHops(2);
    setCustomRootRecord(null);
    setDelegatedRecord(null);
    setDelError(null);
    dispatch({ type: 'RESET' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h3 className="text-sm font-display font-bold uppercase tracking-wider text-text-primary">
            Freestyle Sandbox Mode
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Build your own custom AuthR certificate structures, customize action lists, and test boundary enforcement rules.
          </p>
        </div>
        <button
          onClick={resetForm}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded border border-border bg-bg-secondary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset Form</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section A: Mint Root Form */}
        <div className="space-y-4">
          <div className="font-display text-xs font-bold text-author uppercase tracking-wide border-b border-border/40 pb-1.5">
            1. Configure Custom Root Record
          </div>

          <form onSubmit={handleMintRoot} className="space-y-3.5 bg-bg-secondary/20 p-4 rounded-lg border border-border">
            {/* Author details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-display text-text-secondary uppercase mb-1">Author Name</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-author transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-display text-text-secondary uppercase mb-1">Author Role</label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={e => setAuthorRole(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-author transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-display text-text-secondary uppercase mb-1">Author DID (Identity)</label>
              <input
                type="text"
                value={authorId}
                onChange={e => setAuthorId(e.target.value)}
                className="w-full bg-bg-tertiary border border-border rounded px-2.5 py-1.5 text-xs font-mono text-text-primary focus:outline-none focus:border-author transition-colors"
              />
            </div>

            {/* Actor Details */}
            <div>
              <label className="block text-[10px] font-display text-text-secondary uppercase mb-1">Target Agent SPIFFE ID</label>
              <input
                type="text"
                value={agentId}
                onChange={e => setAgentId(e.target.value)}
                className="w-full bg-bg-tertiary border border-border rounded px-2.5 py-1.5 text-xs font-mono text-text-primary focus:outline-none focus:border-actor transition-colors"
              />
            </div>

            {/* Intent details */}
            <div>
              <label className="block text-[10px] font-display text-text-secondary uppercase mb-1">Intent Statement</label>
              <textarea
                value={intentStatement}
                onChange={e => setIntentStatement(e.target.value)}
                rows={2}
                className="w-full bg-bg-tertiary border border-border rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-accent transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-display text-text-secondary uppercase mb-1">Risk Tier</label>
                <select
                  value={riskTier}
                  onChange={e => setRiskTier(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-accent transition-colors"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              <div className="flex flex-col justify-center">
                <label className="block text-[10px] font-display text-text-secondary uppercase mb-1">HITL Enforcement</label>
                <div className="flex items-center h-full pt-1">
                  <input
                    type="checkbox"
                    checked={hitl}
                    onChange={e => setHitl(e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-bg-tertiary text-accent focus:ring-0 accent-accent cursor-pointer"
                  />
                  <span className="text-xs text-text-secondary ml-2 font-medium">Require Approval</span>
                </div>
              </div>
            </div>

            {/* Actions Tag Input */}
            <div>
              <label className="block text-[10px] font-display text-text-secondary uppercase mb-1">Actions Scope</label>
              <div className="flex flex-wrap gap-1.5 mb-2 bg-bg-tertiary/45 p-2 rounded border border-border min-h-[40px]">
                {actions.map(act => (
                  <span key={act} className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-scope/15 text-scope border border-scope/25">
                    <span>{act}</span>
                    <button type="button" onClick={() => removeAction(act, setActions)} className="hover:text-white cursor-pointer">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                {actions.length === 0 && <span className="text-[10px] text-text-muted italic">No actions defined</span>}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type action (e.g. deploy.approve) & press Enter"
                  value={actionInput}
                  onChange={e => setActionInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAction(actionInput, setActions, setActionInput);
                    }
                  }}
                  className="flex-1 bg-bg-tertiary border border-border rounded px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-scope transition-colors"
                />
                <button
                  type="button"
                  onClick={() => addAction(actionInput, setActions, setActionInput)}
                  className="px-2.5 py-1 rounded bg-bg-tertiary hover:bg-bg-hover border border-border text-text-secondary hover:text-text-primary text-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Resources Tag Input */}
            <div>
              <label className="block text-[10px] font-display text-text-secondary uppercase mb-1">Resources Scope</label>
              <div className="flex flex-wrap gap-1.5 mb-2 bg-bg-tertiary/45 p-2 rounded border border-border min-h-[40px]">
                {resources.map(res => (
                  <span key={res} className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-bg-secondary text-text-secondary border border-border">
                    <span>{res}</span>
                    <button type="button" onClick={() => removeAction(res, setResources)} className="hover:text-white cursor-pointer">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                {resources.length === 0 && <span className="text-[10px] text-text-muted italic">No resources defined</span>}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type resource (e.g. cluster:prod) & press Enter"
                  value={resourceInput}
                  onChange={e => setResourceInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAction(resourceInput, setResources, setResourceInput);
                    }
                  }}
                  className="flex-1 bg-bg-tertiary border border-border rounded px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-border-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => addAction(resourceInput, setResources, setResourceInput)}
                  className="px-2.5 py-1 rounded bg-bg-tertiary hover:bg-bg-hover border border-border text-text-secondary hover:text-text-primary text-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Constraints */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-display text-text-secondary uppercase mb-1">Max Amount</label>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={e => setMaxAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-bg-tertiary border border-border rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-border-accent"
                />
              </div>
              <div>
                <label className="block text-[9px] font-display text-text-secondary uppercase mb-1">TTL (min)</label>
                <input
                  type="number"
                  value={ttl}
                  onChange={e => setTtl(parseInt(e.target.value) || 30)}
                  className="w-full bg-bg-tertiary border border-border rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-border-accent"
                />
              </div>
              <div>
                <label className="block text-[9px] font-display text-text-secondary uppercase mb-1">Max Hops</label>
                <input
                  type="number"
                  value={maxHops}
                  onChange={e => setMaxHops(parseInt(e.target.value) || 2)}
                  className="w-full bg-bg-tertiary border border-border rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-border-accent"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                className="w-full py-2 bg-author hover:bg-author/90 text-bg-primary font-display text-xs font-bold uppercase rounded hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] border border-author/20 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Mint My Custom Root Record</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section B: Delegation Sandbox Form */}
        <div className="space-y-4">
          <div className="font-display text-xs font-bold text-actor uppercase tracking-wide border-b border-border/40 pb-1.5">
            2. Test Sandbox Delegation
          </div>

          {!customRootRecord ? (
            <div className="border border-dashed border-border rounded-lg p-8 text-center text-text-muted flex flex-col items-center justify-center h-[350px]">
              <span className="text-3xl mb-2">🔒</span>
              <p className="font-display font-medium text-xs text-text-secondary mb-1">Delegation Locked</p>
              <p className="text-[10px] max-w-xs">Configure and mint your custom root record on the left to unlock delegation testing.</p>
            </div>
          ) : (
            <form onSubmit={handleMintHop} className="space-y-4 bg-bg-secondary/20 p-4 rounded-lg border border-border">
              {/* Agent ID */}
              <div>
                <label className="block text-[10px] font-display text-text-secondary uppercase mb-1">Sub-Agent ID</label>
                <input
                  type="text"
                  value={delegatedAgentId}
                  onChange={e => setDelegatedAgentId(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border rounded px-2.5 py-1.5 text-xs font-mono text-text-primary focus:outline-none focus:border-actor transition-colors"
                />
              </div>

              {/* Actions Chip Selector */}
              <div>
                <label className="block text-[10px] font-display text-text-secondary uppercase mb-1">
                  Delegated Actions (Claims)
                </label>
                
                <div className="bg-bg-tertiary/45 p-2.5 rounded border border-border space-y-2.5">
                  {/* Selected list */}
                  <div className="flex flex-wrap gap-1.5">
                    {delegatedActions.map(act => {
                      const isPermitted = customRootRecord.scope.actions.includes(act);
                      return (
                        <span
                          key={act}
                          className={cn(
                            "inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium border",
                            isPermitted
                              ? "bg-scope/15 text-scope border-scope/25"
                              : "bg-danger-bg text-danger border-danger/40 animate-pulse"
                          )}
                        >
                          <span>{act}</span>
                          <button type="button" onClick={() => removeAction(act, setDelegatedActions)} className="hover:text-white cursor-pointer">
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      );
                    })}
                    {delegatedActions.length === 0 && <span className="text-[10px] text-text-muted italic">Add actions below</span>}
                  </div>

                  {/* Quick Select Buttons from Parent Actions */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-display text-text-muted uppercase">Allowed by Parent:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {customRootRecord.scope.actions.map(act => {
                        const isSelected = delegatedActions.includes(act);
                        return (
                          <button
                            key={act}
                            type="button"
                            onClick={() => {
                              if (!isSelected) {
                                setDelegatedActions(prev => [...prev, act]);
                              }
                            }}
                            disabled={isSelected}
                            className={cn(
                              "px-2 py-0.5 rounded text-[9.5px] font-mono border transition-all cursor-pointer",
                              isSelected
                                ? "bg-bg-secondary text-text-muted border-border cursor-not-allowed"
                                : "bg-bg-tertiary hover:bg-bg-hover text-text-secondary hover:text-text-primary border-border"
                            )}
                          >
                            + {act}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Scope Widening Injector Input */}
                <div className="mt-3">
                  <label className="block text-[9px] font-display text-text-muted uppercase mb-1">
                    Add Malicious / Unauthorized Action (Inject Attack)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. system.bypass"
                      value={delActionInput}
                      onChange={e => setDelActionInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addAction(delActionInput, setDelegatedActions, setDelActionInput);
                        }
                      }}
                      className="flex-1 bg-bg-tertiary border border-border rounded px-2.5 py-1 text-xs text-text-primary focus:outline-none focus:border-danger transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => addAction(delActionInput, setDelegatedActions, setDelActionInput)}
                      className="px-2.5 py-1 rounded bg-danger/10 hover:bg-danger/25 text-danger border border-danger/30 text-xs font-bold cursor-pointer"
                    >
                      Inject
                    </button>
                  </div>
                </div>
              </div>

              {/* Invariant Failure Warning Banner */}
              <AnimatePresence>
                {delError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border border-danger bg-danger-bg/40 p-3 rounded text-xs text-danger flex items-start space-x-2 border-l-4 border-l-danger shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                  >
                    <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5 text-danger" />
                    <div>
                      <h5 className="font-display font-bold uppercase text-[10px]">Invariant Error: Blocked by IssuingAuthority</h5>
                      <p className="mt-0.5 leading-normal">{delError}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Delegation success confirmation */}
              <AnimatePresence>
                {delegatedRecord && !delError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border border-success bg-success-bg/40 p-3 rounded text-xs text-success flex items-start space-x-2 border-l-4 border-l-success"
                  >
                    <ShieldCheck className="h-4.5 w-4.5 shrink-0 mt-0.5 text-success" />
                    <div>
                      <h5 className="font-display font-bold uppercase text-[10px]">✓ Delegation Hop Signed</h5>
                      <p className="mt-0.5 text-[10px] leading-normal font-mono select-all">ID: {delegatedRecord.authr_id}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Buttons */}
              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full py-2 bg-actor hover:bg-actor/90 text-bg-primary font-display text-xs font-bold uppercase rounded hover:shadow-[0_0_10px_rgba(56,189,248,0.2)] border border-actor/20 transition-all cursor-pointer"
                >
                  Delegate to Sub-Agent
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
