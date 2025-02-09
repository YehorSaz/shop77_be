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

// add friends
router.post(
  '/friends',
  authMiddleware.checkAccessToken,
  commonMiddleware.isBodyValid(UserValidator.addFriend),
  userController.addFriend,
);

// delete from friends
router.delete(
  '/friends',
  authMiddleware.checkAccessToken,
  commonMiddleware.isBodyValid(UserValidator.addFriend),
  userController.delFromFriends,
);

export const userRouter = router;
