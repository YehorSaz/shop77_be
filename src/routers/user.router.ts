import { Router } from 'express';

import { userController } from '../controllers/user.controller';
import { commonMiddleware } from '../middlewares/common.middleware';
import { UserValidator } from '../validators/user.validator';

const router = Router();

// get all users
router.get('/', userController.getAll);

// create new user
router.post(
  '/',
  commonMiddleware.isBodyValid(UserValidator.createUser),
  userController.create,
);

// get user by Id
router.get(
  '/:userId',
  commonMiddleware.isIdValid('userId'),
  userController.getById,
);

// update user
router.put(
  '/:userId',
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
