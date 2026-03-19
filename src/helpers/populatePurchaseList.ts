import { PurchaseListModel } from '../models';

export const populatePurchaseList = (query: any) => {
  return PurchaseListModel.find(query)
    .populate('user', 'name email')
    .populate('sharedWith', 'name email')
    .populate('items.addedBy', 'name email');
};
