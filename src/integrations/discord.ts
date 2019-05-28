import fetch from 'node-fetch';
import { ILogger } from '../logger';
import { config } from '../config';

interface BadgeParams {
  fromGithubId: string;
  toGithubId: string;
  comment: string;
}

interface DiscordMessage {
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
      return null;
    }
    const { gratitudeUrl } = config.integrations.discord;
    const message: DiscordMessage = {
      username: params.fromGithubId,
      content: `${params.toGithubId}: ${params.comment}`,
    };
    const result = await fetch(gratitudeUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    const response = await result.json();
    this.logger.info(response);
  }

  private isDisabled() {
    return !config.integrations.discord.gratitudeUrl;
  }
}
