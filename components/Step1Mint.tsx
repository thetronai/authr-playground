'use client';

import React, { useState } from 'react';
import { usePlayground } from '@/store/playground-context';
import { CfoAuthor, OrchestratorActor, OrchestratorIntent, OrchestratorScope } from '@/lib/authr/scenarios';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Loader2, KeyRound, Check, HelpCircle } from 'lucide-react';

export default function Step1Mint() {
  const { state, dispatch } = usePlayground();
  const { issuingAuthority, rootRecord, isInitialized } = state;
  const [isExplanationOpen, setIsExplanationOpen] = useState(true);
  const [localLoading, setLocalLoading] = useState(false);

  const handleMint = async () => {
    if (!issuingAuthority) return;
    setLocalLoading(true);
    
    // Artificial 250ms delay to make signing feel substantial and visible in UI
    await new Promise(resolve => setTimeout(resolve, 250));

    try {
      const record = await issuingAuthority.issueRoot({
        author: CfoAuthor,
        actor: OrchestratorActor,
        intent: OrchestratorIntent,
        scope: OrchestratorScope,
        correlationId: `corr-${crypto.randomUUID()}`
      });

      dispatch({ type: 'MINT_ROOT', payload: record });
    } catch (e) {
      console.error(e);
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
      {/* Small caps header */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-display font-bold tracking-wider text-text-muted uppercase">
          T0 - Root Issuance
        </span>
        <a
          href="https://playground.identient.com/spec#section-5.3.1"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:text-accent-light hover:underline font-mono flex items-center space-x-0.5"
        >
          <span>AuthR Spec Sec 5.3.1</span>
          <span className="text-[8px] align-super">↗</span>
        </a>
      </div>

      {/* Main Heading */}
      <h2 className="text-xl font-display font-bold text-text-primary">
        CFO Jane Doe authorizes the wire transfer
      </h2>

      {/* Collapsible Explanation Card */}
      <div className="border border-border bg-bg-secondary/40 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsExplanationOpen(!isExplanationOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-bg-tertiary/20 hover:bg-bg-tertiary/40 border-b border-border/40 transition-colors text-xs font-semibold text-text-secondary hover:text-text-primary"
        >
          <span className="flex items-center space-x-1.5">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>How Root Issuance Works</span>
          </span>
          {isExplanationOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {isExplanationOpen && (
          <div className="p-4 text-xs text-text-secondary leading-relaxed space-y-2 bg-bg-secondary/10">
            <p>
              A <strong>root AuthR record</strong> is the cryptographic starting point. It captures the human author's identity (the principal), the specific AI agent that will act (the recipient of delegation), the logical intent, and the exact boundary of permissions.
            </p>
            <p>
              It is signed using the CFO's credential twin key. Since the signature covers a canonical key-sorted representation, any modifications by downchain systems or malicious agents can be mathematically verified and blocked.
            </p>
          </div>
        )}
      </div>

      {/* Grid of parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Author Card */}
        <div className="border-l-[3px] border-author border bg-bg-secondary p-3.5 rounded-r-lg space-y-3">
          <div className="text-[10px] font-display font-bold text-author uppercase tracking-wide">
            Author (The Judgment Source)
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-secondary">Author</span>
              <span className="font-semibold text-text-primary">Jane Doe (CFO)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Identity</span>
              <span className="font-mono text-text-muted text-[10px] truncate max-w-[140px]" title="did:web:acme.com:people:jane-doe">
                did:web:acme.com...jane-doe
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Twin Type</span>
              <span className="text-text-secondary">Verified Digital Twin</span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-1.5 text-[10px]">
              <span className="text-text-muted">Verified by</span>
              <span className="text-author/80 font-medium">acme-hrms</span>
            </div>
          </div>
        </div>

        {/* Actor Card */}
        <div className="border-l-[3px] border-actor border bg-bg-secondary p-3.5 rounded-r-lg space-y-3">
          <div className="text-[10px] font-display font-bold text-actor uppercase tracking-wide">
            Delegated Actor (Agent)
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-secondary">Agent</span>
              <span className="font-semibold text-text-primary">Treasury Orchestrator</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">ID</span>
              <span className="font-mono text-text-muted text-[10px] truncate max-w-[140px]" title="spiffe://acme.com/agents/treasury-orchestrator/instance-42">
                spiffe://acme.com...instance-42
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Execution</span>
              <span className="text-text-secondary">TEE-Attested Agent</span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-1.5 text-[10px]">
              <span className="text-text-muted">Platform</span>
              <span className="text-actor/80 font-medium">AMD-SEV-SNP</span>
            </div>
          </div>
        </div>

        {/* Intent Card */}
        <div className="border border-border bg-bg-secondary p-3.5 rounded-lg space-y-2 md:col-span-2">
          <div className="text-[10px] font-display font-bold text-text-secondary uppercase tracking-wide flex justify-between">
            <span>Grounding Intent</span>
            <span className="text-danger bg-danger-bg px-1.5 py-0.5 rounded leading-none text-[9px] font-bold border border-danger/25">
              HIGH RISK âš ï¸
            </span>
          </div>
          <p className="text-xs text-text-primary font-medium leading-relaxed italic bg-bg-primary/45 p-2 rounded border border-border/50">
            "{OrchestratorIntent.statement}"
          </p>
          <div className="flex justify-between text-xs pt-1 border-t border-border/40">
            <span className="text-text-secondary">Purpose: <span className="font-mono text-text-primary">{OrchestratorIntent.purpose}</span></span>
            <span className="text-text-secondary">HITL Enforcement: <span className="text-success font-semibold">Enabled</span></span>
          </div>
        </div>

        {/* Scope Card */}
        <div className="border-l-[3px] border-scope border bg-bg-secondary p-3.5 rounded-r-lg space-y-3 md:col-span-2">
          <div className="text-[10px] font-display font-bold text-scope uppercase tracking-wide">
            Authorized Scope Constraints
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {OrchestratorScope.actions.map(act => (
                <span key={act} className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-scope/10 text-scope border border-scope/20">
                  {act}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-xs pt-2 border-t border-border/45">
              <div>
                <span className="text-text-secondary">Resources: </span>
                <span className="font-mono text-text-primary text-[11px]">opex-7788, supplies</span>
              </div>
              <div className="text-right">
                <span className="text-text-secondary">Max Amount: </span>
                <span className="font-semibold text-text-primary">$250,000 USD</span>
              </div>
              <div>
                <span className="text-text-secondary">Max Hops: </span>
                <span className="font-semibold text-text-primary">{OrchestratorScope.constraints.max_delegation_depth}</span>
              </div>
              <div className="text-right">
                <span className="text-text-secondary">TTL: </span>
                <span className="text-warning font-medium">30 Minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        {rootRecord ? (
          <div className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg border border-success/30 bg-success-bg text-success font-display text-sm font-semibold select-none shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <Check className="h-4 w-4 stroke-[3px]" />
            <span>âœ“ Root Record Minted</span>
          </div>
        ) : (
          <button
            onClick={handleMint}
            disabled={!isInitialized || localLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-accent hover:bg-accent-light text-white font-display text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(99,102,241,0.25)] border border-accent/20 cursor-pointer"
          >
            {localLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing with Ed25519 (RFC 8032)...</span>
              </>
            ) : !isInitialized ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Cryptographic Credentials...</span>
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                <span>Mint Root Record</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

