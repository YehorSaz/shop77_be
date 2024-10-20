import { FilterQuery } from 'mongoose';

import { IToken } from '../interfaces';
import { TokenModel } from '../models';

class TokenRepository {
  public async create(dto: IToken): Promise<IToken> {
    return await TokenModel.create(dto);
  }

  public async findByParams(params: FilterQuery<IToken>): Promise<IToken> {
    return await TokenModel.findOne(params);
  }

  public async deleteById(id: string): Promise<void> {
    await TokenModel.deleteOne({ _id: id });
  }

  public async deleteByParams(params: FilterQuery<IToken>): Promise<void> {
    await TokenModel.deleteMany(params);
  }
}

export const tokenRepository = new TokenRepository();
