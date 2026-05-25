'use client';

import React, { useState } from 'react';
import { usePlayground } from '@/store/playground-context';
import { ValidatorActor, ValidatorScope, CompromisedScope } from '@/lib/authr/scenarios';
import { Actor } from '@/lib/authr/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldX, AlertTriangle, Skull, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import ScopeVisualizer from './ScopeVisualizer';

export default function Step4Attack() {
  const { state, dispatch } = usePlayground();
  const { hopRecord, issuingAuthority, attackResult } = state;
  const [localLoading, setLocalLoading] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  const compromisedActor: Actor = {
    id: 'spiffe://acme.com/agents/wire-validator/instance-99-compromised',
    type: 'TEE-Attested Agent (Compromised)',
    model_manifest: {
      code_hash: 'sha256:unknown_malicious_code_hash',
      model_hash: 'sha256:unknown_malicious_model_hash',
      model_version: 'malicious-injected-v1',
      signer_id: 'did:web:unknown.com:malicious-signer',
    },
    attestation: {
      type: 'Intel-SGX-Forged',
      evidence_digest: 'sha256:forged_attestation_digest',
      verified_at: '2026-05-25T11:35:00Z',
    },
  };

  const handleAttack = async () => {
    if (!issuingAuthority || !hopRecord) return;
    setLocalLoading(true);
    setFlashActive(false);

    // Artificial delay to feel heavyweight
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // Try to extend. The library's extend() function will run assertScopeNarrows()
      // and should throw an AuthRError!
      await issuingAuthority.extend({
        parent: hopRecord,
        actor: compromisedActor,
        attenuatedScope: CompromisedScope,
      });

      // If it somehow succeeds (should not!), dispatch standard delegate
      dispatch({
        type: 'ATTACK',
        payload: {
          rejected: false,
          error: 'Escalation succeeded unexpectedly',
          audit: {
            timestamp: new Date().toLocaleTimeString(),
            type: 'ATTACK BLOCKED',
            recordId: hopRecord.authr_id,
            detail: 'ATTACK FAILED TO BLOCK (Unexpected success)',
          },
        },
      });
    } catch (e) {
      // The attack is blocked structurally!
      // Trigger brief red screen flash
      setFlashActive(true);
      setTimeout(() => setFlashActive(false), 600);

      const errorMsg = (e as Error).message;

      dispatch({
        type: 'ATTACK',
        payload: {
          rejected: true,
          error: errorMsg,
          audit: {
            timestamp: new Date().toLocaleTimeString(),
            type: 'ATTACK BLOCKED',
            recordId: hopRecord.authr_id,
            detail: `Scope expansion rejected: actions {wire.cancel}. Blocked at IssuingAuthority.extend().`,
          },
        },
      });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Screen flash for killer moment */}
      <AnimatePresence>
        {flashActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-danger z-50 pointer-events-none"
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      {/* Small caps header */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-display font-bold tracking-wider text-text-muted uppercase">
          T_attack - Scope-Widening Attempt
        </span>
        <a
          href="https://playground.identient.com/spec#section-4.4"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:text-accent-light hover:underline font-mono flex items-center space-x-0.5"
        >
          <span>AuthR Spec Sec 4.4</span>
          <span className="text-[8px] align-super">↗</span>
        </a>
      </div>

      {/* Main Heading */}
      <h2 className="text-xl font-display font-bold text-danger flex items-center space-x-2">
        <Skull className="h-5.5 w-5.5 text-danger animate-pulse" />
        <span>Compromised sub-agent tries to claim wire.cancel</span>
      </h2>

      {/* Warning Card */}
      <div className="border border-warning bg-warning-bg/40 p-4 rounded-lg flex items-start space-x-3 border-l-4 border-l-warning">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-display font-bold text-warning uppercase">
            ATTACK VECTOR: HORIZONTAL SCOPE ESCALATION
          </h4>
          <p className="text-text-secondary leading-relaxed">
            A compromised or malicious sub-agent attempts to mint an authorization link containing <span className="text-danger font-bold">wire.cancel</span>-an action the parent record never possessed.
          </p>
          <p className="text-text-muted text-[10.5px]">
            In traditional systems, this would succeed if security relied on easily bypassable database tables or IAM configuration drift. In AuthR, it is structurally blocked by mathematical set verification.
          </p>
        </div>
      </div>

      {/* Scope visualizer with malicious scope */}
      <ScopeVisualizer parentScope={ValidatorScope} childScope={CompromisedScope} isMalicious={true} />

      {/* Rejection Banner */}
      <AnimatePresence>
        {attackResult && attackResult.rejected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-danger bg-danger-bg/45 p-4 rounded-lg flex items-start space-x-3 shadow-[0_0_15px_rgba(239,68,68,0.2)] border-l-4 border-l-danger"
          >
            <ShieldX className="h-5.5 w-5.5 text-danger shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="text-xs font-display font-bold text-danger uppercase tracking-wider">
                ✗ REJECTED - SCOPE EXPANSION DETECTED
              </h4>
              <div className="text-[10px] font-mono text-danger bg-danger-bg/30 px-2.5 py-1 rounded border border-danger/20 inline-block font-semibold">
                {attackResult.error}
              </div>
              <p className="text-[10.5px] text-text-secondary leading-relaxed">
                The action <span className="text-danger font-semibold">wire.cancel</span> was never in any parent record. The set difference <code className="text-danger bg-danger-bg px-1 rounded font-code font-bold text-[9px]">{'{wire.cancel}'}</code> is non-empty. 
              </p>
              <p className="text-[10.5px] text-text-secondary font-bold">
                Enforcement is structural (built into the signed record chain math) - NOT database or policy configuration dependent. There are no bypasses.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Summary Panel */}
      <AnimatePresence>
        {attackResult && attackResult.rejected && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-border bg-bg-secondary/60 p-4 rounded-lg space-y-3"
          >
            <div className="flex items-center space-x-2 text-success">
              <CheckCircle className="h-4.5 w-4.5" />
              <h4 className="font-display text-xs font-bold uppercase tracking-wider">
                Demo Complete - Key Takeaways
              </h4>
            </div>
            
            <div className="space-y-2.5 text-xs text-text-secondary pl-6 list-decimal">
              <div>
                <span className="text-author font-semibold font-display mr-1">T0 Root:</span>
                CFO Jane Doe issued a signed root AuthR record specifying delegation boundaries.
              </div>
              <div>
                <span className="text-actor font-semibold font-display mr-1">T1 Delegation:</span>
                Authority delegated, and scope correctly narrowed (4 actions {"->"} 2 actions).
              </div>
              <div>
                <span className="text-success font-semibold font-display mr-1">T2 Verification:</span>
                Full cryptographic chain was audit-validated against all 6 structural invariants.
              </div>
              <div>
                <span className="text-danger font-semibold font-display mr-1">T_attack Block:</span>
                Unauthorized scope escalation was structurally rejected *before* signing could occur.
              </div>
            </div>

            <p className="text-[10.5px] text-text-muted leading-relaxed pt-1.5 border-t border-border/40 select-text">
              The author (Jane Doe) remains provably responsible for every action taken. Any auditor can verify the delegation chain and correlation ID months later in full trust.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      <div className="pt-2">
        {attackResult && attackResult.rejected ? (
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg border border-border bg-bg-secondary hover:bg-bg-tertiary text-text-primary font-display text-sm font-semibold transition-all duration-150 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Restart Scenario Walkthrough</span>
          </button>
        ) : (
          <button
            onClick={handleAttack}
            disabled={localLoading || !hopRecord}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-danger hover:bg-danger/90 text-white font-display text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(239,68,68,0.25)] border border-danger/20 cursor-pointer"
          >
            {localLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Simulating compromised agent signature extension...</span>
              </>
            ) : (
              <>
                <Skull className="h-4 w-4" />
                <span>Attempt Scope Widening (Simulate Attack)</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

