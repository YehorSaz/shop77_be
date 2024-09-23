import joi from 'joi';

import { regexConstant } from '../constants/regex.constants';

export class UserValidator {
  private static name = joi.string().min(3).trim();
  private static email = joi.string().regex(regexConstant.EMAIL).trim();
  private static password = joi.string().regex(regexConstant.PASSWORD).trim();
  private static phone = joi.string().regex(regexConstant.PHONE).trim();

  public static createUser = joi.object({
    name: UserValidator.name.required(),
    email: UserValidator.email.required(),
    password: UserValidator.password.required(),
    phone: UserValidator.phone.optional(),
  });
  public static updateUser = joi.object({
    name: UserValidator.name,
    email: UserValidator.email,
    password: UserValidator.password,
    phone: UserValidator.phone,
  });
}
