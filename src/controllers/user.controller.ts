import { NextFunction, Request, Response } from 'express';

import { IUser } from '../interfaces/user.interface';
import { userService } from '../services/user.service';

class UserController {
  public async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.getAll();
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as any;
      const result = await userService.create(dto);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;
      const user = await userService.getById(userId);
      res.status(201).json(user);
    } catch (e) {
      next(e);
    }
  }

  public async updateById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;
      const dto = req.body as IUser;

      const user = await userService.updateById(userId, dto);
      res.status(201).json(user);
    } catch (e) {
      next(e);
    }
  }

  public async deleteById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.params.userId;
      await userService.deleteById(userId);
    } catch (e) {
      next(e);
    }
  }
}

export const userController = new UserController();
