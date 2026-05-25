'use client';

import React, { useState } from 'react';
import { usePlayground } from '@/store/playground-context';
import { canonicalJSON } from '@/lib/authr/canonical';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { truncateURN } from '@/lib/utils';

export default function RecordViewer() {
  const { state, dispatch } = usePlayground();
  const { rootRecord, hopRecord, selectedRecord } = state;
  const [copied, setCopied] = useState(false);
  const [expandSig, setExpandSig] = useState<Record<string, boolean>>({});

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSig = (id: string) => {
    setExpandSig(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getRecordJson = (record: any) => {
    if (!record) return '';
    return JSON.stringify(record, null, 2);
  };

  const getCanonicalSize = (record: any) => {
    if (!record) return 0;
    try {
      const canonical = canonicalJSON(record);
      return new TextEncoder().encode(canonical).length;
    } catch {
      return 0;
    }
  };

  // Custom syntax highlighter that outputs React nodes
  const renderHighlightedJson = (record: any) => {
    if (!record) return null;
    const jsonString = getRecordJson(record);
    const lines = jsonString.split('\n');

    let inAuthor = false;
    let authorIndent = 0;
    let inSignature = false;
    let signatureIndent = 0;

    return (
      <div className="font-code text-sm leading-relaxed overflow-x-auto whitespace-pre">
        {lines.map((line, idx) => {
          // Calculate indentation of current line
          const indentMatch = line.match(/^(\s*)/);
          const currentIndent = indentMatch ? indentMatch[1].length : 0;

          // Check if entering/leaving author block
          if (line.includes('"author": {')) {
            inAuthor = true;
            authorIndent = currentIndent;
          } else if (inAuthor && line.trim() === '}' && currentIndent === authorIndent) {
            // Include this closing bracket in the highlighted area or end it here
            const isClosing = true;
            if (isClosing) {
              // We'll close after rendering this line
            }
          }

          // Check if entering/leaving signature block
          if (line.includes('"signature": {')) {
            inSignature = true;
            signatureIndent = currentIndent;
          } else if (inSignature && (line.trim() === '}' || line.trim() === '},') && currentIndent === signatureIndent) {
            // Will close signature after this line
          }

          // Apply classes based on context
          let lineBgClass = '';
          let lineBorderClass = 'border-l-2 border-transparent pl-3';

          if (inAuthor) {
            lineBgClass = 'bg-warning/5';
            lineBorderClass = 'border-l-2 border-author pl-3';
          }

          // Post-line closing checks
          if (inAuthor && line.trim().startsWith('}') && currentIndent === authorIndent) {
            inAuthor = false;
          }

          // Parse key-value pairs
          // Matches: "key": value
          const keyValueMatch = line.match(/^(\s*)"([^"]+)"\s*:\s*(.*)$/);
          
          let contentNode: React.ReactNode = line;

          if (keyValueMatch) {
            const indent = keyValueMatch[1];
            const key = keyValueMatch[2];
            const valueStr = keyValueMatch[3].trim();

            let highlightedValue: React.ReactNode = valueStr;

            // Highlight Correlation ID if key is correlation_id
            const isCorr = key === 'correlation_id';
            const isAuthorKey = key === 'author';
            const isActorKey = key === 'actor';
            const isScopeKey = key === 'actions' || key === 'resources';

            // Check signature value truncation
            if (key === 'value' && inSignature) {
              const valMatch = valueStr.match(/^"([^"]+)"(,)?$/);
              if (valMatch) {
                const rawVal = valMatch[1];
                const trailingComma = valMatch[2] || '';
                const isExpanded = expandSig[record.authr_id];
                const displayVal = isExpanded ? rawVal : `${rawVal.substring(0, 20)}...`;

                highlightedValue = (
                  <span className="text-[#86efac]">
                    "{displayVal}"{trailingComma}
                    <button
                      onClick={() => toggleSig(record.authr_id)}
                      className="ml-2 px-1 py-0.5 rounded text-[10px] font-sans bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-hover align-middle transition-colors border border-border"
                    >
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                  </span>
                );
              }
            } else if (valueStr.startsWith('"')) {
              // String value
              const valMatch = valueStr.match(/^"([^"]*)"(,)?$/);
              if (valMatch) {
                const text = valMatch[1];
                const comma = valMatch[2] || '';

                // Check for URN tooltips
                const isURN = text.startsWith('urn:authr:');
                
                highlightedValue = (
                  <span className={isCorr ? "text-warning font-bold" : "text-[#86efac]"}>
                    "{isURN ? (
                      <span className="underline decoration-dotted cursor-help" title={text}>
                        {truncateURN(text)}
                      </span>
                    ) : text}"{comma}
                  </span>
                );
              }
            } else if (valueStr === 'true' || valueStr === 'true,') {
              highlightedValue = <span className="text-danger">{valueStr}</span>;
            } else if (valueStr === 'false' || valueStr === 'false,') {
              highlightedValue = <span className="text-danger">{valueStr}</span>;
            } else if (valueStr === 'null' || valueStr === 'null,') {
              highlightedValue = <span className="text-text-muted">{valueStr}</span>;
            } else if (!isNaN(parseFloat(valueStr))) {
              highlightedValue = <span className="text-warning">{valueStr}</span>;
            }

            // Key highlight classes
            let keyClass = 'text-accent-light';
            if (isAuthorKey) keyClass = 'text-author font-semibold';
            if (isActorKey) keyClass = 'text-actor font-semibold';
            if (isScopeKey) keyClass = 'text-scope font-semibold';

            contentNode = (
              <span>
                {indent}
                <span className={keyClass}>"{key}"</span>: {highlightedValue}
              </span>
            );
          } else {
            // Just normal brackets or closing characters
            const trimmed = line.trim();
            if (trimmed.startsWith('"')) {
              // String array items
              const match = line.match(/^(\s*)"([^"]*)"(,)?$/);
              if (match) {
                const indent = match[1];
                const text = match[2];
                const comma = match[3] || '';
                const isURN = text.startsWith('urn:authr:');

                contentNode = (
                  <span>
                    {indent}
                    <span className="text-[#86efac]">
                      "{isURN ? (
                        <span className="underline decoration-dotted cursor-help" title={text}>
                          {truncateURN(text)}
                        </span>
                      ) : text}"{comma}
                    </span>
                  </span>
                );
              }
            }
          }

          // Close signature checking
          if (inSignature && (line.trim() === '}' || line.trim() === '},') && currentIndent === signatureIndent) {
            inSignature = false;
          }

          return (
            <div key={idx} className={`${lineBgClass} ${lineBorderClass} hover:bg-bg-hover/20 transition-colors`}>
              {contentNode}
            </div>
          );
        })}
      </div>
    );
  };

  // If no record, display placeholder
  if (!rootRecord) {
    return (
      <div className="terminal-card rounded-lg p-6 h-full flex flex-col items-center justify-center border border-dashed border-border text-center text-text-muted">
        <div className="text-4xl mb-3">📄</div>
        <p className="font-display font-medium text-sm text-text-secondary mb-1">No Active AuthR Records</p>
        <p className="text-xs max-w-xs">Mint a root record in Step 1 to initialize the cryptographic chain viewer.</p>
      </div>
    );
  }

  const showRoot = selectedRecord === 'root' || selectedRecord === 'both';
  const showHop = (selectedRecord === 'hop' || selectedRecord === 'both') && hopRecord;

  // Active records to display
  const copyValue = hopRecord 
    ? JSON.stringify([rootRecord, hopRecord], null, 2) 
    : JSON.stringify(rootRecord, null, 2);

  return (
    <div className="terminal-card rounded-lg p-4 flex flex-col h-[580px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Live Record Viewer
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleCopy(copyValue)}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded border border-border bg-bg-tertiary hover:bg-bg-hover hover:text-text-primary text-text-secondary transition-all"
            title="Copy current chain JSON"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" />
                <span className="text-success text-[10px] font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium">Copy Chain</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      {hopRecord && (
        <div className="flex bg-bg-tertiary/50 border border-border p-1 rounded mb-3">
          <button
            onClick={() => dispatch({ type: 'SET_SELECTED_RECORD', payload: 'root' })}
            className={`flex-1 text-center py-1.5 text-xs font-medium rounded transition-all ${
              selectedRecord === 'root'
                ? 'bg-bg-secondary text-text-primary border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Root Record
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_SELECTED_RECORD', payload: 'hop' })}
            className={`flex-1 text-center py-1.5 text-xs font-medium rounded transition-all ${
              selectedRecord === 'hop'
                ? 'bg-bg-secondary text-text-primary border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Delegation Hop
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_SELECTED_RECORD', payload: 'both' })}
            className={`flex-1 text-center py-1.5 text-xs font-medium rounded transition-all ${
              selectedRecord === 'both'
                ? 'bg-bg-secondary text-text-primary border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Compare Both
          </button>
        </div>
      )}

      {/* Code Display Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {selectedRecord === 'both' && hopRecord ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full">
            {/* Root Panel in side-by-side */}
            <div className="border border-border rounded p-3 bg-bg-secondary/40 flex flex-col">
              <div className="flex justify-between items-center text-[10px] font-display text-text-secondary mb-2 border-b border-border/50 pb-1">
                <span>ROOT RECORD</span>
                <span className="text-text-muted">{getCanonicalSize(rootRecord)} bytes</span>
              </div>
              <div className="overflow-auto flex-1 max-h-[400px]">
                {renderHighlightedJson(rootRecord)}
              </div>
            </div>
            {/* Hop Panel in side-by-side */}
            <div className="border border-border rounded p-3 bg-bg-secondary/40 flex flex-col">
              <div className="flex justify-between items-center text-[10px] font-display text-text-secondary mb-2 border-b border-border/50 pb-1">
                <span>DELEGATION HOP</span>
                <span className="text-text-muted">{getCanonicalSize(hopRecord)} bytes</span>
              </div>
              <div className="overflow-auto flex-1 max-h-[400px]">
                {renderHighlightedJson(hopRecord)}
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-border rounded p-3 bg-bg-secondary/40 h-full flex flex-col overflow-hidden">
            <div className="flex justify-between items-center text-[10px] font-display text-text-secondary mb-2 border-b border-border/50 pb-1">
              <span>{selectedRecord === 'root' ? 'ROOT RECORD' : 'DELEGATION HOP RECORD'}</span>
              <span className="text-text-muted">
                {getCanonicalSize(selectedRecord === 'root' ? rootRecord : hopRecord)} bytes
              </span>
            </div>
            <div className="overflow-auto flex-1">
              {renderHighlightedJson(selectedRecord === 'root' ? rootRecord : hopRecord)}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-3 border-t border-border pt-2.5 text-[10px] text-text-muted flex justify-between">
        <span>Format: Canonical JSON</span>
        <span className="text-warning">Correlation ID highlights in amber</span>
      </div>
    </div>
  );
}
