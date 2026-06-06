import { useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { getDeviceFingerprint } from '../lib/utils';
import { RealtimeChannel } from '@supabase/supabase-js';
import { RealtimeContext, type AppState } from './realtimeContextValue';

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [appState, setAppState] = useState<AppState>(() => ({
    gameSeed: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    currentPuzzle: 1,
    isMemorialUnlocked: false,
    p2AlphaReady: false,
    p2BetaReady: false,
    p4Attempt: 0,
    p6Attempt: 0,
    p7LucaAligned: false,
    p7MimiAligned: false,
  }));

  const deviceId = getDeviceFingerprint();

  const setupAppStateListener = (c: RealtimeChannel) => {
    c.on('broadcast', { event: 'app_state_update' }, (payload) => {
      if (payload.payload && payload.payload.senderId !== deviceId) {
        setAppState((prev) => ({ ...prev, ...payload.payload.state }));
      }
    });
  };

  const createSession = async () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setIsHost(true);
    
    const newChannel = supabase.channel(`session_${code}`, {
      config: { broadcast: { ack: true } },
    });

    setupAppStateListener(newChannel);

    // Host listens for join requests
    newChannel.on('broadcast', { event: 'join_request' }, (payload) => {
      if (payload.payload.senderId !== deviceId) {
        // Accept the connection and send the initial state
        newChannel.send({
          type: 'broadcast',
          event: 'join_accept',
          payload: { senderId: deviceId, state: appState }
        });
        setSessionId(code); // Trigger navigation for Host
      } else {
        // Same device trying to connect to itself
        newChannel.send({
          type: 'broadcast',
          event: 'join_reject',
          payload: { reason: 'Você não pode parear consigo mesmo! Use outro dispositivo.' }
        });
      }
    });

    return new Promise<string>((resolve, reject) => {
      newChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setChannel(newChannel);
          setError(null);
          resolve(code); // Return code to UI, but DO NOT set sessionId yet
        } else if (status === 'CHANNEL_ERROR') {
          setError('Falha ao criar a sessão.');
          reject(new Error('Falha ao criar a sessão.'));
        }
      });
    });
  };

  const joinSession = async (code: string) => {
    setIsHost(false);
    const newChannel = supabase.channel(`session_${code}`, {
      config: { broadcast: { ack: true } },
    });

    setupAppStateListener(newChannel);

    return new Promise<boolean>((resolve, reject) => {
      const timeout = setTimeout(() => {
        supabase.removeChannel(newChannel);
        reject(new Error('Sessão não encontrada ou host desconectado.'));
      }, 5000);

      // Listen for acceptance
      newChannel.on('broadcast', { event: 'join_accept' }, (payload) => {
        clearTimeout(timeout);
        setAppState((prev) => ({ ...prev, ...payload.payload.state }));
        setChannel(newChannel);
        setSessionId(code); // Trigger navigation for Guest
        setError(null);
        resolve(true);
      });

      // Listen for rejection (e.g., same device)
      newChannel.on('broadcast', { event: 'join_reject' }, (payload) => {
        clearTimeout(timeout);
        supabase.removeChannel(newChannel);
        reject(new Error(payload.payload.reason));
      });

      newChannel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Send request to join
          await newChannel.send({
            type: 'broadcast',
            event: 'join_request',
            payload: { senderId: deviceId }
          });
        } else if (status === 'CHANNEL_ERROR') {
          clearTimeout(timeout);
          reject(new Error('Falha ao conectar ao canal.'));
        }
      });
    });
  };

  const updateAppState = (newState: Partial<AppState>) => {
    const updated = { ...appState, ...newState };
    setAppState(updated);
    
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'app_state_update',
        payload: { state: updated, senderId: deviceId },
      });
    }
  };

  const broadcastEvent = (event: string, payload: Record<string, unknown>) => {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event,
        payload: { ...payload, senderId: deviceId },
      });
    }
  };

  return (
    <RealtimeContext.Provider value={{ sessionId, channel, appState, isHost, createSession, joinSession, updateAppState, broadcastEvent, error, setError }}>
      {children}
    </RealtimeContext.Provider>
  );
};
