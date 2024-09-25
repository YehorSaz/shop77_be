import { ApiError } from '../errors/api-error';
import { ITokenPair, ITokenPayload, IUser, SignInPayload } from '../interfaces';
import { tokenRepository, userRepository } from '../repositories';
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
    await tokenRepository.create({ ...tokens, _userId: user._id });

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

  private async isEmailExist(email: string): Promise<void> {
    const user = await userRepository.getByParams({ email });
    if (user) {
      throw new ApiError('Email already exist', 409);
    }
  }
}

export const authService = new AuthService();
