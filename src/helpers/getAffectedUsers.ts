import { IPurchaseList, IPurchaseListPopulated } from '../interfaces';

export const getAffectedUsers = (purchaseList: IPurchaseList): string[] => {
  const ownerId = purchaseList.user.toString();
  const sharedIds = purchaseList.sharedWith.map((id: any) => id.toString());
  return [ownerId, ...sharedIds];
};

export const getAffectedUsersPopulated = (
  purchaseList: IPurchaseListPopulated,
): string[] => {
  const ownerId = purchaseList.user._id.toString();
  const sharedIds = purchaseList.sharedWith.map((item) => item._id.toString());
  return [ownerId, ...sharedIds];
};
