import joi from 'joi';

import { regexConstant } from '../constants/regex.constants';

export class UserValidator {
  private static name = joi.string().min(3).trim();
  private static email = joi.string().regex(regexConstant.EMAIL).trim();
  private static password = joi.string().regex(regexConstant.PASSWORD).trim();
  private static phone = joi.string().regex(regexConstant.PHONE).trim();
  private static mongoId = joi.string().regex(regexConstant.MONGO_ID);

  public static createUser = joi.object({
    name: this.name.required(),
    email: this.email.required(),
    password: this.password.required(),
    phone: this.phone.optional(),
  });

  public static updateUser = joi.object({
    name: this.name,
    email: this.email,
    password: this.password,
    phone: this.phone,
  });

  public static login = joi.object({
    email: this.email.required(),
    password: this.password.required(),
  });

  public static setPassword = joi.object({
    password: this.password.required(),
  });

  public static changePassword = joi.object({
    oldPassword: this.password.required(),
    newPassword: this.password.required(),
  });

  public static forgotPassword = joi.object({
    email: this.email.required(),
  });

  public static forgotPasswordSet = joi.object({
    password: this.password.required(),
  });

  public static addFriend = joi.object({
    friendId: this.mongoId.required(),
  });
}
