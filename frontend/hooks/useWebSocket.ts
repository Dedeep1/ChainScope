'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { LiveTransaction } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';
const MAX_TXS = 50;

export function useTransactionStream() {
  const [transactions, setTransactions] = useState<LiveTransaction[]>([]);
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState({ total: 0, suspicious: 0 });
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (typeof window === 'undefined') return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (mountedRef.current) setConnected(true);
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'transaction') {
            const tx: LiveTransaction = { ...msg.data, isNew: true };
            setTransactions(prev => {
              const next = [tx, ...prev].slice(0, MAX_TXS);
              // Clear isNew after 2s via timeout trick
              return next;
            });
            setStats(prev => ({
              total: prev.total + 1,
              suspicious: prev.suspicious + (tx.isSuspicious ? 1 : 0),
            }));
          }
        } catch {}
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setConnected(false);
        // Reconnect after 3s
        reconnectRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      if (mountedRef.current) {
        reconnectRef.current = setTimeout(connect, 5000);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { transactions, connected, stats };
}
