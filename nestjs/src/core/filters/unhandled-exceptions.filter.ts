import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  InternalServerErrorException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from 'src/config';
import { CloudApiService } from 'src/cloud-api/cloud-api.service';

@Catch()
export class UnhandledExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly cloudApiService: CloudApiService,
    private readonly configService: ConfigService,
  ) {}

  public catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const normalizedException =
      exception instanceof HttpException ? exception : new InternalServerErrorException((exception as Error)?.message);
    const status = normalizedException.getStatus();

    if (status === HttpStatus.INTERNAL_SERVER_ERROR || status === HttpStatus.BAD_REQUEST) {
      this.sendError({ message: (exception as any)?.message, cause: exception });
    }

    httpAdapter.reply(ctx.getResponse(), normalizedException.getResponse(), normalizedException.getStatus());
  }

  /**
   * Sends errors to a remote queue for futher analysis
   * @param data error
   */
  private async sendError(data: { message: string; cause: unknown }) {
    if (this.configService.isDev || messagesToIgnore.includes(data.message)) {
      return;
    }
    const stack = (data.cause as Error)?.stack ?? '';
    await this.cloudApiService.logErrors([{ ...data, stack }]);
  }
}

const messagesToIgnore = ['Failed to obtain access token', 'Failed to fetch user emails'];
