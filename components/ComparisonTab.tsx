'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Row {
  question: string;
  obo: string;
  oboStatus: 'yes' | 'no';
  authr: string;
  authrStatus: 'yes' | 'no';
  isKeyDifference: boolean;
}

const rows: Row[] = [
  {
    question: 'Was the API token valid?',
    obo: '✅ Yes',
    oboStatus: 'yes',
    authr: '✅ Yes',
    authrStatus: 'yes',
    isKeyDifference: false
  },
  {
    question: 'Did the agent have permission to call the wire API?',
    obo: '✅ Yes',
    oboStatus: 'yes',
    authr: '✅ Yes',
    authrStatus: 'yes',
    isKeyDifference: false
  },
  {
    question: 'Whose judgment authorized this action?',
    obo: '❌ Unknown (token only)',
    oboStatus: 'no',
    authr: '✅ Jane Doe (CFO)',
    authrStatus: 'yes',
    isKeyDifference: true
  },
  {
    question: 'Did the intent stay consistent across agents?',
    obo: '❌ Not tracked',
    oboStatus: 'no',
    authr: '✅ Verified',
    authrStatus: 'yes',
    isKeyDifference: true
  },
  {
    question: 'Could a sub-agent claim extra permissions?',
    obo: '❌ Not structurally prevented',
    oboStatus: 'no',
    authr: '✅ Impossible (blocked by math)',
    authrStatus: 'yes',
    isKeyDifference: true
  },
  {
    question: 'Can compliance reconstruct it 6 months later?',
    obo: '❌ Token logs only',
    oboStatus: 'no',
    authr: '✅ Full chain + correlation ID',
    authrStatus: 'yes',
    isKeyDifference: true
  },
  {
    question: 'Who trained the agent that executed this?',
    obo: '❌ Not recorded',
    oboStatus: 'no',
    authr: '✅ model_manifest hash',
    authrStatus: 'yes',
    isKeyDifference: true
  },
  {
    question: 'Who can revoke this mid-execution?',
    obo: '❌ Not defined (revoke token only)',
    oboStatus: 'no',
    authr: '✅ Author or Issuing Authority',
    authrStatus: 'yes',
    isKeyDifference: true
  }
];

export default function ComparisonTab() {
  const [mode, setMode] = useState<'obo' | 'authr'>('authr');

  return (
    <div className="space-y-6">
      {/* Tab Header with Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="text-sm font-display font-bold uppercase tracking-wider text-text-primary">
            AuthR + OBO (On-Behalf-Of) vs Traditional Tokens
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            Understand how AuthR layers cryptographic human judgment guarantees on top of standard OAuth/API tokens.
          </p>
        </div>

        {/* Custom Toggle Switch */}
        <div className="flex items-center space-x-3 bg-bg-secondary border border-border p-1.5 rounded-lg w-fit select-none">
          <button
            onClick={() => setMode('obo')}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
              mode === 'obo'
                ? "bg-bg-tertiary text-text-primary border border-border/80 shadow"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            OBO Alone
          </button>
          <div className="text-text-muted text-xs">|</div>
          <button
            onClick={() => setMode('authr')}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center space-x-1.5",
              mode === 'authr'
                ? "bg-accent text-white border border-accent-light/20 shadow-[0_0_10px_rgba(99,102,241,0.15)]"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            <span>AuthR + OBO</span>
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-bg-secondary/20">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-bg-secondary/80 border-b border-border font-display text-[10px] text-text-secondary font-bold uppercase tracking-wider">
              <th className="p-4 w-[40%]">Question / Capability</th>
              <th className="p-4 w-[30%]">OBO Alone (Traditional JWT/SAML)</th>
              <th className="p-4 w-[30%]">AuthR + OBO (Modern Protocol)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row, idx) => {
              const isOboActive = mode === 'obo';
              const isHighlightActive = mode === 'authr' && row.isKeyDifference;

              return (
                <tr
                  key={idx}
                  className={cn(
                    "transition-all duration-300",
                    isHighlightActive
                      ? "bg-accent/5 hover:bg-accent/10 border-l-[3px] border-l-accent"
                      : "hover:bg-bg-secondary/40 border-l-[3px] border-l-transparent"
                  )}
                >
                  {/* Question */}
                  <td className="p-4 font-medium text-text-primary">
                    {row.question}
                  </td>

                  {/* OBO Column */}
                  <td className={cn(
                    "p-4 font-medium transition-opacity duration-300",
                    isOboActive ? "opacity-100" : "opacity-50 text-text-muted",
                    row.oboStatus === 'no' ? "text-danger/90 font-semibold" : "text-success"
                  )}>
                    {row.obo}
                  </td>

                  {/* AuthR Column */}
                  <td className={cn(
                    "p-4 font-semibold transition-all duration-300",
                    !isOboActive ? "opacity-100 text-text-primary" : "opacity-30 text-text-muted",
                    isHighlightActive ? "text-accent-light shadow-[inset_0_0_10px_rgba(99,102,241,0.05)]" : ""
                  )}>
                    <span className={cn(
                      row.authrStatus === 'no' ? "text-danger" : "text-success",
                      isHighlightActive && "underline decoration-accent-light/40 decoration-wavy underline-offset-4"
                    )}>
                      {row.authr}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Conceptual Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-border p-4 bg-bg-secondary/40 rounded-lg">
        <div className="space-y-1">
          <span className="text-[10px] font-display font-bold uppercase tracking-wider text-text-muted">
            OBO Scope
          </span>
          <p className="text-xs text-text-secondary leading-relaxed">
            <strong>OBO answers:</strong> <span className="font-semibold text-text-primary">"Can this specific network call be made right now?"</span> It checks access tokens and API gateway configurations.
          </p>
        </div>
        <div className="space-y-1 border-t border-border pt-3 md:border-t-0 md:pt-0 md:border-l md:pl-4">
          <span className="text-[10px] font-display font-bold uppercase tracking-wider text-accent-light">
            AuthR Scope
          </span>
          <p className="text-xs text-text-secondary leading-relaxed">
            <strong>AuthR answers:</strong> <span className="font-semibold text-text-primary">"Should this action exist at all, and whose human judgment stands behind it?"</span> It guarantees the chain of authority remains unbroken across multiple autonomous hops.
          </p>
        </div>
      </div>
    </div>
  );
}
