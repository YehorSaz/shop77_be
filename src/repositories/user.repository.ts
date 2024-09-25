import { IUser } from '../interfaces';
import { UserModel } from '../models';

class UserRepository {
  public async getByParams(params: Partial<IUser>): Promise<IUser> {
    return await UserModel.findOne(params);
  }

  public async getAll(): Promise<IUser[]> {
    return await UserModel.find();
  }

  public async create(dto: IUser): Promise<IUser> {
    return await UserModel.create(dto);
  }

  public async getById(userId: string): Promise<IUser> {
    return await UserModel.findById(userId);
  }

  public async updateById(userId: string, dto: IUser): Promise<IUser> {
    return await UserModel.findByIdAndUpdate(userId, dto, {
      returnDocument: 'after',
    });
  }

  public async deleteById(userId: string): Promise<void> {
    await UserModel.deleteOne({ _id: userId });
  }
}

export const userRepository = new UserRepository();
