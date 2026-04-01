"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RoomPollResponse } from "@/lib/types";
import { getPusherClient } from "@/lib/pusher-client";

const FALLBACK_POLL_INTERVAL = 30_000; // 30 seconds

export function useRoomRealtime(code: string, userName: string, enabled: boolean) {
  const [data, setData] = useState<RoomPollResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetching = useRef(false);

  const fetchRoom = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;

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
      isFetching.current = false;
      setLoading(false);
    }
  }, [code, userName]);

  useEffect(() => {
    if (!enabled || !code) return;

    // Immediate first fetch
    fetchRoom();

    // Subscribe to Pusher channel
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`room-${code}`);
    channel.bind("room-updated", () => {
      fetchRoom();
    });

    // Fallback slow polling (safety net)
    const fallback = setInterval(fetchRoom, FALLBACK_POLL_INTERVAL);

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`room-${code}`);
      clearInterval(fallback);
    };
  }, [enabled, code, fetchRoom]);

  return {
    room: data?.room ?? null,
    currentQuestion: data?.currentQuestion ?? null,
    scores: data?.scores ?? [],
    previousQuestionResults: data?.previousQuestionResults ?? null,
    loading,
    error,
    refetch: fetchRoom,
  };
}
