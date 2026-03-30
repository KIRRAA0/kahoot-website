import mongoose, { Schema, models } from "mongoose";

const QuizAnswerSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    selectedIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    timeSpent: { type: Number, default: 0 },
  },
  { _id: false }
);

const QuizAttemptSchema = new Schema(
  {
    assessmentId: { type: Schema.Types.ObjectId, ref: "Assessment", required: true, index: true },
    userName: { type: String, default: "Anonymous" },
    answers: { type: [QuizAnswerSchema], required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    timeSpent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.QuizAttempt || mongoose.model("QuizAttempt", QuizAttemptSchema);
