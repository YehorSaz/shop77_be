import { IPurchase, IPurchaseList, IPurchaseListResponse } from '../interfaces';
import { purchaseListRepository } from '../repositories/purchase-list.repository';

class PurchaseListService {
  public async getAllByUserId(userId: string): Promise<IPurchaseListResponse> {
    return await purchaseListRepository.getAllByUserId(userId);
  }

  public async addPurchaseList(
    userId: string,
    dto: IPurchaseList,
  ): Promise<IPurchaseList> {
    return await purchaseListRepository.addPurchaseList(userId, dto);
  }

  public async updatePurchaseList(
    purchaseListId: string,
    updateDto: Partial<IPurchaseList>,
  ): Promise<IPurchaseList> {
    return await purchaseListRepository.updatePurchaseList(
      purchaseListId,
      updateDto,
    );
  }

  public async deletePurchaseList(purchaseListId: string, userId: string) {
    return await purchaseListRepository.deletePurchaseList(
      purchaseListId,
      userId,
    );
  }

  public async addItem(
    purchaseListId: string,
    preparedItem: IPurchase,
  ): Promise<IPurchaseList> {
    return await purchaseListRepository.addItem(purchaseListId, preparedItem);
  }

  public async deleteItem(
    purchaseListId: string,
    itemId: string,
    userId: string,
  ): Promise<IPurchaseList> {
    return await purchaseListRepository.deleteItem(
      purchaseListId,
      itemId,
      userId,
    );
  }

  public async updateItem(
    purchaseListId: string,
    itemId: string,
    userId: string,
    updateData: Partial<IPurchase>,
  ): Promise<IPurchaseList> {
    return await purchaseListRepository.updateItem(
      purchaseListId,
      itemId,
      userId,
      updateData,
    );
  }

  public async shareList(
    purchaseListId: string,
    usersId: string[],
    ownerId: string,
  ): Promise<IPurchaseList> {
    return await purchaseListRepository.shareList(
      purchaseListId,
      usersId,
      ownerId,
    );
  }

  public async unShareList(
    purchaseListId: string,
    usersId: string[],
    unShareAll: boolean,
    ownerId: string,
  ): Promise<IPurchaseList> {
    return await purchaseListRepository.unShareList(
      purchaseListId,
      ownerId,
      usersId,
      unShareAll,
    );
  }
}

export const purchaseListService = new PurchaseListService();
