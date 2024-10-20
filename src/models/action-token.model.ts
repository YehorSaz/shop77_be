import mongoose from 'mongoose';

import { ActionTokenTypeEnum } from '../enums/action-token-type.enum';
import { IActionToken } from '../interfaces';
import { UserModel } from './user.model';

const { Schema } = mongoose;

const actionTokenSchema = new Schema(
  {
    actionToken: { type: String, required: true },
    type: { type: String, required: true, enum: ActionTokenTypeEnum },

    _userId: { type: Schema.Types.ObjectId, required: true, ref: UserModel },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ActionToken = mongoose.model<IActionToken>(
  'action-tokens',
  actionTokenSchema,
);
