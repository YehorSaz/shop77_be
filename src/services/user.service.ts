import { IUser } from '../interfaces';
import { userRepository } from '../repositories';

class UserService {
  public async getAll(): Promise<IUser[]> {
    return await userRepository.getAll();
  }

  public async getById(userId: string): Promise<IUser> {
    return await userRepository.getById(userId);
  }

  public async updateById(userId: string, dto: IUser) {
    return await userRepository.updateById(userId, dto);
  }

  public async deleteById(userId: string): Promise<void> {
    await userRepository.deleteById(userId);
  }

  public async addFriend(userId: string, friendId: string): Promise<IUser> {
    return await userRepository.addFriend(userId, friendId);
  }

  public async delFromFriends(
    userId: string,
    friendId: string,
  ): Promise<IUser> {
    return await userRepository.delFromFriends(userId, friendId);
  }
}

export const userService = new UserService();
