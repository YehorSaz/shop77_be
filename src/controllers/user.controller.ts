import { NextFunction, Request, Response } from 'express';

import { IUserPublic } from '../interfaces';
import { io } from '../main';
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

  public async getByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.query.email as string;
      console.log(`Fetching user by email: ${email}`);
      const user = await userService.getByEmail(email);
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
      const { friendId } = req.params;
      await userService.addFriend(userId, friendId);

      const updatedUser = await userService.getById(userId);
      const updatedFriend = await userService.getById(friendId);

      io.to(userId).emit('friend-added', updatedFriend);
      io.to(friendId).emit('friend-added', updatedUser);

      res.status(200).json(updatedFriend);
    } catch (e) {
      next(e);
    }
  }

  public async delFromFriends(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.res.locals.jwtPayload.userId as string;
      const { friendId } = req.params;
      await userService.delFromFriends(userId, friendId);

      io.to(userId).emit('friend-removed', friendId);
      io.to(friendId).emit('friend-removed', userId);
      console.log(`Friend removed: ${userId} -> ${friendId}`);

      res.status(200).json(friendId);
    } catch (e) {
      next(e);
    }
  }
}

export const userController = new UserController();
