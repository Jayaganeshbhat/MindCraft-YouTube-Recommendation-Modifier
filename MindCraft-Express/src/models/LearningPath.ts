// models/LearningPath.ts
import mongoose, { Schema, InferSchemaType, model } from 'mongoose';

const learningPathSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    googleId: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    name: { type: String },
    pathType: { type: String },
    selectedRoleOrSkill: { type: String },
    currentLevel: { type: String },
    pace: { type: String },
    finishIn: { type: Number },
    finishUnit: { type: String },
    targetDays: { type: Number },
    minutesPerDay: { type: Number },

    planMarkdown: { type: String },
    onlineResources: { type: Schema.Types.Mixed },
    youtubeResources: { type: Schema.Types.Mixed },
    aiPlanMeta: {
      provider: { type: String },
      model: { type: String },
      responseId: { type: String },
      durationMs: { type: Number },
      createdAt: { type: Date },
    },
  },
  { timestamps: true },
);

// Helpful compound index for user scoping & recent items
learningPathSchema.index({ userId: 1, createdAt: -1 });

export type LearningPathDoc = InferSchemaType<typeof learningPathSchema>;
export default mongoose.models.LearningPath ||
  model<LearningPathDoc>('LearningPath', learningPathSchema);
