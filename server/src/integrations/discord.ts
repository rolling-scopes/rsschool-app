import axios from 'axios';
import { ILogger } from '../logger';

interface BadgeParams {
  fromGithubId: string;
  toDiscordId: number | null;
  toGithubId: string;
  comment: string;
  gratitudeUrl: string;
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
    const mention = params.toDiscordId ? `<@${params.toDiscordId}>` : `**@${params.toGithubId}**`;

    const message: DiscordMessage = {
      avatar_url: `https://github.com/${params.fromGithubId}.png`,
      username: params.fromGithubId,
      content: `${mention}\n${params.comment}`,
    };
    const result = await axios.post<any>(params.gratitudeUrl, message);
    this.logger.info(result.status.toString());
  }
}
