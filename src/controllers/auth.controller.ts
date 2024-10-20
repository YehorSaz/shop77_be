import path from 'node:path';

import { NextFunction, Request, Response } from 'express';

import {
  IChangePass,
  ITokenPayload,
  IUser,
  SignInPayload,
} from '../interfaces';
import { authService } from '../services';

class AuthController {
  public async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as IUser;
      const result = await authService.signUp(dto);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }
  public async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as SignInPayload;
      const result = await authService.signIn(dto);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }
  public async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;
      const oldTokensId = req.res.locals.oldTokensId as string;
      const result = await authService.refresh(jwtPayload, oldTokensId);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;
      await authService.verify(jwtPayload);
      res
        .status(200)
        .sendFile(
          path.join(
            process.cwd(),
            'src',
            'templates',
            'views',
            'verify-success.html',
          ),
        );
    } catch (e) {
      res
        .status(400)
        .sendFile(
          path.join(
            process.cwd(),
            'src',
            'templates',
            'views',
            'verify-fail.html',
          ),
        );
      next(e);
    }
  }

  public async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;
      const dto = req.body as IChangePass;
      await authService.changePassword(jwtPayload, dto);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }
}

export const authController = new AuthController();
