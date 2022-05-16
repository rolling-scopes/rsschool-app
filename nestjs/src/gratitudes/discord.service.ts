import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { map, retry } from 'rxjs';

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

    this.httpService
      .post(params.gratitudeUrl, message)
      .pipe(
        map(response => response.data),
        retry({
          count: 5,
          delay: 1000,
        }),
      )
      .subscribe({
        next: () =>
          this.logger.log({
            msg: 'Sending gratitude',
            mention: params.toDiscordId || params.toGithubId,
          }),
        error: e =>
          this.logger.error({
            msg: 'Error sending gratitude',
            mention: params.toDiscordId || params.toGithubId,
            error: e.toString(),
          }),
        complete: () =>
          this.logger.log({
            msg: 'Gratitude sent successfully',
            mention: params.toDiscordId || params.toGithubId,
          }),
      });
  }
}
