import { removeOldTokensCron } from './remove-old-tokens.cron';

export const jobRunner = () => {
  if (removeOldTokensCron.running) {
    removeOldTokensCron.stop();
  }
  removeOldTokensCron.start();
};
