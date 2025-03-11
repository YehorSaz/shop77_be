import { removePassFromUser } from '../helpers/removePassFromUser-helper';
import { IUserPublic } from '../interfaces';
import { userRepository } from '../repositories';

class UserService {
  public async getAll(): Promise<IUserPublic[]> {
    const users = await userRepository.getAll();
    return users.map((user) => removePassFromUser(user));
  }

  public async getById(userId: string): Promise<IUserPublic> {
    const user = await userRepository.getById(userId);
    return removePassFromUser(user);
  }

  public async getMe(userId: string): Promise<IUserPublic> {
    const me = await userRepository.getMe(userId);
    return removePassFromUser(me);
  }

  public async updateById(
    userId: string,
    dto: IUserPublic,
  ): Promise<IUserPublic> {
    const updatedUser = await userRepository.updateById(userId, dto);
    return removePassFromUser(updatedUser);
  }

  public async deleteById(userId: string): Promise<void> {
    await userRepository.deleteById(userId);
  }

  public async addFriend(
    userId: string,
    friendId: string,
  ): Promise<IUserPublic> {
    const result = await userRepository.addFriend(userId, friendId);
    return removePassFromUser(result);
  }

  public async delFromFriends(
    userId: string,
    friendId: string,
  ): Promise<IUserPublic> {
    const result = await userRepository.delFromFriends(userId, friendId);
    return removePassFromUser(result);
  }
}

export const userService = new UserService();
