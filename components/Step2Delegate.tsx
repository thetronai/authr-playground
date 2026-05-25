'use client';

import React, { useState } from 'react';
import { usePlayground } from '@/store/playground-context';
import { ValidatorActor, ValidatorScope, OrchestratorScope } from '@/lib/authr/scenarios';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Loader2, ArrowRightLeft, Check, HelpCircle } from 'lucide-react';
import ScopeVisualizer from './ScopeVisualizer';

export default function Step2Delegate() {
  const { state, dispatch } = usePlayground();
  const { issuingAuthority, rootRecord, hopRecord } = state;
  const [isExplanationOpen, setIsExplanationOpen] = useState(true);
  const [localLoading, setLocalLoading] = useState(false);

  const handleDelegate = async () => {
    if (!issuingAuthority || !rootRecord) return;
    setLocalLoading(true);

    // Artificial 250ms delay for realism
    await new Promise(resolve => setTimeout(resolve, 250));

    try {
      const record = await issuingAuthority.extend({
        parent: rootRecord,
        actor: ValidatorActor,
        attenuatedScope: ValidatorScope
      });

      dispatch({ type: 'DELEGATE', payload: record });
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
          T1 - Delegation Hop
        </span>
        <a
          href="https://playground.identient.com/spec#section-5.3.2"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent hover:text-accent-light hover:underline font-mono flex items-center space-x-0.5"
        >
          <span>AuthR Spec Sec 5.3.2</span>
          <span className="text-[8px] align-super">↗</span>
        </a>
      </div>

      {/* Main Heading */}
      <h2 className="text-xl font-display font-bold text-text-primary">
        Orchestrator delegates to Validator Sub-Agent
      </h2>

      {/* Collapsible Explanation Card */}
      <div className="border border-border bg-bg-secondary/40 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsExplanationOpen(!isExplanationOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-bg-tertiary/20 hover:bg-bg-tertiary/40 border-b border-border/40 transition-colors text-xs font-semibold text-text-secondary hover:text-text-primary"
        >
          <span className="flex items-center space-x-1.5">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Delegation Principles</span>
          </span>
          {isExplanationOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {isExplanationOpen && (
          <div className="p-4 text-xs text-text-secondary leading-relaxed space-y-2 bg-bg-secondary/10">
            <p>
              When an AI agent assigns a sub-task to another agent, it cannot mint a new root credential. Instead, it must <strong>extend the existing root chain</strong> by generating a delegation hop record.
            </p>
            <p>
              AuthR enforces three strict rules during delegation: the original <strong>Author</strong> (Jane Doe) remains identical, the <strong>Actor</strong> shifts to the sub-agent, and the permission <strong>Scope</strong> must monotonically narrow (meaning the child cannot have more authority than the parent).
            </p>
          </div>
        )}
      </div>

      {/* Three Rules visual cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Rule 1: Author */}
        <div className="border border-border hover:border-author/30 bg-bg-secondary/50 rounded p-3 text-center transition-colors">
          <div className="text-[9px] font-display font-bold text-author uppercase tracking-wide mb-1">
            Author
          </div>
          <div className="text-xs font-semibold text-text-primary mb-1">Preserved</div>
          <div className="text-[9.5px] text-text-muted leading-tight mb-2">Still Jane Doe (CFO)</div>
          <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold bg-author/10 text-author border border-author/20 leading-none">
            âœ“ SAME
          </span>
        </div>

        {/* Rule 2: Actor */}
        <div className="border border-border hover:border-actor/30 bg-bg-secondary/50 rounded p-3 text-center transition-colors">
          <div className="text-[9px] font-display font-bold text-actor uppercase tracking-wide mb-1">
            Actor
          </div>
          <div className="text-xs font-semibold text-text-primary mb-1">Changes</div>
          <div className="text-[9.5px] text-text-muted leading-tight mb-2">Orchestrator {"->"} Validator</div>
          <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold bg-actor/10 text-actor border border-actor/20 leading-none">
            â†— NEW
          </span>
        </div>

        {/* Rule 3: Scope */}
        <div className="border border-border hover:border-scope/30 bg-bg-secondary/50 rounded p-3 text-center transition-colors">
          <div className="text-[9px] font-display font-bold text-scope uppercase tracking-wide mb-1">
            Scope
          </div>
          <div className="text-xs font-semibold text-text-primary mb-1">Narrows</div>
          <div className="text-[9.5px] text-text-muted leading-tight mb-2">4 actions {"->"} 2 actions</div>
          <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold bg-scope/10 text-scope border border-scope/20 leading-none">
            â†˜ SMALLER
          </span>
        </div>
      </div>

      {/* Scope Narrowing Visualizer */}
      <ScopeVisualizer parentScope={OrchestratorScope} childScope={ValidatorScope} />

      {/* Action Button */}
      <div className="pt-2">
        {hopRecord ? (
          <div className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg border border-success/30 bg-success-bg text-success font-display text-sm font-semibold select-none shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <Check className="h-4 w-4 stroke-[3px]" />
            <span>âœ“ Delegation Hop Created</span>
          </div>
        ) : (
          <button
            onClick={handleDelegate}
            disabled={localLoading}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-accent hover:bg-accent-light text-white font-display text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(99,102,241,0.25)] border border-accent/20 cursor-pointer"
          >
            {localLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Extending chain and signing...</span>
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-4 w-4" />
                <span>Delegate to Validator Sub-Agent</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

