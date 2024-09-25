import { Router } from 'express';

import { authController } from '../controllers/auth.controller';
import { authMiddleware, commonMiddleware } from '../middlewares';
import { UserValidator } from '../validators';

const router = Router();

// create new user
router.post(
  '/sign-up',
  commonMiddleware.isBodyValid(UserValidator.createUser),
  authController.signUp,
);

// sign in
router.post(
  '/sign-in',
  commonMiddleware.isBodyValid(UserValidator.login),
  authController.signIn,
);

// refresh
router.post(
  '/refresh',
  authMiddleware.checkRefreshToken,
  authController.refresh,
);

export const authRouter = router;
