import { NextFunction, Request, Response } from 'express';

import { ListSocketEnum } from '../enums/socket.enums';
import { ApiError } from '../errors/api-error';
import {
  getAffectedUsers,
  getAffectedUsersPopulated,
} from '../helpers/getAffectedUsers';
import { IPurchase, IPurchaseList } from '../interfaces';
import { io } from '../main';
import { purchaseListService } from '../services';

class PurchaseListController {
  public async getAllByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.res.locals.jwtPayload.userId as string;
      const result = await purchaseListService.getAllByUserId(userId);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  public getListById = (req: Request, res: Response, next: NextFunction) => {
    const purchaseList = res.locals.purchaseList;
    res.status(200).json(purchaseList);
  };

  public async addPurchaseList(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.res.locals.jwtPayload.userId as string;
      const dto = req.body as IPurchaseList;
      const result = await purchaseListService.addPurchaseList(userId, dto);
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
      const updatedList = await purchaseListService.addItem(
        purchaseListId,
        preparedItem,
      );

      const affectedUsers = getAffectedUsersPopulated(updatedList);

      affectedUsers.forEach((user) => {
        io.to(user).emit(ListSocketEnum.ITEM_ADDED, updatedList);
      });

      res.status(201).json(updatedList);
    } catch (e) {
      next(e);
    }
  }

  public async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { purchaseListId, itemId } = req.params;

      const userId = req.res.locals.jwtPayload.userId as string;

      const updatedList = await purchaseListService.deleteItem(
        purchaseListId,
        itemId,
        userId,
      );

      const affectedUsers = getAffectedUsersPopulated(updatedList);
      affectedUsers.forEach((user) => {
        io.to(user).emit(ListSocketEnum.ITEM_DELETED, updatedList);
      });

      res.status(201).json(updatedList);
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
      console.log('updateDto', updateDto);

      const updatedList = await purchaseListService.updatePurchaseList(
        purchaseListId,
        updateDto,
      );

      const affectedUsers = getAffectedUsersPopulated(updatedList);
      affectedUsers.forEach((user) => {
        io.to(user).emit(ListSocketEnum.LIST_UPDATED, updatedList);
      });

      res.status(200).json(updatedList);
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

      const deletedList = await purchaseListService.deletePurchaseList(
        purchaseListId,
        userId,
      );
      const affectedUsers = getAffectedUsers(deletedList);

      affectedUsers.forEach((id: string) => {
        io.to(id).emit(ListSocketEnum.LIST_DELETED, purchaseListId);
      });

      res.status(200).json({ success: !!deletedList });
    } catch (e) {
      next(e);
    }
  }

  public async shareList(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.res.locals.jwtPayload.userId as string;
      const { purchaseListId } = req.params;
      const { usersId } = req.body;

      console.log('usersId', usersId);
      console.log('purchaseListId', purchaseListId);

      if (!usersId) {
        throw new ApiError('No users to share', 400);
      }
      const result = await purchaseListService.shareList(
        purchaseListId,
        usersId,
        ownerId,
      );
      console.log('result', result);

      usersId.forEach((id: string) => {
        io.to(id).emit(ListSocketEnum.LIST_SHARED, result);
      });

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
