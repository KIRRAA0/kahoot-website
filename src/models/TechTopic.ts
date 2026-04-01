import mongoose, { Schema, models } from "mongoose";

const TechTopicSchema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.TechTopic || mongoose.model("TechTopic", TechTopicSchema);
