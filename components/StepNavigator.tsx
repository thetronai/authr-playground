'use client';

import React from 'react';
import { usePlayground } from '@/store/playground-context';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
}

const steps: Step[] = [
  { id: 1, title: 'Mint Root', subtitle: 'CFO Issuance' },
  { id: 2, title: 'Delegate', subtitle: 'Narrow Scope' },
  { id: 3, title: 'Verify', subtitle: 'Invariants Check' },
  { id: 4, title: 'Simulate Attack', subtitle: 'Scope Widening' },
];

export default function StepNavigator() {
  const { state, dispatch } = usePlayground();
  const { step: activeStep, rootRecord, hopRecord, verificationResult } = state;

  const isStepUnlocked = (stepId: number) => {
    if (stepId === 1) return true;
    if (stepId === 2) return !!rootRecord;
    if (stepId === 3) return !!hopRecord;
    if (stepId === 4) return !!verificationResult;
    return false;
  };

  const handleStepClick = (stepId: 1 | 2 | 3 | 4) => {
    if (isStepUnlocked(stepId)) {
      dispatch({ type: 'SET_STEP', payload: stepId });
    }
  };

  return (
    <div className="sticky top-[57px] z-10 w-full bg-bg-primary/80 backdrop-blur-md border-b border-border/80 px-4 py-3">
      {/* Mobile progress summary */}
      <div className="flex md:hidden justify-between items-center px-2">
        <span className="text-xs font-display text-text-secondary uppercase">
          Step {activeStep} of 4: {steps[activeStep - 1].title}
        </span>
        <div className="flex space-x-1.5">
          {steps.map(s => (
            <div
              key={s.id}
              className={cn(
                "h-1.5 w-6 rounded-full transition-all duration-300",
                s.id === activeStep
                  ? "bg-accent"
                  : s.id < activeStep
                  ? "bg-success"
                  : "bg-bg-tertiary"
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop step nodes */}
      <div className="hidden md:flex items-center justify-between max-w-4xl mx-auto relative px-6">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-bg-tertiary -translate-y-1/2 -z-10" />

        {/* Animated Active Line */}
        <motion.div
          className="absolute top-1/2 left-0 h-[2px] bg-accent -translate-y-1/2 -z-10 origin-left"
          initial={{ scaleX: 0 }}
          animate={{
            scaleX:
              activeStep === 1 ? 0.16 :
              activeStep === 2 ? 0.5 :
              activeStep === 3 ? 0.83 : 1
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ width: '100%' }}
        />

        {steps.map((s, index) => {
          const isCompleted = s.id < activeStep;
          const isActive = s.id === activeStep;
          const isUnlocked = isStepUnlocked(s.id);

          return (
            <div
              key={s.id}
              className="flex flex-col items-center relative cursor-pointer group"
              onClick={() => handleStepClick(s.id)}
            >
              {/* Outer pulsing ring for active step */}
              {isActive && (
                <motion.div
                  className="absolute -top-1.5 h-9 w-9 rounded-full border-2 border-accent/40 -z-5"
                  animate={{ scale: [1, 1.25, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* Step Circle */}
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center font-display text-[10px] font-bold border transition-all duration-300 z-10",
                  isCompleted
                    ? "bg-success border-success text-bg-primary"
                    : isActive
                    ? "bg-accent border-accent text-white"
                    : isUnlocked
                    ? "bg-bg-secondary border-accent-light text-accent-light hover:bg-bg-tertiary"
                    : "bg-bg-secondary border-border text-text-muted cursor-not-allowed"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5 stroke-[3px]" />
                ) : (
                  s.id
                )}
              </div>

              {/* Titles */}
              <div className="absolute top-8 flex flex-col items-center w-36 text-center select-none">
                <span
                  className={cn(
                    "text-xs font-display font-bold tracking-tight transition-colors duration-200",
                    isActive
                      ? "text-text-primary"
                      : isCompleted
                      ? "text-success/90"
                      : isUnlocked
                      ? "text-text-secondary group-hover:text-text-primary"
                      : "text-text-muted"
                  )}
                >
                  {s.title}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-sans font-medium transition-colors duration-200",
                    isActive
                      ? "text-accent-light"
                      : isCompleted
                      ? "text-success/60"
                      : "text-text-muted"
                  )}
                >
                  {s.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Spacer for titles */}
      <div className="hidden md:block h-6" />
    </div>
  );
}
