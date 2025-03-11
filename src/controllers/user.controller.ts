import { NextFunction, Request, Response } from 'express';

import { IUserPublic } from '../interfaces';
import { userService } from '../services';

class UserController {
  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.getAll();
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;
      const user = await userService.getById(userId);
      res.status(200).json(user);
    } catch (e) {
      next(e);
    }
  }

  public async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.res.locals.jwtPayload.userId as string;
      const user = await userService.getMe(userId);
      res.status(200).json(user);
    } catch (e) {
      next(e);
    }
  }

  public async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.res.locals.jwtPayload.userId as string;
      const dto = req.body as IUserPublic;

      const user = await userService.updateById(userId, dto);
      res.status(201).json(user);
    } catch (e) {
      next(e);
    }
  }

  public async deleteMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.res.locals.jwtPayload.userId as string;
      await userService.deleteById(userId);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  public async addFriend(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.res.locals.jwtPayload.userId as string;
      const { friendId } = req.body;
      const result = await userService.addFriend(userId, friendId);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async delFromFriends(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.res.locals.jwtPayload.userId as string;
      const { friendId } = req.body;
      const result = await userService.delFromFriends(userId, friendId);
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }
}

export const userController = new UserController();
