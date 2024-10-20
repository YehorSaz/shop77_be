import { CronJob } from 'cron';

import { configs } from '../configs/config';
import { timeHelper } from '../helpers/time-helpers';
import { tokenRepository } from '../repositories';

const handler = async () => {
  try {
    console.log('[removeOldTokensCron] is running');
    const [value, unit] = timeHelper.parseString(
      configs.JWT_REFRESH_EXPIRES_IN,
    );
    await tokenRepository.deleteByParams({
      createdAt: { $lte: timeHelper.subtractByParams(value, unit) },
    });
    console.log('[removeOldTokensCron] finished');
  } catch (error) {
    console.log('[removeOldTokensCron] is failed');
  }
};

export const removeOldTokensCron = new CronJob('* * 0 * * *', handler);
