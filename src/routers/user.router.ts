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

//get user by email
router.get(
  '/email',
  authMiddleware.checkAccessToken,
  commonMiddleware.isQueryValid('email', UserValidator.queryEmail),
  userController.getByEmail,
);

// get user by Id
router.get('/:userId', authMiddleware.checkAccessToken, userController.getById);

// add friends
router.post(
  '/friends/add/:friendId',
  authMiddleware.checkAccessToken,
  commonMiddleware.isQueryParamValid(UserValidator.friendId),
  userController.addFriend,
);

// delete it from friends
router.delete(
  '/friends/delete/:friendId',
  authMiddleware.checkAccessToken,
  commonMiddleware.isQueryParamValid(UserValidator.friendId),
  userController.delFromFriends,
);

export const userRouter = router;
