'use client';

import React from 'react';
import { usePlayground } from '@/store/playground-context';
import { truncateURN } from '@/lib/utils';
import { Shield, ArrowDown, User, Network } from 'lucide-react';

export default function ChainDiagram() {
  const { state } = usePlayground();
  const { rootRecord, hopRecord } = state;

  const rootId = rootRecord ? truncateURN(rootRecord.authr_id) : 'urn:authr:...';
  const hopId = hopRecord ? truncateURN(hopRecord.authr_id) : 'urn:authr:...';
  const correlationId = rootRecord ? rootRecord.provenance.correlation_id : 'corr-...';

  return (
    <div className="terminal-card rounded-lg p-4 flex flex-col border border-border">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
        <div className="flex items-center space-x-2">
          <Network className="h-4 w-4 text-accent" />
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Cryptographic Chain Diagram
          </h3>
        </div>
        {rootRecord && (
          <div className="text-[10px] font-mono text-warning bg-warning/5 px-2 py-0.5 rounded border border-warning/10">
            {correlationId.substring(0, 16)}...
          </div>
        )}
      </div>

      {/* Mobile-only text summary */}
      <div className="block md:hidden py-4 text-center">
        {!rootRecord ? (
          <span className="text-xs text-text-muted">Chain empty</span>
        ) : (
          <div className="flex flex-col items-center space-y-1.5">
            <div className="flex items-center space-x-1 text-xs text-warning">
              <User className="h-3.5 w-3.5" />
              <span className="font-semibold">Jane Doe (CFO)</span>
            </div>
            <div className="text-[10px] text-text-muted">signed ↓</div>
            <div className="text-xs text-accent font-mono bg-accent/5 px-2 py-1 rounded border border-accent/20">
              Root Record (Orchestrator)
            </div>
            {hopRecord ? (
              <>
                <div className="text-[10px] text-text-muted">extended to ↓</div>
                <div className="text-xs text-scope font-mono bg-scope/5 px-2 py-1 rounded border border-scope/20">
                  Hop Record (Validator, depth 1)
                </div>
              </>
            ) : (
              <div className="text-[10px] text-text-muted italic">Delegation pending...</div>
            )}
          </div>
        )}
      </div>

      {/* Desktop SVG diagram */}
      <div className="hidden md:block relative w-full h-[280px] bg-bg-primary/20 rounded border border-border/40 overflow-hidden">
        {/* Abstract background grid */}
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

        <svg className="w-full h-full" viewBox="0 0 400 280">
          <defs>
            {/* Arrow Marker */}
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#6366f1" />
            </marker>
          </defs>

          {/* 1. Author Node (Jane Doe) */}
          <g transform="translate(200, 25)">
            {/* Background capsule */}
            <rect
              x="-85"
              y="-15"
              width="170"
              height="30"
              rx="15"
              fill="#0f172a"
              stroke={rootRecord ? "#f59e0b" : "#475569"}
              strokeWidth={rootRecord ? "1.5" : "1"}
              className="transition-colors duration-300"
            />
            {/* Icon */}
            <circle cx="-65" cy="0" r="8" fill="#f59e0b" className="opacity-20" />
            <text x="-65" y="3" fontSize="8" textAnchor="middle" fill="#f59e0b" fontWeight="bold">👤</text>
            
            {/* Text */}
            <text
              x="-45"
              y="4"
              fontFamily="var(--font-sans)"
              fontSize="10"
              fontWeight="bold"
              fill={rootRecord ? "#f1f5f9" : "#94a3b8"}
              textAnchor="start"
            >
              Jane Doe (CFO)
            </text>
            
            {/* Key label */}
            <text
              x="0"
              y="22"
              fontFamily="var(--font-code)"
              fontSize="7"
              fill="#94a3b8"
              textAnchor="middle"
            >
              did:web:acme.com:people:jane-doe
            </text>
          </g>

          {/* Line: Author -> Root Record */}
          <line
            x1="200"
            y1="55"
            x2="200"
            y2="78"
            stroke={rootRecord ? "#6366f1" : "#475569"}
            strokeWidth="1.5"
            strokeDasharray={rootRecord ? "0" : "3,3"}
            markerEnd={rootRecord ? "url(#arrow-active)" : "url(#arrow)"}
            className="transition-colors duration-300"
          />
          <text
            x="210"
            y="70"
            fontFamily="var(--font-sans)"
            fontSize="8"
            fill={rootRecord ? "#10b981" : "#475569"}
            fontWeight="semibold"
          >
            {rootRecord ? "signed" : ""}
          </text>

          {/* 2. Root Record Box */}
          <g transform="translate(200, 115)">
            <rect
              x="-125"
              y="-30"
              width="250"
              height="60"
              rx="6"
              fill="#0f172a"
              stroke={rootRecord ? (hopRecord ? "#1e293b" : "#6366f1") : "#1e293b"}
              strokeWidth={rootRecord && !hopRecord ? "2" : "1.5"}
              filter={rootRecord && !hopRecord ? "drop-shadow(0 0 4px rgba(99,102,241,0.2))" : ""}
              className="transition-all duration-300"
            />
            {/* Box Header */}
            <text
              x="-113"
              y="-14"
              fontFamily="var(--font-display)"
              fontSize="9"
              fontWeight="bold"
              fill={rootRecord ? "#818cf8" : "#475569"}
            >
              ROOT RECORD
            </text>
            <text
              x="113"
              y="-14"
              fontFamily="var(--font-code)"
              fontSize="8"
              textAnchor="end"
              fill="#94a3b8"
            >
              {rootId}
            </text>
            {/* Box details */}
            <text
              x="-113"
              y="5"
              fontFamily="var(--font-sans)"
              fontSize="9"
              fill={rootRecord ? "#38bdf8" : "#475569"}
            >
              Actor: Treasury Orchestrator
            </text>
            <text
              x="-113"
              y="18"
              fontFamily="var(--font-sans)"
              fontSize="8"
              fill={rootRecord ? "#a78bfa" : "#475569"}
            >
              Actions: [wire.prepare, wire.validate, wire.approve, wire.submit]
            </text>
          </g>

          {/* Line: Root -> Hop */}
          <line
            x1="200"
            y1="145"
            x2="200"
            y2="198"
            stroke={hopRecord ? "#6366f1" : "#475569"}
            strokeWidth="1.5"
            strokeDasharray={hopRecord ? "0" : "3,3"}
            markerEnd={hopRecord ? "url(#arrow-active)" : "url(#arrow)"}
            className="transition-colors duration-300"
          />
          <text
            x="210"
            y="178"
            fontFamily="var(--font-sans)"
            fontSize="8"
            fill={hopRecord ? "#818cf8" : "#475569"}
            fontWeight="medium"
          >
            {hopRecord ? "extends (depth: 1)" : "delegation pending"}
          </text>

          {/* 3. Hop Record Box */}
          <g transform="translate(200, 235)">
            <rect
              x="-125"
              y="-30"
              width="250"
              height="60"
              rx="6"
              fill={hopRecord ? "#0f172a" : "transparent"}
              stroke={hopRecord ? "#a78bfa" : "#1e293b"}
              strokeWidth={hopRecord ? "2" : "1"}
              strokeDasharray={hopRecord ? "0" : "4,4"}
              filter={hopRecord ? "drop-shadow(0 0 6px rgba(167,139,250,0.15))" : ""}
              className="transition-all duration-300"
            />
            {hopRecord ? (
              <>
                {/* Box Header */}
                <text
                  x="-113"
                  y="-14"
                  fontFamily="var(--font-display)"
                  fontSize="9"
                  fontWeight="bold"
                  fill="#a78bfa"
                >
                  DELEGATION HOP RECORD
                </text>
                <text
                  x="113"
                  y="-14"
                  fontFamily="var(--font-code)"
                  fontSize="8"
                  textAnchor="end"
                  fill="#94a3b8"
                >
                  {hopId}
                </text>
                {/* Box details */}
                <text
                  x="-113"
                  y="5"
                  fontFamily="var(--font-sans)"
                  fontSize="9"
                  fill="#38bdf8"
                >
                  Actor: Wire Validator
                </text>
                <text
                  x="-113"
                  y="18"
                  fontFamily="var(--font-sans)"
                  fontSize="8"
                  fill="#94a3b8"
                >
                  Actions: <tspan fill="#a78bfa">[wire.prepare, wire.validate]</tspan>
                </text>
              </>
            ) : (
              <text
                x="0"
                y="5"
                fontFamily="var(--font-sans)"
                fontSize="9"
                textAnchor="middle"
                fill="#475569"
                fontStyle="italic"
              >
                Waiting for Step 2 Delegation...
              </text>
            )}
          </g>

          {/* Dotted Correlation ID Thread */}
          {rootRecord && (
            <path
              d="M 65 115 L 65 235"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1"
              strokeDasharray="2,4"
              className="opacity-45"
            />
          )}
        </svg>
      </div>

      <div className="mt-2 text-[10px] text-text-muted flex justify-between items-center">
        <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-warning opacity-75 mr-1" /> Author Key</span>
        <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-actor opacity-75 mr-1" /> Actor ID</span>
        <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-scope opacity-75 mr-1" /> Scope Limit</span>
      </div>
    </div>
  );
}
