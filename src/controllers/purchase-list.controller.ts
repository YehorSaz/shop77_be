import { NextFunction, Request, Response } from 'express';

import { ApiError } from '../errors/api-error';
import { IPurchase, IPurchaseList } from '../interfaces';
import { purchaseListService } from '../services';

class PurchaseListController {
  private static preparedItemsWithUserId(
    items: IPurchase[] | undefined,
    userId: string,
  ): IPurchase[] | undefined {
    return items?.map((item) => ({
      ...item,
      addedBy: userId,
    }));
  }

  public async getAllByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.res.locals.jwtPayload.userId as string;
      const result = await purchaseListService.getAllByUserId(userId);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async addPurchaseList(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.res.locals.jwtPayload.userId as string;
      const dto = req.body as IPurchaseList;
      if (
        (!dto.items || dto.items.length === 0) &&
        (!dto.sharedWith || dto.sharedWith.length === 0)
      ) {
        throw new ApiError(
          'Cannot create a list without items or shared access',
          400,
        );
      }
      const preparedDto = {
        ...dto,
        items: PurchaseListController.preparedItemsWithUserId(
          dto.items,
          userId,
        ),
      };
      const result = await purchaseListService.addPurchaseList(
        userId,
        preparedDto,
      );
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { purchaseListId } = req.params;
      const userId = req.res.locals.jwtPayload.userId as string;
      const dto = req.body.item as IPurchase;
      const preparedItem = {
        ...dto,
        addedBy: userId,
      };
      const result = await purchaseListService.addItem(
        purchaseListId,
        preparedItem,
      );
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { purchaseListId, itemId } = req.params;

      const userId = req.res.locals.jwtPayload.userId as string;

      const result = await purchaseListService.deleteItem(
        purchaseListId,
        itemId,
        userId,
      );
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { purchaseListId, itemId } = req.params;

      const userId = req.res.locals.jwtPayload.userId as string;

      const { name, isCompleted } = req.body;

      if (!name && isCompleted === undefined) {
        throw new ApiError('Nothing to update', 400);
      }

      const result = await purchaseListService.updateItem(
        purchaseListId,
        itemId,
        userId,
        { name, isCompleted },
      );
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async updatePurchaseList(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { purchaseListId } = req.params;
      const updateDto = req.body;

      const result = await purchaseListService.updatePurchaseList(
        purchaseListId,
        updateDto,
      );
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async deletePurchaseList(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { purchaseListId } = req.params;
      const userId = req.res.locals.jwtPayload.userId as string;

      const result = await purchaseListService.deletePurchaseList(
        purchaseListId,
        userId,
      );
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async shareList(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.res.locals.jwtPayload.userId as string;
      const { purchaseListId } = req.params;
      const { usersId } = req.body;
      if (!usersId) {
        throw new ApiError('No users to share', 400);
      }
      const result = await purchaseListService.shareList(
        purchaseListId,
        usersId,
        ownerId,
      );
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async unShareList(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.res.locals.jwtPayload.userId as string;
      const { purchaseListId } = req.params;
      const { usersId, unShareAll } = req.body;
      const result = await purchaseListService.unShareList(
        purchaseListId,
        usersId,
        unShareAll,
        ownerId,
      );
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }
}

export const purchaseController = new PurchaseListController();
