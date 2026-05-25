'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, AlertOctagon, ShieldAlert, ArrowRight, UserCheck, X, RefreshCw, Radio, Flame, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type ActiveDemo = 'guided' | 'drift' | 'revocation' | null;

export default function DemosTab() {
  const [activeDemo, setActiveDemo] = useState<ActiveDemo>(null);

  // Guided Demo State
  const [guidedStep, setGuidedStep] = useState(1);

  // Intent Drift Demo State
  const [driftStep, setDriftStep] = useState(1);
  const [driftSignals, setDriftSignals] = useState<string[]>([]);
  
  // Revocation Demo State
  const [revocationStep, setRevocationStep] = useState(1);
  const [isRevoked, setIsRevoked] = useState(false);

  const resetDemos = () => {
    setGuidedStep(1);
    setDriftStep(1);
    setDriftSignals([]);
    setRevocationStep(1);
    setIsRevoked(false);
  };

  const closeDemo = () => {
    setActiveDemo(null);
    resetDemos();
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="border-b border-border pb-4">
        <h3 className="text-sm font-display font-bold uppercase tracking-wider text-text-primary">
          Advanced Protocol Demos
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Explore advanced properties of AuthR: walking through the paper's guided story, tracking semantic intent deviations (drift), and absolute control (revocation supremacy).
        </p>
      </div>

      {/* Demo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Guided Walkthrough Story */}
        <div className="terminal-card rounded-lg p-5 border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-accent">
              <ShieldCheck className="h-5 w-5" />
              <h4 className="font-display text-sm font-bold uppercase tracking-wider">
                Demo 2: CFO Wire Guided Story
              </h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Narrated step-by-step presentation of the flagship CFO wire scenario. Walk through root certificate issuance, delegation, multi-agent audits, and structural attack prevention.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveDemo('guided');
              setGuidedStep(1);
            }}
            className="w-full py-2.5 rounded bg-bg-tertiary hover:bg-bg-hover hover:text-text-primary text-text-secondary text-xs font-semibold font-display uppercase tracking-wider border border-border transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Run Guided Story</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Card 2: Intent Drift */}
        <div className="terminal-card rounded-lg p-5 border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-warning">
              <Compass className="h-5 w-5" />
              <h4 className="font-display text-sm font-bold uppercase tracking-wider">
                Demo 3: Intent Drift Detection
              </h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Root intent specifies: <code className="text-warning bg-warning/5 px-1 rounded font-code">"halt if counterparty changed in last 48h"</code>. 
              The sub-agent detects a swap and injects a drift signal, causing structural verification to fail.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveDemo('drift');
              setDriftStep(1);
            }}
            className="w-full py-2.5 rounded bg-bg-tertiary hover:bg-bg-hover hover:text-text-primary text-text-secondary text-xs font-semibold font-display uppercase tracking-wider border border-border transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Run Intent Drift Demo</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Card 3: Revocation Supremacy */}
        <div className="terminal-card rounded-lg p-5 border border-border flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-danger">
              <Flame className="h-5 w-5" />
              <h4 className="font-display text-sm font-bold uppercase tracking-wider">
                Demo 4: Revocation Supremacy
              </h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Even if a sub-agent holds a valid cryptographically signed record chain, the human author (CFO) can revoke the root authority mid-execution, poisoning downstream actions.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveDemo('revocation');
              setRevocationStep(1);
            }}
            className="w-full py-2.5 rounded bg-bg-tertiary hover:bg-bg-hover hover:text-text-primary text-text-secondary text-xs font-semibold font-display uppercase tracking-wider border border-border transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Run Revocation Demo</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {/* Modal Overlay for Demos */}
      <AnimatePresence>
        {activeDemo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-bg-secondary border border-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-bg-secondary">
                <div className="flex items-center space-x-2">
                  {activeDemo === 'guided' ? (
                    <ShieldCheck className="h-4.5 w-4.5 text-accent" />
                  ) : activeDemo === 'drift' ? (
                    <Compass className="h-4.5 w-4.5 text-warning" />
                  ) : (
                    <Flame className="h-4.5 w-4.5 text-danger" />
                  )}
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-text-primary">
                    {activeDemo === 'guided'
                      ? 'Scenario: CFO Wire Guided Story'
                      : activeDemo === 'drift'
                      ? 'Scenario: Semantic Intent Drift'
                      : 'Scenario: Mid-Execution Revocation'}
                  </h3>
                </div>
                <button
                  onClick={closeDemo}
                  className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Modal Body / Steps */}
              <div className="p-6 overflow-y-auto max-h-[480px]">
                
                {/* 0. GUIDED WALKTHROUGH STORY */}
                {activeDemo === 'guided' && (
                  <div className="space-y-4">
                    {/* Progress navigation */}
                    <div className="flex justify-between items-center bg-bg-primary/45 p-2 rounded border border-border text-[10px] font-mono text-text-secondary uppercase select-none">
                      <span>Slide {guidedStep} of 5</span>
                      <span>
                        {guidedStep === 1 && 'Introduction'}
                        {guidedStep === 2 && 'T0 Root Certification'}
                        {guidedStep === 3 && 'T1 Delegation Hop'}
                        {guidedStep === 4 && 'T2 Gateway Audits'}
                        {guidedStep === 5 && 'Threat Mitigation'}
                      </span>
                    </div>

                    {/* Step 1: Scenario Introduction */}
                    {guidedStep === 1 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-display font-semibold text-accent">
                          Welcome to the ACME Corp Wire Scenario
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          This guided walkthrough details the complete lifecycle of the AuthR identity protocol using the CFO payment scenario.
                        </p>
                        <div className="border border-border rounded p-4 bg-bg-primary/30 space-y-3 text-xs">
                          <div className="flex justify-between items-center pb-2 border-b border-border/40">
                            <span className="text-text-muted font-display text-[9px] uppercase">Author (Owner)</span>
                            <span className="font-semibold text-author">Jane Doe (CFO)</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-border/40">
                            <span className="text-text-muted font-display text-[9px] uppercase">Orchestrator Agent</span>
                            <span className="font-semibold text-actor">Treasury Orchestrator</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-border/40">
                            <span className="text-text-muted font-display text-[9px] uppercase">Validator Agent</span>
                            <span className="font-semibold text-actor">Wire Validator</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-text-muted font-display text-[9px] uppercase">Max Amount Limit</span>
                            <span className="font-semibold text-text-primary">$250,000 USD</span>
                          </div>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                          Our Goal: Prove that human authority bounds the AI agents and prevent a compromised sub-agent from executing unauthorized actions.
                        </p>
                      </div>
                    )}

                    {/* Step 2: T0 Root */}
                    {guidedStep === 2 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-display font-semibold text-text-primary">
                          T0: The CFO authorizes the payment intent
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          First, Jane Doe's digital twin signs the <strong>Root AuthR Record</strong>. This cryptographically binds her identity (via DID) to the Treasury Orchestrator's code signature.
                        </p>
                        <div className="border border-border/65 bg-bg-secondary p-3.5 rounded-lg space-y-2 border-l-[3px] border-l-author">
                          <div className="text-[10px] font-display font-bold text-author uppercase">Root Intent Statement</div>
                          <p className="text-xs italic text-text-primary bg-bg-primary/45 p-2 rounded">
                            "Release Q2 supplier payment per approved schedule; halt if variance &gt; 5% or counterparty changed in last 48h."
                          </p>
                        </div>
                        <p className="text-xs text-text-secondary">
                          The root record sets a delegation depth limit of 2, specifies actions (prepare, validate, approve, submit), and is signed with Jane's Ed25519 key pair.
                        </p>
                      </div>
                    )}

                    {/* Step 3: T1 Delegation */}
                    {guidedStep === 3 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-display font-semibold text-text-primary">
                          T1: Delegating subset of tasks to the Validator
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          To execute validation checks, the Treasury Orchestrator delegates a narrow scope to the Wire Validator sub-agent. The protocol automatically enforces the three core tenets:
                        </p>
                        <div className="grid grid-cols-3 gap-2.5 pt-2">
                          <div className="border border-border bg-bg-primary/20 p-2.5 rounded text-center">
                            <div className="text-[9px] font-display text-author font-bold uppercase">Author</div>
                            <div className="text-[10.5px] font-semibold text-text-primary mt-0.5">Jane Doe</div>
                            <span className="text-[8px] text-text-muted">Preserved</span>
                          </div>
                          <div className="border border-border bg-bg-primary/20 p-2.5 rounded text-center">
                            <div className="text-[9px] font-display text-actor font-bold uppercase">Actor</div>
                            <div className="text-[10.5px] font-semibold text-text-primary mt-0.5">Validator</div>
                            <span className="text-[8px] text-actor">New Node</span>
                          </div>
                          <div className="border border-border bg-bg-primary/20 p-2.5 rounded text-center">
                            <div className="text-[9px] font-display text-scope font-bold uppercase">Scope</div>
                            <div className="text-[10.5px] font-semibold text-text-primary mt-0.5">2 Actions</div>
                            <span className="text-[8px] text-success">Narrowed</span>
                          </div>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed pt-2">
                          The sub-scope is reduced to <code className="text-scope font-mono text-[10px]">['wire.prepare', 'wire.validate']</code>. The critical permissions <code className="text-text-muted line-through font-mono text-[10px]">wire.approve</code> and <code className="text-text-muted line-through font-mono text-[10px]">wire.submit</code> are discarded.
                        </p>
                      </div>
                    )}

                    {/* Step 4: T2 Gateway Enforcement */}
                    {guidedStep === 4 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-display font-semibold text-text-primary">
                          T2: The Bank enforcement check
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          When the sub-agent invokes the bank API, the gateway acts as the <strong>Enforcement Point</strong>. It does not look up static configs; it evaluates the signed chain in real-time.
                        </p>
                        <div className="border border-success bg-success-bg/25 border-l-4 border-l-success p-3.5 rounded space-y-1.5 text-xs text-text-secondary">
                          <h5 className="font-display font-bold text-success uppercase text-[10px]">✓ Structural Verification Checks</h5>
                          <p>1. Cryptographic signatures valid across all records in chain.</p>
                          <p>2. Validity timestamps have not expired.</p>
                          <p>3. Author DID is stable and identical (no judgment hijacking).</p>
                          <p>4. Scope matches parent constraints (no escalation).</p>
                        </div>
                        <p className="text-xs text-text-secondary">
                          Because all 6 invariants pass, the transaction proceeds safely, fully backed by the CFO's original authorization.
                        </p>
                      </div>
                    )}

                    {/* Step 5: Threat Mitigation */}
                    {guidedStep === 5 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-display font-semibold text-danger flex items-center space-x-1.5">
                          <span>Threat Model: Blocking Scope Escalation</span>
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          What happens if the sub-agent is compromised? The attacker attempts to inject a malicious permission: <span className="text-danger font-semibold font-mono text-[11px]">wire.cancel</span>.
                        </p>
                        <div className="border border-danger bg-danger-bg/45 border-l-4 border-l-danger p-4 rounded text-xs text-text-secondary space-y-1.5">
                          <h5 className="font-display font-bold text-danger uppercase text-[10px]">✗ Delegation Rejected</h5>
                          <p className="font-mono text-danger text-[10px] bg-danger-bg/20 p-1.5 rounded border border-danger/25">
                            AuthRError: scope expansion: actions {"{wire.cancel}"}
                          </p>
                          <p className="pt-1.5">
                            Because the signature binds the parent scope, and the validation protocol checks the set difference, the gateway blocks the request instantly. The attack is thwarted.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end pt-3 border-t border-border mt-6">
                      {guidedStep < 5 ? (
                        <button
                          onClick={() => setGuidedStep(prev => prev + 1)}
                          className="px-4 py-2 bg-accent hover:bg-accent-light text-white text-xs font-bold uppercase tracking-wider font-display rounded transition-all cursor-pointer flex items-center space-x-1"
                        >
                          <span>Next Slide</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={closeDemo}
                          className="px-4 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-border text-xs font-bold uppercase tracking-wider font-display rounded transition-all text-text-primary cursor-pointer"
                        >
                          Finish Demo
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 1. INTENT DRIFT DEMO STEPS */}
                {activeDemo === 'drift' && (
                  <div className="space-y-4">
                    {/* Progress navigation */}
                    <div className="flex justify-between items-center bg-bg-primary/45 p-2 rounded border border-border text-[10px] font-mono text-text-secondary uppercase select-none">
                      <span>Step {driftStep} of 4</span>
                      <span>
                        {driftStep === 1 && 'Root Minted'}
                        {driftStep === 2 && 'Injected Signals'}
                        {driftStep === 3 && 'Audit Check'}
                        {driftStep === 4 && 'Re-Anchored'}
                      </span>
                    </div>

                    {/* Step 1: Minting Root */}
                    {driftStep === 1 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-display font-semibold text-text-primary">
                          T0: CFO issues payment authority with safety intent
                        </h4>
                        <div className="border border-border rounded p-3 bg-bg-primary/20 space-y-2">
                          <p className="text-[10px] text-text-muted font-display uppercase tracking-wide">Intent Statement</p>
                          <p className="text-xs italic text-warning font-medium">
                            "Release Q2 supplier payment per approved schedule; halt if variance &gt; 5% or counterparty changed in last 48h."
                          </p>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          The CFO defines a logical safety rule directly in the intent statement: execution is contingent on the counterparty remaining stable.
                        </p>
                      </div>
                    )}

                    {/* Step 2: Injecting Signals */}
                    {driftStep === 2 && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-display font-semibold text-text-primary">
                          T1: Sub-agent discovers counterparty swap & injects signal
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          While processing the transfer, the agent checks registry history and discovers a routing bank change made 12 hours ago. It reports this by adding a deviation signal to the record's drift field.
                        </p>

                        <div className="border border-border/80 rounded-lg p-4 bg-bg-primary/30 space-y-3">
                          <div className="text-[10px] font-display text-text-secondary">DRIFT SIGNALS IN RECORD</div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-danger-bg text-danger border border-danger/35 flex items-center space-x-1 animate-pulse">
                              <Radio className="h-3.5 w-3.5" />
                              <span>counterparty_changed</span>
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-warning bg-warning-bg/10 p-3 rounded border border-warning/10">
                          ⚠️ The agent cannot hide this signal: tampering with the drift field invalidates the Ed25519 signature verified in step 3.
                        </div>
                      </div>
                    )}

                    {/* Step 3: Invariant failure */}
                    {driftStep === 3 && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-display font-semibold text-text-primary">
                          T2: Enforcement point triggers intent match check
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          The API gateway matches the parsed keywords of the intent statement against active deviation signals in the cert chain.
                        </p>

                        <div className="border border-danger bg-danger-bg/40 p-4 rounded-lg flex items-start space-x-3 border-l-4 border-l-danger">
                          <ShieldAlert className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h5 className="font-display text-xs font-bold text-danger uppercase">
                              ✗ BLOCKED - INTENT DRIFT DETECTED
                            </h5>
                            <p className="text-[10.5px] text-text-secondary">
                              Signal <code className="text-danger bg-danger-bg px-1 rounded font-code">'counterparty_changed'</code> conflicts with intent clause <code className="text-warning bg-warning-bg px-1 rounded font-code">'halt if counterparty changed'</code>.
                            </p>
                            <p className="text-[10.5px] text-text-muted mt-1 select-text">
                              Verification failed. Re-authorization required.
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-text-secondary">
                          Traditional JWT tokens would blindly proceed because the token claims remain active. AuthR halts processing immediately.
                        </p>
                      </div>
                    )}

                    {/* Step 4: Re-anchoring */}
                    {driftStep === 4 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-display font-semibold text-success flex items-center space-x-1">
                          <UserCheck className="h-4.5 w-4.5" />
                          <span>Re-Anchoring: CFO issues new root authority</span>
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          To resolve the drift, the CFO is notified (HITL). She inspects the change, approves it, and issues a <strong>new Root Record</strong> with updated intent:
                        </p>

                        <div className="border border-success bg-success-bg/25 rounded p-3.5 space-y-1.5 border-l-4 border-l-success">
                          <p className="text-[9px] font-display text-success uppercase tracking-wider font-bold">New Authorized Intent</p>
                          <p className="text-xs italic text-text-primary">
                            "Release Q2 payment; override previous counterparty lock. Routing bank change to acme-supplies-v2 verified."
                          </p>
                        </div>
                        <p className="text-xs text-text-secondary">
                          A new cryptographic chain is created. Execution is safely unblocked under fresh human judgment.
                        </p>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end pt-3 border-t border-border mt-6">
                      {driftStep < 4 ? (
                        <button
                          onClick={() => setDriftStep(prev => prev + 1)}
                          className="px-4 py-2 bg-accent hover:bg-accent-light text-white text-xs font-bold uppercase tracking-wider font-display rounded transition-all cursor-pointer flex items-center space-x-1"
                        >
                          <span>Next Slide</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={closeDemo}
                          className="px-4 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-border text-xs font-bold uppercase tracking-wider font-display rounded transition-all text-text-primary cursor-pointer"
                        >
                          Finish Demo
                        </button>
                      )}
                    </div>
                  </div>
                )}


                {/* 2. REVOCATION DEMO STEPS */}
                {activeDemo === 'revocation' && (
                  <div className="space-y-4">
                    {/* Progress navigation */}
                    <div className="flex justify-between items-center bg-bg-primary/45 p-2 rounded border border-border text-[10px] font-mono text-text-secondary uppercase select-none">
                      <span>Step {revocationStep} of 4</span>
                      <span>
                        {revocationStep === 1 && 'Chain Valid'}
                        {revocationStep === 2 && 'Revoke Claim'}
                        {revocationStep === 3 && 'Verification Fail'}
                        {revocationStep === 4 && 'Result Timeline'}
                      </span>
                    </div>

                    {/* Step 1: Valid Chain */}
                    {revocationStep === 1 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-display font-semibold text-text-primary">
                          T0: Root and Hop delegation active and valid
                        </h4>
                        <div className="border border-border rounded p-4 bg-bg-primary/30 flex justify-between items-center">
                          <div className="space-y-1">
                            <span className="text-[9px] font-display text-accent uppercase font-bold">Root ID: urn:authr:4e518ad8...</span>
                            <div className="text-xs text-text-secondary">CFO {"->"} Treasury Orchestrator</div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-success/15 border border-success/30 text-success font-semibold">
                            ACTIVE & VALID
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          The cryptographic chain is fully formed. The sub-agent has a signed delegation token and is preparing to call the wire service.
                        </p>
                      </div>
                    )}

                    {/* Step 2: CFO Revoke */}
                    {revocationStep === 2 && (
                      <div className="space-y-4 text-center">
                        <h4 className="text-xs font-display font-semibold text-text-primary text-left">
                          T1: CFO discovers discrepancy and revokes authority mid-run
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed text-left">
                          The CFO notices an error in the billing schedule and cancels the authority immediately. She publishes a signed revocation assertion for root ID <code className="font-code text-text-primary bg-bg-tertiary px-1 rounded">urn:authr:4e518ad8...</code>.
                        </p>

                        <div className="py-6 border border-dashed border-border rounded-lg bg-bg-primary/20">
                          {isRevoked ? (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-danger flex flex-col items-center space-y-2"
                            >
                              <ShieldAlert className="h-8 w-8 text-danger animate-bounce" />
                              <div className="text-xs font-display font-bold uppercase">Root Authority Revoked</div>
                              <div className="text-[10px] text-text-muted font-mono">Timestamp: {new Date().toLocaleTimeString()}</div>
                            </motion.div>
                          ) : (
                            <button
                              onClick={() => setIsRevoked(true)}
                              className="px-6 py-3 rounded bg-danger hover:bg-danger/90 text-white font-display text-xs font-bold uppercase border border-danger/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all cursor-pointer inline-flex items-center space-x-2"
                            >
                              <Flame className="h-4.5 w-4.5" />
                              <span>CFO Revokes Authority</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Verification failure */}
                    {revocationStep === 3 && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-display font-semibold text-text-primary">
                          T2: Sub-agent calls verification before final action
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          As part of the mandatory pre-action checks, the gateway verifies the credential chain. It checks the revocation registry for the root certificate ID.
                        </p>

                        <div className="border border-danger bg-danger-bg/40 p-4 rounded-lg flex items-start space-x-3 border-l-4 border-l-danger">
                          <AlertOctagon className="h-5.5 w-5.5 text-danger shrink-0 mt-0.5 animate-pulse" />
                          <div className="space-y-1">
                            <h5 className="font-display text-xs font-bold text-danger uppercase">
                              ✗ CHAIN REJECTED - REVOKED CERTIFICATE
                            </h5>
                            <p className="text-[10.5px] text-text-secondary">
                              Root credential <span className="font-mono text-text-primary">urn:authr:4e518ad8...</span> was explicitly revoked by Jane Doe (CFO).
                            </p>
                            <p className="text-[10.5px] text-text-muted mt-1 select-text">
                              Verification failed. Authority invalidated everywhere downstream.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Timeline */}
                    {revocationStep === 4 && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-display font-semibold text-text-primary">
                          Timeline of absolute control
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Because the delegation chain inherits from the root, revoking the root instantly poisons the entire downstream chain.
                        </p>

                        {/* Visual timeline */}
                        <div className="relative border-l border-border pl-6 space-y-4 font-mono text-[10.5px] py-2">
                          <div className="relative">
                            <span className="absolute -left-8 top-0.5 h-3.5 w-3.5 rounded-full bg-success/20 text-success border border-success/30 flex items-center justify-center text-[7px] font-bold">
                              ✓
                            </span>
                            <div className="text-text-primary font-semibold">10:35:00 - CFO Minted Root</div>
                            <div className="text-text-muted">Orchestrator receives delegation scope.</div>
                          </div>
                          
                          <div className="relative">
                            <span className="absolute -left-8 top-0.5 h-3.5 w-3.5 rounded-full bg-success/20 text-success border border-success/30 flex items-center justify-center text-[7px] font-bold">
                              ✓
                            </span>
                            <div className="text-text-primary font-semibold">10:35:10 - Orchestrator Delegated</div>
                            <div className="text-text-muted">Validator receives sub-scope.</div>
                          </div>

                          <div className="relative">
                            <span className="absolute -left-8 top-0.5 h-3.5 w-3.5 rounded-full bg-danger/25 text-danger border border-danger/40 flex items-center justify-center text-[7px] font-bold">
                              ✗
                            </span>
                            <div className="text-danger font-bold">10:35:20 - CFO Mid-run Revocation</div>
                            <div className="text-text-muted">Jane Doe invalidates urn:authr:4e518ad8...</div>
                          </div>

                          <div className="relative">
                            <span className="absolute -left-8 top-0.5 h-3.5 w-3.5 rounded-full bg-danger/25 text-danger border border-danger/40 flex items-center justify-center text-[7px] font-bold">
                              ✗
                            </span>
                            <div className="text-danger font-bold">10:35:25 - Final Validation Fails</div>
                            <div className="text-text-muted">Wire service rejects call. Action blocked.</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end pt-3 border-t border-border mt-6">
                      {revocationStep < 4 ? (
                        <button
                          onClick={() => {
                            if (revocationStep === 2 && !isRevoked) {
                              // Force revocation first
                              setIsRevoked(true);
                            }
                            setRevocationStep(prev => prev + 1);
                          }}
                          className="px-4 py-2 bg-accent hover:bg-accent-light text-white text-xs font-bold uppercase tracking-wider font-display rounded transition-all cursor-pointer flex items-center space-x-1"
                        >
                          <span>Next Slide</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={closeDemo}
                          className="px-4 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-border text-xs font-bold uppercase tracking-wider font-display rounded transition-all text-text-primary cursor-pointer"
                        >
                          Finish Demo
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

