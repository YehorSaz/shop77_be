import { Router } from 'express';

import { authController } from '../controllers/auth.controller';
import { ActionTokenTypeEnum } from '../enums/action-token-type.enum';
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
  commonMiddleware.isAuthWithGoogle(),
  commonMiddleware.isBodyValid(UserValidator.login),
  authController.signIn,
);

// refresh
router.post(
  '/refresh',
  authMiddleware.checkRefreshToken,
  authController.refresh,
);

router.get(
  '/verify',
  authMiddleware.checkActionToken(ActionTokenTypeEnum.VERIFY_EMAIL),
  authController.verify,
);

router.post(
  '/change-password',
  authMiddleware.checkAccessToken,
  commonMiddleware.isBodyValid(UserValidator.changePassword),
  authController.changePassword,
);

router.post(
  '/forgot-password',
  commonMiddleware.isBodyValid(UserValidator.forgotPassword),
  authController.forgotPassword,
);

router.put(
  '/forgot-password',
  commonMiddleware.isBodyValid(UserValidator.forgotPasswordSet),
  authMiddleware.checkActionToken(ActionTokenTypeEnum.FORGOT_PASSWORD),
  authController.forgotPasswordSet,
);

router.post('/google', authController.googleSignIn);

export const authRouter = router;
