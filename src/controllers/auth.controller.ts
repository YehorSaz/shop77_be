import path from 'node:path';

import { NextFunction, Request, Response } from 'express';

import {
  IChangePass,
  IForgotResetPassword,
  IForgotSendEmail,
  ITokenPayload,
  SignInPayload,
  SignUpPayload,
} from '../interfaces';
import { authService } from '../services';

class AuthController {
  public async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as SignUpPayload;
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
      res.status(200).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async googleSignIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { id_token } = req.body;
      const result = await authService.googleSignIn(id_token);
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

  public async setPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;
      const { password } = req.body;
      await authService.setPassword(jwtPayload, password);
      res.status(200).json({ message: 'password created' });
    } catch (e) {
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

  public async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as IForgotSendEmail;
      await authService.forgotPassword(dto);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  public async forgotPasswordSet(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const dto = req.body as IForgotResetPassword;
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;

      await authService.forgotPasswordSet(dto, jwtPayload);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }
}

export const authController = new AuthController();
