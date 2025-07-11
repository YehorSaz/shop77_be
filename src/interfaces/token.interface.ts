import { IUser } from './user.interface';

export interface IToken {
  _id?: string;
  accessToken: string;
  refreshToken: string;
  _userId: string | IUser;
}

export interface ITokenPayload {
  userId: string;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}
