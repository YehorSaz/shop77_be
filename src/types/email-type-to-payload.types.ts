import { EmailTypeEnum } from '../enums/email-type.enum';
import { EmailPayloadCombinedType } from './email-payload-combined.types';
import { PickRequired } from './pick-required.types';

export type EmailTypeToPayloadType = {
  [EmailTypeEnum.WELCOME]: PickRequired<
    EmailPayloadCombinedType,
    'name' | 'actionToken'
  >;

  [EmailTypeEnum.FORGOT_PASSWORD]: PickRequired<
    EmailPayloadCombinedType,
    'name' | 'actionToken'
  >;
};
