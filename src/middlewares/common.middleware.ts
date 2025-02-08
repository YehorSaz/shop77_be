import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';

import { ApiError } from '../errors/api-error';
import { userRepository } from '../repositories';
import { purchaseListRepository } from '../repositories/purchase-list.repository';

class CommonMiddleware {
  public isAuthWithGoogle() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = await userRepository.getByParams({
          email: req.body.email,
        });
        const isGoogleAuth = user.isGoogleAuth;
        if (isGoogleAuth) {
          throw new ApiError('This account requires Google Sign-In.', 400);
        }
        next();
      } catch (e) {
        next(e);
      }
    };
  }

  public isBodyValid(validator: ObjectSchema) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = await validator.validateAsync(req.body);
        next();
      } catch (e) {
        if (e.details[0].message.startsWith('"email"')) {
          next(new ApiError('It is not an email', 400));
        } else {
          next(new ApiError(e.details[0].message, 400));
        }
      }
    };
  }

  public isPurchaseBodyValid(validator: ObjectSchema) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = await validator.validateAsync(req.body);
        next();
      } catch (e) {
        next(e);
      }
    };
  }

  public isOwner() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.res.locals.jwtPayload.userId as string;
      const purchaseListId = req.params.purchaseListId;
      try {
        const purchaseList =
          await purchaseListRepository.getById(purchaseListId);
        if (!purchaseList) {
          throw new ApiError('Purchase list not found', 404);
        }
        if (purchaseList.user.toString() !== userId) {
          throw new ApiError(
            'You are not authorized to update this purchase list',
            403,
          );
        }
        next();
      } catch (e) {
        next(e);
      }
    };
  }
}

export const commonMiddleware = new CommonMiddleware();
