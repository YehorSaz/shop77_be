import { IPurchaseList } from '../interfaces';

export const getAffectedUsers = (purchaseList: IPurchaseList): string[] => {
  const ownerId = purchaseList.user.toString();
  const sharedIds = purchaseList.sharedWith.map((id: any) => id.toString());
  return [ownerId, ...sharedIds];
};
