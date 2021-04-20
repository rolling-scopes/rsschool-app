import { scheduleJob } from 'node-schedule';
import { ILogger } from './logger';
import { ScoreService } from './services/score.service';

export function startBackgroundJobs(logger: ILogger) {
  scheduleJob('0 1 * * *', async () => {
    logger.info('Starting score update job');
    await ScoreService.recalculateTotalScore(logger);
  });
}
