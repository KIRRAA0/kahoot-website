"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useRoomPoll } from "@/hooks/useRoomPoll";
import RoomLobby from "@/components/multiplayer/RoomLobby";
import MultiplayerQuizPlayer from "@/components/multiplayer/MultiplayerQuizPlayer";
import Scoreboard from "@/components/multiplayer/Scoreboard";
import MultiplayerResults from "@/components/multiplayer/MultiplayerResults";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<boolean | null>(null);
  const [lastAnsweredQuestion, setLastAnsweredQuestion] = useState(-1);
  const [questionsData, setQuestionsData] = useState<
    { text: string; answers: { text: string; isCorrect: boolean }[] }[]
  >([]);

  useEffect(() => {
    const user = localStorage.getItem("kahoot-mp-user");
    if (!user) {
      router.push("/multiplayer");
      return;
    }
    setCurrentUser(user);
  }, [router]);

  const { room, currentQuestion, scores, previousQuestionResults, loading, error } =
    useRoomPoll(code, currentUser || "", !!currentUser);

  // Reset answer result when question changes
  useEffect(() => {
    if (room && room.currentQuestionIndex !== lastAnsweredQuestion) {
      setAnswerResult(null);
    }
  }, [room, lastAnsweredQuestion]);

  // Load questions data when room finishes (for results view)
  useEffect(() => {
    if (room?.status === "finished" && room.assessmentId && questionsData.length === 0) {
      fetch(`/api/assessments/${room.assessmentId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.questions) {
            setQuestionsData(
              data.questions.map((q: { text: string; answers: { text: string; isCorrect: boolean }[] }) => ({
                text: q.text,
                answers: q.answers,
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [room?.status, room?.assessmentId, questionsData.length]);

  const handleStart = useCallback(async () => {
    if (!currentUser) return;
    try {
      await fetch(`/api/rooms/${code}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: currentUser }),
      });
    } catch {
      // Poll will pick up the state change
    }
  }, [code, currentUser]);

  const handleAnswer = useCallback(
    async (selectedIndex: number, timeSpent: number) => {
      if (!currentUser || !room) return;

      try {
        const res = await fetch(`/api/rooms/${code}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: currentUser,
            questionIndex: room.currentQuestionIndex,
            selectedIndex,
            timeSpent,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setAnswerResult(data.isCorrect);
          setLastAnsweredQuestion(room.currentQuestionIndex);
        }
      } catch {
        // Will retry on next poll cycle
      }
    },
    [code, currentUser, room]
  );

  if (!currentUser || loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center card p-8 max-w-sm">
          <h2 className="text-xl font-bold text-incorrect mb-2">Room Not Found</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            {error || "This room doesn't exist or has expired."}
          </p>
          <button
            onClick={() => router.push("/multiplayer")}
            className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
          >
            Back to Multiplayer
          </button>
        </div>
      </div>
    );
  }

  // Check if current user has answered the current question
  const hasAnswered = room.answers.some(
    (a) => a.userName === currentUser && a.questionIndex === room.currentQuestionIndex
  );

  // ─── Render based on room status ───────────────────────────
  if (room.status === "waiting") {
    return <RoomLobby room={room} currentUser={currentUser} onStart={handleStart} />;
  }

  if (room.status === "playing" && currentQuestion) {
    return (
      <MultiplayerQuizPlayer
        room={room}
        question={currentQuestion}
        currentUser={currentUser}
        scores={scores}
        onAnswer={handleAnswer}
        hasAnswered={hasAnswered}
        answerResult={answerResult}
      />
    );
  }

  if (room.status === "scoreboard" && previousQuestionResults) {
    return (
      <Scoreboard
        previousQuestionResults={previousQuestionResults}
        scores={scores}
        currentQuestionIndex={room.currentQuestionIndex}
        totalQuestions={room.totalQuestions}
      />
    );
  }

  if (room.status === "finished") {
    return (
      <MultiplayerResults
        room={room}
        questionsData={questionsData}
      />
    );
  }

  // Fallback loading state (transition between states)
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
