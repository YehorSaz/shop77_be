export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
