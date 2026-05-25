'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthRRecord, VerificationResult, AuditEntry } from '../lib/authr/types';
import { IssuingAuthority } from '../lib/authr/issuing-authority';

type ActiveTab = 'walkthrough' | 'comparison' | 'freestyle' | 'demos';

export interface PlaygroundState {
  step: 1 | 2 | 3 | 4;
  rootRecord: AuthRRecord | null;
  hopRecord: AuthRRecord | null;
  verificationResult: VerificationResult | null;
  attackResult: { rejected: boolean; error: string } | null;
  auditLog: AuditEntry[];
  issuingAuthority: IssuingAuthority | null;
  isInitialized: boolean;
  activeTab: ActiveTab;
  selectedRecord: 'root' | 'hop' | 'both';
  isLoading: boolean;
  loadingMessage: string;
}

type Action =
  | { type: 'INITIALIZED'; payload: IssuingAuthority }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean; message: string } }
  | { type: 'MINT_ROOT'; payload: AuthRRecord }
  | { type: 'DELEGATE'; payload: AuthRRecord }
  | { type: 'VERIFY'; payload: VerificationResult }
  | { type: 'ATTACK'; payload: { rejected: boolean; error: string; audit: AuditEntry } }
  | { type: 'SET_STEP'; payload: 1 | 2 | 3 | 4 }
  | { type: 'SET_TAB'; payload: ActiveTab }
  | { type: 'SET_SELECTED_RECORD'; payload: 'root' | 'hop' | 'both' }
  | { type: 'ADD_AUDIT'; payload: AuditEntry }
  | { type: 'RESET' };

const initialState: PlaygroundState = {
  step: 1,
  rootRecord: null,
  hopRecord: null,
  verificationResult: null,
  attackResult: null,
  auditLog: [],
  issuingAuthority: null,
  isInitialized: false,
  activeTab: 'walkthrough',
  selectedRecord: 'root',
  isLoading: false,
  loadingMessage: '',
};

function playgroundReducer(state: PlaygroundState, action: Action): PlaygroundState {
  const getTimestamp = () => new Date().toLocaleTimeString();

  switch (action.type) {
    case 'INITIALIZED':
      return {
        ...state,
        issuingAuthority: action.payload,
        isInitialized: true,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.isLoading,
        loadingMessage: action.payload.message,
      };
    case 'MINT_ROOT':
      return {
        ...state,
        rootRecord: action.payload,
        step: 2,
        selectedRecord: 'root',
        auditLog: [
          ...state.auditLog,
          {
            timestamp: getTimestamp(),
            type: 'ROOT ISSUED',
            recordId: action.payload.authr_id,
            detail: `Jane Doe (CFO) issued root credential to Treasury Orchestrator. Actions: [${action.payload.scope.actions.join(', ')}]`,
          },
        ],
      };
    case 'DELEGATE':
      return {
        ...state,
        hopRecord: action.payload,
        step: 3,
        selectedRecord: 'both',
        auditLog: [
          ...state.auditLog,
          {
            timestamp: getTimestamp(),
            type: 'HOP ISSUED',
            recordId: action.payload.authr_id,
            detail: `Treasury Orchestrator delegated to Wire Validator. Actions removed: [wire.approve, wire.submit]`,
          },
        ],
      };
    case 'VERIFY':
      return {
        ...state,
        verificationResult: action.payload,
        selectedRecord: 'both',
        auditLog: [
          ...state.auditLog,
          {
            timestamp: getTimestamp(),
            type: 'CHAIN VERIFIED',
            recordId: state.hopRecord?.authr_id || state.rootRecord?.authr_id || '',
            detail: '6/6 cryptographic and policy invariants verified successfully.',
          },
        ],
      };
    case 'ATTACK':
      return {
        ...state,
        attackResult: { rejected: action.payload.rejected, error: action.payload.error },
        step: 4,
        selectedRecord: 'both',
        auditLog: [...state.auditLog, action.payload.audit],
      };
    case 'SET_STEP':
      return {
        ...state,
        step: action.payload,
      };
    case 'SET_TAB':
      return {
        ...state,
        activeTab: action.payload,
      };
    case 'SET_SELECTED_RECORD':
      return {
        ...state,
        selectedRecord: action.payload,
      };
    case 'ADD_AUDIT':
      return {
        ...state,
        auditLog: [...state.auditLog, action.payload],
      };
    case 'RESET':
      return {
        ...initialState,
        issuingAuthority: state.issuingAuthority,
        isInitialized: state.isInitialized,
        activeTab: state.activeTab,
      };
    default:
      return state;
  }
}

interface PlaygroundContextProps {
  state: PlaygroundState;
  dispatch: React.Dispatch<Action>;
}

const PlaygroundContext = createContext<PlaygroundContextProps | undefined>(undefined);

export function PlaygroundProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(playgroundReducer, initialState);

  useEffect(() => {
    async function init() {
      const ia = new IssuingAuthority('treasury-twin-key-1');
      await ia.initialize();
      dispatch({ type: 'INITIALIZED', payload: ia });
    }
    init();
  }, []);

  return (
    <PlaygroundContext.Provider value={{ state, dispatch }}>
      {children}
    </PlaygroundContext.Provider>
  );
}

export function usePlayground() {
  const context = useContext(PlaygroundContext);
  if (!context) {
    throw new Error('usePlayground must be used within a PlaygroundProvider');
  }
  return context;
}
