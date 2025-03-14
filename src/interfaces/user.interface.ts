import { IPurchaseList } from './purchase-list.interface';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  friends?: string[];
  purchaseLists?: {
    myLists?: IPurchaseList[];
    sharedLists?: IPurchaseList[];
  };
  isVerified: boolean;
  isGoogleAuth: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SignInPayload extends Pick<IUser, 'email' | 'password'> {}
export interface SignUpPayload
  extends Pick<
    IUser,
    'name' | 'email' | 'password' | 'phone' | 'isVerified' | 'isGoogleAuth'
  > {}
export interface IUserPublic extends Omit<IUser, 'password'> {}
