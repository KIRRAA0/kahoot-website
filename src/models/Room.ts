import mongoose, { Schema, models } from "mongoose";

const RoomParticipantSchema = new Schema(
  {
    userName: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const RoomAnswerSchema = new Schema(
  {
    userName: { type: String, required: true },
    questionIndex: { type: Number, required: true },
    selectedIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    timeSpent: { type: Number, default: 0 },
  },
  { _id: false }
);

const RoomSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    assessmentId: { type: Schema.Types.ObjectId, ref: "Assessment", required: true },
    hostName: { type: String, required: true },
    status: {
      type: String,
      enum: ["waiting", "playing", "scoreboard", "finished"],
      default: "waiting",
    },
    participants: { type: [RoomParticipantSchema], default: [] },
    currentQuestionIndex: { type: Number, default: 0 },
    questionStartedAt: { type: Date, default: null },
    scoreboardUntil: { type: Date, default: null },
    answers: { type: [RoomAnswerSchema], default: [] },
    totalQuestions: { type: Number, required: true },
    questionTimeLimits: { type: [Number], required: true },
  },
  { timestamps: true }
);

export default models.Room || mongoose.model("Room", RoomSchema);
