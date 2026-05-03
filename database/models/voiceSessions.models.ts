import { IVoiceSession } from "@/types";
import { model, models, Schema } from "mongoose";

const VoiceSessionSchema = new Schema<IVoiceSession>(
  {
    clerkId: { type: String, required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "book", required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    durationSeconds: { type: Number, required: true, default: 0 },
    billingPeriodStart: { type: Date, required: true },
  },
  { timestamps: true }
);

VoiceSessionSchema.index({ clerkId: 1, billingPeriodStart: 1 });
VoiceSessionSchema.index({ bookId: 1, startedAt: -1 });

const VoiceSession =
  models.voiceSession || model<IVoiceSession>("voiceSession", VoiceSessionSchema);

export default VoiceSession;
