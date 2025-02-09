import { IPurchaseList } from './purchase-list.interface';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
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
