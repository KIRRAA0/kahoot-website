import mongoose, { Schema, models } from "mongoose";

const MaterialSchema = new Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    week: { type: Number, required: true },
  },
  { timestamps: true }
);

export default models.Material || mongoose.model("Material", MaterialSchema);
