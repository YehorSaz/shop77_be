import { ApiError } from '../errors/api-error';
import { IPurchase, IPurchaseList } from '../interfaces';
import { PurchaseListModel, UserModel } from '../models';

class PurchaseListRepository {
  public async getAllByUserId(userId: string): Promise<IPurchaseList[]> {
    return await PurchaseListModel.find({ user: userId });
  }

  public async getById(id: string): Promise<IPurchaseList> {
    return await PurchaseListModel.findById(id);
  }

  public async addPurchaseList(
    userId: string,
    dto: IPurchaseList,
  ): Promise<IPurchaseList> {
    const purchaseList = await PurchaseListModel.create({
      title: dto.title,
      items: dto.items,
      user: userId,
      sharedWith: dto.sharedWith,
    });
    await UserModel.findByIdAndUpdate(userId, {
      $push: { purchaseLists: purchaseList._id },
    });

    return purchaseList;
  }

  public async addItem(
    purchaseListId: string,
    preparedItem: IPurchase,
  ): Promise<IPurchaseList> {
    const purchaseList = await PurchaseListModel.findByIdAndUpdate(
      purchaseListId,
      { $push: { items: preparedItem } },
      {
        new: true,
      },
    );

    if (!purchaseListId) {
      throw new ApiError('Purchase list not found', 404);
    }
    return purchaseList;
  }

  public async deleteItem(
    purchaseListId: string,
    itemId: string,
    userId: string,
  ): Promise<IPurchaseList> {
    const purchaseList = await PurchaseListModel.findById(purchaseListId);

    if (!purchaseList) {
      throw new ApiError('Purchase list not found', 404);
    }

    const isOwner = purchaseList.user.toString() === userId;

    const itemIndex = purchaseList.items.findIndex(
      (item) => item._id.toString() === itemId,
    );

    if (itemIndex === -1) {
      throw new ApiError('Item not found', 404);
    }

    const isItemAuthor =
      purchaseList.items[itemIndex].addedBy.toString() === userId;

    if (!isOwner && !isItemAuthor) {
      throw new ApiError('You are not authorized to delete this item', 403);
    }

    purchaseList.items.splice(itemIndex, 1);

    await purchaseList.save();

    return purchaseList;
  }

  public async updateItem(
    purchaseListId: string,
    itemId: string,
    userId: string,
    updateData: Partial<IPurchase>,
  ): Promise<IPurchaseList> {
    const purchaseList = await PurchaseListModel.findById(purchaseListId);
    if (!purchaseList) {
      throw new ApiError('Purchase list not found', 404);
    }

    const item = purchaseList.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      throw new ApiError('Item not found', 404);
    }

    if (
      item.addedBy.toString() !== userId &&
      purchaseList.user.toString() !== userId
    ) {
      throw new ApiError('You are not authorized to update this item', 403);
    }

    if (updateData.name) item.name = updateData.name;
    if (updateData.isCompleted) item.isCompleted = updateData.isCompleted;

    await purchaseList.save();
    return purchaseList;
  }

  public async updatePurchaseList(
    purchaseListId: string,
    updateDto: Partial<IPurchaseList>,
  ): Promise<IPurchaseList> {
    const updatedList = await PurchaseListModel.findByIdAndUpdate(
      purchaseListId,
      updateDto,
      {
        new: true,
      },
    );

    if (!updatedList) {
      throw new ApiError('Purchase list not found', 404);
    }

    return updatedList;
  }

  public async deletePurchaseList(purchaseListId: string, userId: string) {
    const purchaseList = await PurchaseListModel.findById(purchaseListId);
    if (!purchaseList) {
      throw new ApiError('Purchase list not found', 404);
    }

    if (purchaseList.user.toString() !== userId) {
      throw new ApiError(
        'You are not authorized to delete this purchase list',
        403,
      );
    }

    await PurchaseListModel.findByIdAndDelete(purchaseList);
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { purchaseLists: purchaseListId },
    });
  }

  public async shareList(
    purchaseListId: string,
    userId: string,
  ): Promise<IPurchaseList> {
    return await PurchaseListModel.findByIdAndUpdate(
      purchaseListId,
      { $addToSet: { sharedWith: userId } },
      { new: true },
    );
  }

  public async unShareList(
    purchaseListId: string,
    userId: string,
  ): Promise<IPurchaseList> {
    return await PurchaseListModel.findByIdAndUpdate(
      purchaseListId,
      { $pull: { sharedWith: userId } },
      { new: true },
    );
  }
}

export const purchaseListRepository = new PurchaseListRepository();
