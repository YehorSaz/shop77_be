import { ApiError } from '../errors/api-error';
import { populatePurchaseList } from '../helpers/populatePurchaseList';
import {
  IPurchase,
  IPurchaseList,
  IPurchaseListPopulated,
} from '../interfaces';
import { PurchaseListModel, UserModel } from '../models';

class PurchaseListRepository {
  public async deleteAllPurchaseListsByUserId(userId: string) {
    const purchaseLists = await PurchaseListModel.find({ user: userId });

    if (!purchaseLists.length) return;

    const sharedUsers = new Set<string>();

    for (const list of purchaseLists) {
      list.sharedWith.forEach((user) => sharedUsers.add(user));
    }

    const listIds = purchaseLists.map((list) => list._id);

    await Promise.all([
      PurchaseListModel.deleteMany({ _id: { $in: listIds } }),
      UserModel.updateMany(
        { _id: { $in: Array.from(sharedUsers) } },
        { $pull: { 'purchaseLists.sharedLists': { $in: listIds } } },
      ),
    ]);
  }

  public async getAllByUserId(userId: string): Promise<IPurchaseList[]> {
    const user = await UserModel.findById(userId)
      .select('purchaseLists')
      .lean();

    if (!user) {
      return [];
    }

    // const myLists = await PurchaseListModel.find({
    //   _id: { $in: user.purchaseLists.myLists },
    // }).lean();
    // const sharedLists = await PurchaseListModel.find({
    //   _id: { $in: user.purchaseLists.sharedLists },
    // }).lean();
    const myListsIds = user.purchaseLists.myLists;
    const sharedListsIds = user.purchaseLists.sharedLists;
    const allListsIds = [...myListsIds, ...sharedListsIds];

    const allLists = await populatePurchaseList({ _id: { $in: allListsIds } });

    // Фільтруємо на стороні застосунку
    //     const myLists = allLists.filter(
    //       list => myListsIds.some(id => id === list._id));
    //     const sharedLists = allLists.filter(
    //       list => sharedListsIds.some(id => id === list._id));

    // const myLists = await populatePurchaseList({ _id: { $in: myListsIds } });
    // const sharedLists = await populatePurchaseList({ _id: { $in: sharedListsIds } });

    return allLists;
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
      reactId: dto.reactId,
      items: [],
      user: userId,
      sharedWith: [],
      createdAt: dto.createdAt,
    });
    await UserModel.findByIdAndUpdate(userId, {
      $push: {
        'purchaseLists.myLists': purchaseList._id,
        'purchaseLists.sharedLists': dto.sharedWith?.length
          ? purchaseList._id
          : [],
      },
    });

    const populatedList = await PurchaseListModel.findById(
      purchaseList._id,
    ).populate('user', 'name email');

    return populatedList as IPurchaseList;
  }

  public async addItem(
    purchaseListId: string,
    preparedItem: IPurchase,
  ): Promise<IPurchaseListPopulated> {
    const updatedList = await PurchaseListModel.findByIdAndUpdate(
      purchaseListId,
      { $push: { items: preparedItem } },
      { new: true },
    )
      .populate('user', 'name email')
      .populate('sharedWith', 'name email')
      .populate('items.addedBy', 'name email')
      .lean<IPurchaseListPopulated>();

    if (!purchaseListId) {
      throw new ApiError('Purchase list not found', 404);
    }
    return updatedList;
  }

  public async deleteItem(
    purchaseListId: string,
    itemId: string,
    userId: string,
  ): Promise<IPurchaseListPopulated> {
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

    const updatedList = await PurchaseListModel.findByIdAndUpdate(
      purchaseListId,
      { $pull: { items: { _id: itemId } } },
      { new: true },
    )
      .populate('user', 'name email')
      .populate('sharedWith', 'name email')
      .populate('items.addedBy', 'name email')
      .lean<IPurchaseListPopulated>();

    return updatedList;
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
  ): Promise<IPurchaseListPopulated> {
    const updatedList = await PurchaseListModel.findByIdAndUpdate(
      purchaseListId,
      updateDto,
      {
        new: true,
      },
    )
      .populate('user', 'name email')
      .populate('sharedWith', 'name email')
      .populate('items.addedBy', 'name email')
      .lean<IPurchaseListPopulated>();

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

    await Promise.all([
      PurchaseListModel.findByIdAndDelete(purchaseListId),
      UserModel.findByIdAndUpdate(userId, {
        $pull: {
          'purchaseLists.sharedLists': purchaseListId,
          'purchaseLists.myLists': purchaseListId,
        },
      }),
      UserModel.updateMany(
        { _id: { $in: purchaseList.sharedWith } },
        { $pull: { 'purchaseLists.sharedLists': purchaseListId } },
      ),
    ]);
    return purchaseList;
  }

  public async shareList(
    purchaseListId: string,
    usersId: string[],
    ownerId: string,
  ): Promise<IPurchaseList> {
    await Promise.all([
      UserModel.updateMany(
        { _id: { $in: usersId } },
        { $addToSet: { 'purchaseLists.sharedLists': purchaseListId } },
      ),
    ]);

    return await PurchaseListModel.findByIdAndUpdate(
      purchaseListId,
      { $addToSet: { sharedWith: { $each: usersId } } },
      { new: true },
    )
      .populate('user', 'name email')
      .populate('sharedWith', 'name email')
      .populate('items.addedBy', 'name email')
      .lean();
  }

  public async unShareList(
    purchaseListId: string,
    ownerId: string,
    usersId?: string[],
    unShareAll?: boolean,
  ): Promise<IPurchaseList> {
    let usersToRemove: string[];
    if (unShareAll) {
      const list = await PurchaseListModel.findById(purchaseListId);
      if (!list) {
        throw new ApiError('List not found', 404);
      }
      usersToRemove = [...list.sharedWith, ownerId];
    } else if (usersId && usersId.length > 0) {
      usersToRemove = usersId;
    } else {
      throw new ApiError('No users specified for unsharing', 400);
    }

    await UserModel.updateMany(
      { _id: { $in: usersToRemove } },
      { $pull: { 'purchaseLists.sharedLists': purchaseListId } },
    );

    return await PurchaseListModel.findByIdAndUpdate(purchaseListId, {
      $pull: { sharedWith: { $in: usersToRemove } },
    });
  }
}

export const purchaseListRepository = new PurchaseListRepository();
