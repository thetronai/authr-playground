'use client';

import React from 'react';
import { Scope } from '@/lib/authr/types';
import { ArrowDown, HelpCircle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScopeVisualizerProps {
  parentScope: Scope;
  childScope: Scope;
  isMalicious?: boolean;
}

export default function ScopeVisualizer({ parentScope, childScope, isMalicious = false }: ScopeVisualizerProps) {
  const parentActions = parentScope.actions;
  const childActions = childScope.actions;

  // Find union of both actions to display the full set of comparisons
  const allActions = Array.from(new Set([...parentActions, ...childActions]));

  return (
    <div className="border border-border bg-bg-secondary/40 rounded-lg p-4 space-y-4">
      {/* Label */}
      <div className="flex items-center justify-between text-xs font-display text-text-secondary pb-2 border-b border-border/40">
        <span>SCOPE DRIFT / DELEGATION ANALYSIS</span>
        <span className={cn(
          "px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase",
          isMalicious ? "bg-danger/10 text-danger border border-danger/20" : "bg-success/10 text-success border border-success/20"
        )}>
          {isMalicious ? 'Escalation Detected' : 'Monotonic Narrowing'}
        </span>
      </div>

      {/* Parent Scope Row */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-display text-actor font-semibold uppercase tracking-wider">
            Parent Scope (Treasury Orchestrator)
          </span>
          <span className="text-[10px] text-text-muted">Max Amount: $250K USD | Max Depth: {parentScope.constraints.max_delegation_depth}</span>
        </div>
        <div className="flex flex-wrap gap-2 p-3 bg-bg-tertiary/40 rounded border border-border/60">
          {parentActions.map(action => (
            <span
              key={action}
              className="px-2 py-1 text-xs font-mono font-medium rounded bg-scope/15 text-scope border border-scope/25"
            >
              {action}
            </span>
          ))}
        </div>
      </div>

      {/* Delegation Flow Arrow */}
      <div className="flex flex-col items-center justify-center py-1">
        <ArrowDown className={cn("h-5 w-5", isMalicious ? "text-danger animate-bounce" : "text-text-muted")} />
        <span className="text-[10px] font-display text-text-muted mt-1 uppercase font-bold tracking-wide">
          {isMalicious ? 'MALICIOUS ATTACK HOP' : 'DELEGATION HOP'}
        </span>
      </div>

      {/* Sub-Agent Scope Row */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-display text-text-primary font-semibold uppercase tracking-wider">
            {isMalicious ? 'Claimed Scope (Compromised Agent)' : 'Sub-Agent Scope (Wire Validator)'}
          </span>
          <span className="text-[10px] text-text-muted">
            Max Amount: $250K USD | Max Depth: {childScope.constraints.max_delegation_depth}
          </span>
        </div>
        <div className={cn(
          "flex flex-wrap gap-2 p-3 rounded border transition-all duration-300",
          isMalicious ? "bg-danger-bg/40 border-danger/35" : "bg-bg-tertiary/40 border-border/60"
        )}>
          {allActions.map(action => {
            const inParent = parentActions.includes(action);
            const inChild = childActions.includes(action);

            if (inParent && inChild) {
              // Action granted and narrowing satisfied
              return (
                <span
                  key={action}
                  className="px-2 py-1 text-xs font-mono font-medium rounded bg-scope/15 text-scope border border-scope/25"
                >
                  {action}
                </span>
              );
            } else if (inParent && !inChild) {
              // Action was in parent but removed in child (narrowed)
              return (
                <span
                  key={action}
                  className="group relative px-2 py-1 text-xs font-mono font-medium rounded bg-bg-secondary text-text-muted line-through border border-border/50 cursor-help"
                  title="Sub-agent never received this permission."
                >
                  {action}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-bg-primary text-text-secondary text-[9px] leading-tight rounded border border-border shadow-lg font-sans text-center normal-case">
                    Removed at delegation (Monotonic Narrowing Invariant)
                  </span>
                </span>
              );
            } else {
              // Action was NOT in parent but claimed in child (escalated!)
              return (
                <span
                  key={action}
                  className="group relative px-2 py-1 text-xs font-mono font-bold rounded bg-danger/10 text-danger border border-danger/40 animate-pulse cursor-help flex items-center space-x-1"
                >
                  <ShieldAlert className="h-3 w-3" />
                  <span>{action}</span>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center w-52 p-2 bg-bg-primary text-danger text-[9px] leading-tight rounded border border-danger/40 shadow-lg font-sans text-center normal-case z-20">
                    <span className="font-bold uppercase mb-0.5">⚠️ INVARIANT FAILURE</span>
                    Action never authorized by Parent. Escalation blocked.
                  </span>
                </span>
              );
            }
          })}
        </div>
      </div>

      {/* Constraints Change Summary */}
      {!isMalicious && (
        <div className="text-[10px] text-text-secondary flex justify-between bg-bg-tertiary/20 p-2 rounded border border-border/30">
          <span>✓ Max depth reduced: {parentScope.constraints.max_delegation_depth} {"->"} {childScope.constraints.max_delegation_depth}</span>
          <span className="text-success font-medium">Safe Delegation Link</span>
        </div>
      )}
    </div>
  );
}

