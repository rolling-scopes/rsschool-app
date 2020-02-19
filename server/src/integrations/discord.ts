import axios from 'axios';
import { ILogger } from '../logger';
import { config } from '../config';

interface BadgeParams {
  fromGithubId: string;
  toGithubId: string;
  comment: string;
}

interface DiscordMessage {
  avatar_url: string;
  content: string;
  username: string;
}

(process.env as any).NODE_TLS_REJECT_UNAUTHORIZED = 0;

export class DiscordService {
  logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger.child({ module: 'discordapp.com' });
  }

  public async pushGratitude(params: BadgeParams) {
    if (this.isDisabled()) {
      this.logger.info('pushGratitude is disabled');
      return null;
    }
    const { gratitudeUrl } = config.integrations.discord;
    const message: DiscordMessage = {
      avatar_url: `https://github.com/${params.fromGithubId}.png`,
      username: params.fromGithubId,
      content: `@${params.toGithubId}\n${params.comment}`,
    };
    const result = await axios.post(gratitudeUrl!, message);
    this.logger.info(result.status.toString());
  }

  private isDisabled() {
    return !config.integrations.discord.gratitudeUrl;
  }
}
