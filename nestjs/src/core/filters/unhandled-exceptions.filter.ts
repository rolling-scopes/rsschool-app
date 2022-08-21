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
    const normalizedException = exception instanceof HttpException ? exception : new InternalServerErrorException();
    const status = normalizedException.getStatus();

    if (status === HttpStatus.INTERNAL_SERVER_ERROR || status === HttpStatus.BAD_REQUEST) {
      this.sendError({ message: (exception as any)?.message, course: exception });
    }

    httpAdapter.reply(ctx.getResponse(), normalizedException.getResponse(), normalizedException.getStatus());
  }

  /**
   * Sends errors to a remote queue for futher analysis
   * @param data error
   */
  private async sendError(data: any) {
    if (this.configService.isDev) {
      return;
    }
    await this.cloudApiService.logErrors([data]);
  }
}
