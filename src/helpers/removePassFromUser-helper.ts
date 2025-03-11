import { Document } from 'mongoose';

import { IUser, IUserPublic } from '../interfaces';

export const removePassFromUser = (user: Document | IUser): IUserPublic => {
  const userObj = (user as Document).toObject
    ? (user as Document).toObject()
    : user;
  const { password, ...userWithoutPassword } = userObj;
  return userWithoutPassword;
};
