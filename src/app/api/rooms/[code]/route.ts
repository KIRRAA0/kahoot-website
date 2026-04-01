import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Room from "@/models/Room";
import Question from "@/models/Question";
import { computeScores, advanceRoomState } from "@/lib/roomUtils";
import { publishRoomUpdate } from "@/lib/pusher-server";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params;

    await connectDB();

    const room = await Room.findOne({ code });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // ─── State machine: check for transitions ─────────────────
    const { transitioned, type } = advanceRoomState(room);
    if (transitioned) {
      await room.save();
      await publishRoomUpdate(code, { type });
    }

    // ─── Build response ───────────────────────────────────────
    const roomObj = room.toObject();

    // Compute running scores
    const scores = computeScores(roomObj.answers, roomObj.participants);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = {
      room: roomObj,
      scores,
    };

    // If playing, include current question (WITHOUT correct answer info)
    if (room.status === "playing") {
      const questions = await Question.find({ assessmentId: room.assessmentId })
        .sort({ number: 1 })
        .lean();
      const q = questions[room.currentQuestionIndex];
      if (q) {
        response.currentQuestion = {
          _id: q._id,
          assessmentId: q.assessmentId,
          number: q.number,
          text: q.text,
          answers: q.answers.map((a: { id: number; text: string }) => ({
            id: a.id,
            text: a.text,
            // isCorrect intentionally omitted
          })),
          timeLimit: q.timeLimit,
        };
      }
    }

    // If scoreboard, include previous question results
    if (room.status === "scoreboard" || room.status === "finished") {
      const prevIndex =
        room.status === "finished"
          ? room.currentQuestionIndex
          : room.currentQuestionIndex - 1;

      if (prevIndex >= 0) {
        const questions = await Question.find({ assessmentId: room.assessmentId })
          .sort({ number: 1 })
          .lean();
        const prevQ = questions[prevIndex];
        if (prevQ) {
          const correctIdx = prevQ.answers.findIndex(
            (a: { isCorrect: boolean }) => a.isCorrect
          );
          const answersForPrev = roomObj.answers.filter(
            (a: { questionIndex: number }) => a.questionIndex === prevIndex
          );
          response.previousQuestionResults = {
            questionIndex: prevIndex,
            questionText: prevQ.text,
            correctAnswerIndex: correctIdx,
            participantResults: roomObj.participants.map((p: { userName: string }) => {
              const ans = answersForPrev.find(
                (a: { userName: string }) => a.userName === p.userName
              );
              return {
                userName: p.userName,
                selectedIndex: ans ? ans.selectedIndex : -1,
                isCorrect: ans ? ans.isCorrect : false,
                timeSpent: ans ? ans.timeSpent : 0,
              };
            }),
          };
        }
      }
    }

    // Strip correct answer info from room.answers when game is still in progress
    if (room.status === "playing" || room.status === "scoreboard") {
      // Keep answers but they don't reveal which option is correct for future questions
      // (isCorrect per answer is fine to share — it's the user's own result)
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
