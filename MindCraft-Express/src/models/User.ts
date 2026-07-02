import mongoose, { Schema, InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    googleId: { type: String, required: true, index: true, unique: true },
    email: { type: String, index: true },
    name: { type: String },
    photo: { type: String },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel =
  mongoose.models.User || mongoose.model('User', userSchema);
