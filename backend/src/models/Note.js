import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, index: true },
    keywords: { type: String, default: "" },

    uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },

    aiSummary: { type: String, default: "" },
    aiQuiz: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Note", schema);
