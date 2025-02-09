import joi from 'joi';

import { regexConstant } from '../constants/regex.constants';

export class PurchaseValidator {
  private static item = joi.object({
    name: joi.string().min(1).required(),
    isCompleted: joi.boolean().default(false),
    addedBy: joi.string().optional(),
  });
  private static userId = joi.string().regex(regexConstant.MONGO_ID);

  public static createPurchaseList = joi.object({
    title: joi.string().min(1).max(50).required(),
    items: joi.array().items(this.item),
    sharedWith: joi.array().items(joi.string()),
  });

  public static updatePurchaseList = joi.object({
    title: joi.string().min(3).max(50),
    items: joi.array().items(this.item).min(1),
  });

  public static addItem = joi.object({
    item: this.item.required(),
  });

  public static updateItem = joi.object({
    name: joi.string().min(1),
    isCompleted: joi.boolean(),
  });

  public static sharedId = joi.object({
    usersId: joi.array().items(this.userId).required(),
  });

  public static unShareBody = joi.object({
    usersId: joi.array().items(this.userId),
    unShareAll: joi.boolean(),
  });
}
