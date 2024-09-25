import { Router } from 'express';

import { userController } from '../controllers';
import { authMiddleware, commonMiddleware } from '../middlewares';
import { UserValidator } from '../validators';

const router = Router();

// get all users
router.get('/', authMiddleware.checkAccessToken, userController.getAll);

// get me
router.get('/me', authMiddleware.checkAccessToken, userController.getMe);

// update me
router.put(
  '/me',
  authMiddleware.checkAccessToken,
  commonMiddleware.isBodyValid(UserValidator.updateUser),
  userController.updateMe,
);

// delete me
router.delete('/me', authMiddleware.checkAccessToken, userController.deleteMe);

// get user by Id
router.get('/:userId', authMiddleware.checkAccessToken, userController.getById);

export const userRouter = router;
