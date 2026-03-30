import mongoose, { Schema, models } from "mongoose";

const AssessmentSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: ["pre-assessment", "post-assessment", "combined"],
      required: true,
    },
    week: { type: Number, default: null },
    weeks: { type: [Number], default: [] },
    questionCount: { type: Number, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.Assessment || mongoose.model("Assessment", AssessmentSchema);
