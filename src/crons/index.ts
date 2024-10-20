import { removeOldTokensCron } from './remove-old-tokens.cron';

export const jobRunner = () => {
  removeOldTokensCron.start();
};
