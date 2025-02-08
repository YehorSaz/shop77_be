export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  friends?: string[];
  isVerified: boolean;
  isGoogleAuth: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SignInPayload extends Pick<IUser, 'email' | 'password'> {}
