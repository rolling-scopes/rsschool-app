import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const isProd = process.env.NODE_ENV === 'production';

type GratitudeData = {
  fromGithubId: string;
  toDiscordId: number | null;
  toGithubId: string;
  comment: string;
  gratitudeUrl: string;
};

type DiscordMessage = {
  avatar_url: string;
  content: string;
  username: string;
};

@Injectable()
export class DiscordService {
  private logger = new Logger(DiscordService.name);

  constructor(private httpService: HttpService) {}

  public async sendGratitudeMessage(params: GratitudeData) {
    const mention = params.toDiscordId ? `<@${params.toDiscordId}>` : `**@${params.toGithubId}**`;

    const message: DiscordMessage = {
      avatar_url: `https://github.com/${params.fromGithubId}.png`,
      username: params.fromGithubId,
      content: `${mention}\n${params.comment}`,
    };
    if (!isProd) {
      this.logger.log(`Skip sending discord message in develoment: ${JSON.stringify(message)}`);
      return;
    }
    await lastValueFrom(this.httpService.post(params.gratitudeUrl, message));
  }
}
