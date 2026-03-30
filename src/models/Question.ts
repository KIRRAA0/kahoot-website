import mongoose, { Schema, models } from "mongoose";

const AnswerSchema = new Schema(
  {
    id: { type: Number, required: true },
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const QuestionSchema = new Schema({
  assessmentId: { type: Schema.Types.ObjectId, ref: "Assessment", required: true, index: true },
  number: { type: Number, required: true },
  text: { type: String, required: true },
  answers: { type: [AnswerSchema], required: true },
  timeLimit: { type: Number, default: 30 },
  correctAnswerIndices: { type: [Number], required: true },
  bookmarkedBy: { type: [String], default: [] },
});

export default models.Question || mongoose.model("Question", QuestionSchema);
