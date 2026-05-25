'use client';

import React, { useState } from 'react';
import { usePlayground } from '@/store/playground-context';
import { Verifier } from '@/lib/authr/verifier';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, HelpCircle, ChevronUp, ChevronDown, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import InvariantChecklist from './InvariantChecklist';

export default function Step3Verify() {
  const { state, dispatch } = usePlayground();
  const { rootRecord, hopRecord, issuingAuthority, verificationResult } = state;
  const [isExplanationOpen, setIsExplanationOpen] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [localInvariants, setLocalInvariants] = useState<any[]>([]);

  const handleVerify = async () => {
    if (!issuingAuthority || !rootRecord || !hopRecord) return;
    setIsVerifying(true);
    setAnimationCompleted(false);

    try {
      const verifier = new Verifier(issuingAuthority.getPublicKey());
      const result = await verifier.verifyChain([rootRecord, hopRecord]);
      // Cache invariants locally for checklist animation
      setLocalInvariants(result.invariants);
      
      // We will dispatch the global action AFTER the staggered checklist animation finishes.
      // This is handled in onAnimationComplete below.
    } catch (e) {
      console.error(e);
      setIsVerifying(false);
    }
  };

  const handleAnimationComplete = () => {
    if (!rootRecord || !hopRecord || !issuingAuthority) return;
    
    // Instantiate again to get result to dispatch
    const verifier = new Verifier(issuingAuthority.getPublicKey());
    verifier.verifyChain([rootRecord, hopRecord]).then(result => {
      dispatch({ type: 'VERIFY', payload: result });
      setAnimationCompleted(true);
      setIsVerifying(false);
    });
  };

  const correlationId = rootRecord ? rootRecord.provenance.correlation_id : '';

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
          T2 - Enforcement Point
        </span>
        <a
          href="https://playground.identient.com/spec#section-5.3.3"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:text-accent-light hover:underline font-mono flex items-center space-x-0.5"
        >
          <span>AuthR Spec Sec 5.3.3</span>
          <span className="text-[8px] align-super">↗</span>
        </a>
      </div>

      {/* Main Heading */}
      <h2 className="text-xl font-display font-bold text-text-primary">
        Wire service verifies the chain before execution
      </h2>

      {/* Collapsible Explanation Card */}
      <div className="border border-border bg-bg-secondary/40 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsExplanationOpen(!isExplanationOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-bg-tertiary/20 hover:bg-bg-tertiary/40 border-b border-border/40 transition-colors text-xs font-semibold text-text-secondary hover:text-text-primary"
        >
          <span className="flex items-center space-x-1.5">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Invariant Checking</span>
          </span>
          {isExplanationOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {isExplanationOpen && (
          <div className="p-4 text-xs text-text-secondary leading-relaxed space-y-2 bg-bg-secondary/10">
            <p>
              Before executing the wire transfer, the bank's wire API acts as an <strong>Enforcement Point</strong>. It requests the complete AuthR chain and runs a set of mathematical invariant assertions.
            </p>
            <p>
              Rather than trusting a token claim or querying central policy tables, the wire service evaluates the cryptographic proofs directly. If even one check fails, the transaction is rejected instantly before touching resources.
            </p>
          </div>
        )}
      </div>

      {/* Checklist */}
      <InvariantChecklist
        invariants={localInvariants}
        isVerifying={isVerifying}
        onAnimationComplete={handleAnimationComplete}
      />

      {/* Verification Success Banner */}
      <AnimatePresence>
        {verificationResult && animationCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.3 }}
            className="border border-success bg-success-bg/40 p-4 rounded-lg flex items-start space-x-3 shadow-[0_0_15px_rgba(16,185,129,0.15)] border-l-4 border-l-success"
          >
            <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-display font-bold text-success uppercase tracking-wider">
                âœ“ CHAIN VERIFIED - 6/6 INVARIANTS PASSED
              </h4>
              <p className="text-[10px] text-text-secondary font-mono leading-relaxed select-all">
                Thread: {correlationId} | Author: Jane Doe (CFO) | Depth: 1
              </p>
              <p className="text-[10.5px] text-text-secondary leading-relaxed">
                The cryptographic chain is fully intact. Every signature is valid, scopes strictly narrow, the author ID is stable, and timestamps are fresh. The wire transfer is authorized.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      <div className="pt-2">
        {verificationResult && animationCompleted ? (
          <button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 4 })}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-accent hover:bg-accent-light text-white font-display text-sm font-semibold transition-all duration-150 hover:shadow-[0_0_15px_rgba(99,102,241,0.25)] border border-accent/20 cursor-pointer"
          >
            <span>Proceed to Attack Simulation</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleVerify}
            disabled={isVerifying || !rootRecord || !hopRecord}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-accent hover:bg-accent-light text-white font-display text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(99,102,241,0.25)] border border-accent/20 cursor-pointer"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running Cryptographic Audits...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Verify Cryptographic Chain</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

