"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RoomPollResponse } from "@/lib/types";

export function useRoomPoll(code: string, userName: string, enabled: boolean) {
  const [data, setData] = useState<RoomPollResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}?userName=${encodeURIComponent(userName)}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to fetch room");
        return;
      }
      const json: RoomPollResponse = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [code, userName]);

  useEffect(() => {
    if (!enabled || !code) return;

    // Immediate first poll
    poll();

    // Poll every 1.5 seconds
    intervalRef.current = setInterval(poll, 1500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, code, poll]);

  return {
    room: data?.room ?? null,
    currentQuestion: data?.currentQuestion ?? null,
    scores: data?.scores ?? [],
    previousQuestionResults: data?.previousQuestionResults ?? null,
    loading,
    error,
    refetch: poll,
  };
}
