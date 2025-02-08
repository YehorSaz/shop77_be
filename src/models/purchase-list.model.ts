import mongoose from 'mongoose';

import { IPurchaseList } from '../interfaces';

const { Schema } = mongoose;

const purchaseSchema = new Schema(
  {
    name: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },
  { _id: true },
);

const purchaseListSchema = new Schema(
  {
    title: { type: String, required: true },
    items: { type: [purchaseSchema], required: true },
    reactId: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
export const PurchaseListModel = mongoose.model<IPurchaseList>(
  'purchaseLists',
  purchaseListSchema,
);
