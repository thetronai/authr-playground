'use client';

import React, { useState } from 'react';
import { usePlayground } from '@/store/playground-context';
import StepNavigator from '@/components/StepNavigator';
import Step1Mint from '@/components/Step1Mint';
import Step2Delegate from '@/components/Step2Delegate';
import Step3Verify from '@/components/Step3Verify';
import Step4Attack from '@/components/Step4Attack';
import RecordViewer from '@/components/RecordViewer';
import ChainDiagram from '@/components/ChainDiagram';
import AuditLog from '@/components/AuditLog';
import ComparisonTab from '@/components/ComparisonTab';
import FreestyleTab from '@/components/FreestyleTab';
import DemosTab from '@/components/DemosTab';
import { Shield, Copy, Check, FileText, BarChart3, Settings, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Page() {
  const { state, dispatch } = usePlayground();
  const { step, rootRecord, hopRecord, activeTab } = state;
  const [copied, setCopied] = useState(false);

  const handleCopyChain = async () => {
    const chain = [];
    if (rootRecord) chain.push(rootRecord);
    if (hopRecord) chain.push(hopRecord);
    await navigator.clipboard.writeText(JSON.stringify(chain, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col relative w-full overflow-hidden bg-bg-primary">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 h-14 bg-bg-secondary/70 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-2 select-none">
          <Shield className="h-5 w-5 text-accent animate-pulse" />
          <h1 className="font-display text-sm font-bold tracking-tight text-text-primary">
            AuthR <span className="text-accent">Playground</span>
          </h1>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-bg-tertiary text-text-secondary border border-border">
            v0.1
          </span>
        </div>

        <div className="hidden sm:block text-[11px] font-medium text-text-secondary font-display truncate max-w-sm lg:max-w-md uppercase tracking-wider">
          "Who is responsible for what was done?"
        </div>

        <div>
          <button
            onClick={handleCopyChain}
            disabled={!rootRecord}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-accent hover:bg-accent-light text-white text-xs font-semibold font-display uppercase tracking-wider hover:shadow-[0_0_10px_rgba(99,102,241,0.2)] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border border-accent/20"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Chain JSON</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Spacer for Fixed Header */}
      <div className="h-14" />

      {/* Sticky Step Navigator */}
      <StepNavigator />

      {/* Dashboard Dual Panel Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        
        {/* Left Panel - Active Step Wizard Controls (60% equivalent: 6/10 columns) */}
        <section className="lg:col-span-6 bg-bg-secondary/45 border border-border/80 rounded-xl p-5 md:p-6 backdrop-blur-sm shadow-xl space-y-6">
          {step === 1 && <Step1Mint />}
          {step === 2 && <Step2Delegate />}
          {step === 3 && <Step3Verify />}
          {step === 4 && <Step4Attack />}
        </section>

        {/* Right Panel - Permanent Cryptographic Viewers (40% equivalent: 4/10 columns) */}
        <aside className="lg:col-span-4 space-y-6 w-full">
          {/* SVG Chain Diagram */}
          <ChainDiagram />

          {/* Canonical JSON Viewer */}
          <RecordViewer />

          {/* Monospace Interactive Audit Log */}
          <AuditLog />
        </aside>

      </main>

      {/* Bottom Tabs Explorer Section */}
      <section className="w-full max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-bg-secondary/35 border border-border rounded-xl p-5 backdrop-blur-sm shadow-xl space-y-6">
          
          {/* Bottom Tabs Switcher */}
          <div className="flex bg-bg-tertiary/45 p-1 rounded-lg w-fit border border-border select-none">
            <button
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'walkthrough' })}
              className={cn(
                "px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center space-x-1.5 cursor-pointer",
                activeTab === 'walkthrough'
                  ? "bg-bg-secondary text-text-primary border border-border"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Walkthrough Guide</span>
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'comparison' })}
              className={cn(
                "px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center space-x-1.5 cursor-pointer",
                activeTab === 'comparison'
                  ? "bg-bg-secondary text-text-primary border border-border"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>AuthR vs OBO Alone</span>
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'freestyle' })}
              className={cn(
                "px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center space-x-1.5 cursor-pointer",
                activeTab === 'freestyle'
                  ? "bg-bg-secondary text-text-primary border border-border"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Freestyle Sandbox</span>
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'demos' })}
              className={cn(
                "px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center space-x-1.5 cursor-pointer",
                activeTab === 'demos'
                  ? "bg-bg-secondary text-text-primary border border-border"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Play className="h-3.5 w-3.5" />
              <span>Advanced Demos</span>
            </button>
          </div>

          {/* Active Tab Panel Content */}
          <div className="border border-border/60 bg-bg-secondary/15 rounded-lg p-5">
            {activeTab === 'walkthrough' && (
              <div className="space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-sm font-display font-bold uppercase tracking-wider text-text-primary">
                    Interactive Walkthrough: Crytographically Proving Human Responsibility
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Follow the guided scenario on the left panel to issue certificates, delegate narrowed scopes, verify cryptographic invariants, and block attacks.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-text-secondary leading-relaxed pt-2">
                  <div className="space-y-2 border border-border bg-bg-secondary/40 p-4 rounded-lg">
                    <span className="font-display font-bold text-author uppercase tracking-wide">The Identity Problem</span>
                    <p>
                      In modern agentic systems, AI sub-agents take actions (like calling wire transfer APIs) autonomously. Traditional token mechanisms (like OAuth or JWT) only show *which* API keys were used. They fail to trace the actions back to the human who authorized the agent.
                    </p>
                  </div>
                  <div className="space-y-2 border border-border bg-bg-secondary/40 p-4 rounded-lg">
                    <span className="font-display font-bold text-actor uppercase tracking-wide">The AuthR Solution</span>
                    <p>
                      AuthR attaches a tamper-proof cryptographic record chain that moves along with the agent tasks. Every delegation (hop) must inherit the original human author's signature and narrow the actions scope, preventing authorization drift or escalations.
                    </p>
                  </div>
                  <div className="space-y-2 border border-border bg-bg-secondary/40 p-4 rounded-lg">
                    <span className="font-display font-bold text-success uppercase tracking-wide">Invariant Enforcement</span>
                    <p>
                      Enforcement point checks happen directly at the gateway or endpoint. By evaluating signatures and mathematical scope differences, invalid chains are structurally rejected before any resource is ever accessed.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'comparison' && <ComparisonTab />}
            {activeTab === 'freestyle' && <FreestyleTab />}
            {activeTab === 'demos' && <DemosTab />}
          </div>

        </div>
      </section>

      {/* Footer copyright */}
      <footer className="text-center text-[10px] text-text-muted pb-8 font-mono">
        AuthR Identity Protocol v0.1 - Released under Apache-2.0 License.
      </footer>
    </div>
  );
}

