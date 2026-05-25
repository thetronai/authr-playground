'use client';

import React, { useRef, useEffect } from 'react';
import { usePlayground } from '@/store/playground-context';
import { Terminal, RefreshCw } from 'lucide-react';
import { truncateURN } from '@/lib/utils';

export default function AuditLog() {
  const { state, dispatch } = usePlayground();
  const { auditLog } = state;
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of logs when a new entry is added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [auditLog]);

  const handleRowClick = (entry: typeof auditLog[0]) => {
    if (entry.type === 'ROOT ISSUED') {
      dispatch({ type: 'SET_SELECTED_RECORD', payload: 'root' });
    } else if (entry.type === 'HOP ISSUED') {
      dispatch({ type: 'SET_SELECTED_RECORD', payload: 'hop' });
    } else if (entry.type === 'CHAIN VERIFIED') {
      dispatch({ type: 'SET_SELECTED_RECORD', payload: 'both' });
    } else if (entry.type === 'ATTACK BLOCKED') {
      dispatch({ type: 'SET_SELECTED_RECORD', payload: 'both' });
    }
  };

  const getEventBadgeClass = (type: string) => {
    switch (type) {
      case 'ROOT ISSUED':
        return 'text-accent border-accent/20 bg-accent/5';
      case 'HOP ISSUED':
        return 'text-accent-light border-accent-light/20 bg-accent-light/5';
      case 'CHAIN VERIFIED':
        return 'text-success border-success/20 bg-success/5';
      case 'ATTACK BLOCKED':
        return 'text-danger border-danger/25 bg-danger/5 animate-pulse';
      default:
        return 'text-text-secondary border-border bg-bg-tertiary/50';
    }
  };

  return (
    <div className="terminal-card rounded-lg p-4 flex flex-col border border-border">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2.5">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4 text-text-secondary" />
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Interactive Audit Log
          </h3>
        </div>
        {auditLog.length > 0 && (
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="flex items-center space-x-1 px-1.5 py-0.5 text-[10px] text-text-muted hover:text-text-primary transition-colors hover:bg-bg-tertiary rounded border border-border"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reset Demo</span>
          </button>
        )}
      </div>

      {/* Terminal Display */}
      <div
        ref={containerRef}
        className="h-[140px] overflow-y-auto font-code text-[11px] leading-relaxed space-y-2 pr-1 select-none"
      >
        {auditLog.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted italic text-center">
            Terminal idle. Perform actions in the wizard to write events...
          </div>
        ) : (
          auditLog.map((entry, idx) => (
            <div
              key={idx}
              onClick={() => handleRowClick(entry)}
              className="group flex items-start space-x-2 p-1.5 rounded hover:bg-bg-hover/30 border border-transparent hover:border-border/30 cursor-pointer transition-all duration-150"
              title="Click to view corresponding record"
            >
              {/* Time */}
              <span className="text-text-muted font-mono whitespace-nowrap pt-0.5">
                [{entry.timestamp}]
              </span>

              {/* Event Badge */}
              <span
                className={`px-1.5 py-0.5 font-display text-[9px] font-bold tracking-wider rounded border leading-none uppercase shrink-0 ${getEventBadgeClass(
                  entry.type
                )}`}
              >
                {entry.type}
              </span>

              {/* Record Ref */}
              {entry.recordId && (
                <span className="text-text-secondary hover:text-accent font-mono underline decoration-dotted transition-colors cursor-pointer shrink-0">
                  {truncateURN(entry.recordId)}
                </span>
              )}

              {/* Separator */}
              <span className="text-text-muted shrink-0">|</span>

              {/* Detail message */}
              <span className="text-text-primary group-hover:text-white break-words transition-colors">
                {entry.detail}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer metadata */}
      <div className="mt-2 text-[9px] text-text-muted border-t border-border/40 pt-2 flex justify-between">
        <span>Click log row to filter record viewer</span>
        <span>Standard: RFC 8032 (Ed25519)</span>
      </div>
    </div>
  );
}
