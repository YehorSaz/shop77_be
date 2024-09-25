import { Router } from 'express';

import { userController } from '../controllers';
import { authMiddleware, commonMiddleware } from '../middlewares';
import { UserValidator } from '../validators';

const router = Router();

// get all users
router.get('/', userController.getAll);

// get user by Id
router.get(
  '/:userId',
  commonMiddleware.isIdValid('userId'),
  userController.getById,
);

// update user
router.put(
  '/:userId',
  authMiddleware.checkAccessToken,
  commonMiddleware.isIdValid('userId'),
  commonMiddleware.isBodyValid(UserValidator.updateUser),
  userController.updateById,
);

// delete user
router.delete(
  '/:userId',
  commonMiddleware.isIdValid('userId'),
  userController.deleteById,
);

export const userRouter = router;
