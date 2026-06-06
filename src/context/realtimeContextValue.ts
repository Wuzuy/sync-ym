import { createContext } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type AppState = {
  gameSeed: string;
  currentPuzzle: number;
  isMemorialUnlocked: boolean;
  p2AlphaReady: boolean;
  p2BetaReady: boolean;
  p4Attempt: number;
  p6Attempt: number;
  p7LucaAligned: boolean;
  p7MimiAligned: boolean;
};

type BroadcastPayload = Record<string, unknown>;

export interface RealtimeContextType {
  sessionId: string | null;
  channel: RealtimeChannel | null;
  appState: AppState;
  isHost: boolean;
  createSession: () => Promise<string>;
  joinSession: (code: string) => Promise<boolean>;
  updateAppState: (newState: Partial<AppState>) => void;
  broadcastEvent: (event: string, payload: BroadcastPayload) => void;
  error: string | null;
  setError: (err: string | null) => void;
}

export const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);
