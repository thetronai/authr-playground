'use client';

import React, { useState, useEffect } from 'react';
import { InvariantResult } from '@/lib/authr/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvariantChecklistProps {
  invariants: InvariantResult[];
  isVerifying: boolean;
  onAnimationComplete: () => void;
}

export default function InvariantChecklist({
  invariants,
  isVerifying,
  onAnimationComplete
}: InvariantChecklistProps) {
  const [visibleCount, setVisibleCount] = useState<number>(0);

  // Staggered reveal effect
  useEffect(() => {
    if (!isVerifying) {
      setVisibleCount(0);
      return;
    }

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setVisibleCount(current);

      if (current >= invariants.length) {
        clearInterval(interval);
        // Let it linger slightly before triggering completion callback
        setTimeout(() => {
          onAnimationComplete();
        }, 300);
      }
    }, 400); // 400ms delay between checks for clear reading

    return () => clearInterval(interval);
  }, [isVerifying, invariants.length, onAnimationComplete]);

  // Standard invariant names in case invariants list is empty
  const defaultNames = [
    'Ed25519 signatures valid on all records',
    'No records expired',
    'author.id stable across all hops',
    'Scope monotonically narrows at each hop',
    'Chain continuity - each record references parent',
    'correlation_id consistent across entire chain'
  ];

  return (
    <div className="space-y-4">
      {/* Checklist items */}
      <div className="space-y-3">
        {defaultNames.map((name, idx) => {
          const inv = invariants[idx];
          
          // State of this invariant in the checklist
          const isFinished = isVerifying && visibleCount > idx;
          const isActive = isVerifying && visibleCount === idx;
          const isPending = !isVerifying || visibleCount < idx;

          const passed = inv ? inv.passed : true; // default true if not generated yet
          const detail = inv ? inv.detail : '';

          return (
            <div
              key={idx}
              className={cn(
                "border rounded p-3 transition-all duration-300",
                isActive
                  ? "border-accent bg-accent/5"
                  : isFinished
                  ? passed
                    ? "border-success/30 bg-success/5"
                    : "border-danger/35 bg-danger/5"
                  : "border-border bg-bg-secondary/20"
              )}
            >
              <div className="flex items-center space-x-3">
                {/* Status Indicator */}
                <div className="shrink-0 flex items-center justify-center">
                  {isPending && (
                    <span className="h-5 w-5 rounded-full border-2 border-border text-text-muted flex items-center justify-center text-[10px] font-bold font-mono">
                      {idx + 1}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="h-5 w-5 text-accent" />
                    </motion.div>
                  )}
                  {isFinished && (
                    <motion.div
                      initial={{ scale: 0.3 }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.25 }}
                    >
                      {passed ? (
                        <div className="h-5 w-5 rounded-full bg-success/20 text-success border border-success/30 flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3.5px]" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-danger/25 text-danger border border-danger/40 flex items-center justify-center">
                          <X className="h-3 w-3 stroke-[3.5px]" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-xs font-display font-semibold transition-colors leading-tight",
                    isActive
                      ? "text-accent-light"
                      : isFinished
                      ? passed
                        ? "text-success"
                        : "text-danger"
                      : "text-text-secondary"
                  )}>
                    {idx + 1}. {name}
                  </p>
                  
                  {/* Detailed assertion text */}
                  <AnimatePresence>
                    {isFinished && detail && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "text-[10px] font-sans font-medium mt-1 select-all",
                          passed ? "text-text-secondary" : "text-danger/90 font-semibold"
                        )}
                      >
                        {detail}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

