"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const INITIAL_FETCH_RETRIES = 5;
const INITIAL_FETCH_RETRY_DELAY_MS = 500;

type Metrics = {
  balance: number;
  daysToZero: number;
  riskScore: number;
  spendingTrend: Array<{
    date: string;
    amount: number;
  }>;
  insight: string;
};

interface SocketContextType {
  metrics: Metrics | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  metrics: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    const controller = new AbortController();
    const retryTimers = new Set<ReturnType<typeof setTimeout>>();
    const socketInstance = io(apiUrl);
    let isLoadingMetrics = false;

    const clearRetryTimers = () => {
      retryTimers.forEach((retryTimer) => clearTimeout(retryTimer));
      retryTimers.clear();
    };

    const loadMetrics = async (attempt = 0) => {
      if (controller.signal.aborted || isLoadingMetrics) {
        return;
      }

      isLoadingMetrics = true;

      try {
        const response = await fetch(`${apiUrl}/api/health`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to load metrics (${response.status})`);
        }

        const data = (await response.json()) as Metrics;
        clearRetryTimers();
        setMetrics(data);
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        if (attempt < INITIAL_FETCH_RETRIES - 1) {
          const retryTimer = setTimeout(() => {
            retryTimers.delete(retryTimer);
            void loadMetrics(attempt + 1);
          }, INITIAL_FETCH_RETRY_DELAY_MS * (attempt + 1));

          retryTimers.add(retryTimer);
          return;
        }

        console.error("Failed to load initial metrics", error);
      } finally {
        isLoadingMetrics = false;
      }
    };

    socketInstance.on("connect", () => {
      setIsConnected(true);
      void loadMetrics();
    });

    socketInstance.on("metrics-update", (data: Metrics) => {
      clearRetryTimers();
      setMetrics(data);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    // Initial fetch
    void loadMetrics();

    return () => {
      controller.abort();
      clearRetryTimers();
      socketInstance.disconnect();
    };
  }, [apiUrl]);

  return (
    <SocketContext.Provider value={{ metrics, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
