import { ActionTokenTypeEnum } from '../enums/action-token-type.enum';
import { EmailTypeEnum } from '../enums/email-type.enum';
import { ApiError } from '../errors/api-error';
import {
  IChangePass,
  ITokenPair,
  ITokenPayload,
  IUser,
  SignInPayload,
} from '../interfaces';
import {
  actionTokenRepository,
  tokenRepository,
  userRepository,
} from '../repositories';
import { emailService } from './email.service';
import { passwordService } from './password.service';
import { tokenService } from './token.service';

class AuthService {
  public async signUp(
    dto: IUser,
  ): Promise<{ user: IUser; tokens: ITokenPair }> {
    const { email } = dto;
    await this.isEmailExist(email);

    const password = await passwordService.hashPassword(dto.password);
    const user = await userRepository.create({ ...dto, password });

    const tokens = await tokenService.generatePair({ userId: user._id });

    const actionToken = await tokenService.generateActionToken(
      { userId: user._id },
      ActionTokenTypeEnum.VERIFY_EMAIL,
    );

    await tokenRepository.create({ ...tokens, _userId: user._id });

    await actionTokenRepository.create({
      actionToken,
      type: ActionTokenTypeEnum.VERIFY_EMAIL,
      _userId: user._id,
    });

    await emailService.sendEmail(EmailTypeEnum.WELCOME, dto.email, {
      name: dto.name,
      actionToken,
    });
    return { user, tokens };
  }

  public async signIn(
    dto: SignInPayload,
  ): Promise<{ user: IUser; tokens: ITokenPair }> {
    const user = await userRepository.getByParams({ email: dto.email });
    if (!user) {
      throw new ApiError('Invalid credentials', 401);
    }
    const isPasswordCorrect = await passwordService.comparePassword(
      dto.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw new ApiError('Invalid credentials', 401);
    }

    const tokens = await tokenService.generatePair({ userId: user._id });
    await tokenRepository.create({ ...tokens, _userId: user._id });

    return { user, tokens };
  }

  public async refresh(
    payload: ITokenPayload,
    oldTokenId: string,
  ): Promise<ITokenPair> {
    const tokens = await tokenService.generatePair({
      userId: payload.userId,
    });
    await tokenRepository.create({ ...tokens, _userId: payload.userId });
    await tokenRepository.deleteById(oldTokenId);
    return tokens;
  }

  public async verify(jwtPayload: ITokenPayload): Promise<void> {
    await userRepository.updateById(jwtPayload.userId, { isVerified: true });

    await actionTokenRepository.deleteByParams({
      _userId: jwtPayload.userId,
      type: ActionTokenTypeEnum.VERIFY_EMAIL,
    });
  }

  public async changePassword(
    jwtPayload: ITokenPayload,
    dto: IChangePass,
  ): Promise<void> {
    const user = await userRepository.getById(jwtPayload.userId);
    const isPassCorrect = await passwordService.comparePassword(
      dto.oldPassword,
      user.password,
    );
    if (!isPassCorrect) {
      throw new ApiError('Invalid password', 401);
    }

    const password = await passwordService.hashPassword(dto.newPassword);
    await userRepository.updateById(jwtPayload.userId, { password });
    await tokenRepository.deleteByParams({ _userId: jwtPayload.userId });
  }

  private async isEmailExist(email: string): Promise<void> {
    const user = await userRepository.getByParams({ email });
    if (user) {
      throw new ApiError('Email already exist', 409);
    }
  }
}

export const authService = new AuthService();
