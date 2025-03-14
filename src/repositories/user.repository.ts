import { ApiError } from '../errors/api-error';
import { IUser } from '../interfaces';
import { UserModel } from '../models';
import { purchaseListRepository } from './purchase-list.repository';

class UserRepository {
  public async getByParams(
    params: Partial<IUser>,
    select?: string,
  ): Promise<IUser | null> {
    const query = UserModel.findOne(params);
    if (select) {
      query.select(select);
    }
    return await query.exec();
  }

  public async getAll(): Promise<IUser[]> {
    return await UserModel.find();
  }

  public async create(dto: IUser): Promise<IUser> {
    return await UserModel.create(dto);
  }

  public async getById(userId: string): Promise<IUser> {
    const user = await UserModel.findById(userId);
    return user;
  }

  public async getMe(userId: string): Promise<IUser> {
    const user = await UserModel.findById(userId);
    return user;
  }

  public async updateById(userId: string, dto: Partial<IUser>): Promise<IUser> {
    return await UserModel.findByIdAndUpdate(userId, dto, {
      returnDocument: 'after',
    });
  }

  public async deleteById(userId: string): Promise<void> {
    await purchaseListRepository.deleteAllPurchaseListsByUserId(userId);
    await UserModel.deleteOne({ _id: userId });
  }

  public async addFriend(userId: string, friendId: string): Promise<IUser> {
    try {
      await UserModel.findByIdAndUpdate(
        friendId,
        { $addToSet: { friends: userId } },
        { new: true },
      );
    } catch (e) {
      throw new ApiError('User not found', 404);
    }

    return await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { friends: friendId } },
      { new: true },
    );
  }

  public async delFromFriends(
    userId: string,
    friendId: string,
  ): Promise<IUser> {
    try {
      await UserModel.findByIdAndUpdate(
        friendId,
        { $pull: { friends: userId } },
        { new: true },
      );
    } catch (e) {
      throw new ApiError('User not found', 404);
    }

    return await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { friends: friendId } },
      { new: true },
    );
  }
}

export const userRepository = new UserRepository();
