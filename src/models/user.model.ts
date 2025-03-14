import mongoose from 'mongoose';

import { IUser } from '../interfaces';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    phone: { type: String, required: false },
    isVerified: { type: Boolean, required: true, default: false },
    isGoogleAuth: { type: Boolean, required: true, default: false },
    purchaseLists: {
      myLists: [{ type: mongoose.Schema.ObjectId, ref: 'purchaseLists' }],
      sharedLists: [{ type: mongoose.Schema.ObjectId, ref: 'purchaseLists' }],
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const UserModel = mongoose.model<IUser>('users', userSchema);
