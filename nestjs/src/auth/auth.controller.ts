import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { addHours } from 'date-fns';
import { type Profile } from 'passport';
import { DefaultGuard, RequiredRoles, Role, RoleGuard } from '.';
import { ConfigService } from '../config';
import { AuthService, CurrentRequest } from './auth.service';
import { AuthConnectionDto } from './dto/auth-connection.dto';
import { clearAuthCookie, redirect, setAuthCookie, setDevAuthCookie } from './http.helpers';
import { GithubStrategy } from './strategies/github.strategy';

// Guard names are baked into the route decorators at module load; everything
// else derives the environment from ConfigService at request time.
const isDev = process.env.NODE_ENV !== 'production';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private githubStrategy: GithubStrategy,
    private readonly config: ConfigService,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  private get cookieDomain() {
    return this.config.isDev ? undefined : 'rs.school';
  }

  @Get('github/login')
  @ApiOperation({ operationId: 'githubLogin' })
  public async githubLogin(@Req() req: CurrentRequest, @Res() res: unknown) {
    const { httpAdapter } = this.httpAdapterHost;

    if (this.config.isDev) {
      // Local dev shortcut: mint the configured dev user's jwt right away
      // instead of doing the GitHub OAuth round trip.
      const profile = { provider: '', id: '', username: this.config.auth.dev.username } as Profile;
      req.user = await this.authService.createAuthUser(profile, this.config.auth.dev.admin);
      const token = this.authService.validateGithub(req);
      if (!token) {
        throw new Error('Invalid token');
      }
      setDevAuthCookie(httpAdapter, res, token);
      redirect(httpAdapter, res, '/');
      return;
    }

    // The OAuth authorize redirect used to be written by passport's
    // strategy.redirect straight onto the Express response, which breaks on
    // other adapters — so the url is built and sent explicitly instead.
    const url = await this.githubStrategy.getAuthorizeUrl({
      data: { redirectUrl: req.query.url as string },
      expires: addHours(new Date(), 1).toISOString(),
    });
    redirect(httpAdapter, res, url);
  }

  @Get('github/callback')
  @ApiOperation({ operationId: 'githubCallback' })
  @UseGuards(AuthGuard(isDev ? 'dev' : 'github'))
  public async githubCallback(@Req() req: CurrentRequest, @Res() res: unknown) {
    const { httpAdapter } = this.httpAdapterHost;
    try {
      const token = this.authService.validateGithub(req);

      setAuthCookie(httpAdapter, res, token ?? '', this.cookieDomain);

      const { loginState } = req;

      if (loginState?.channelId) {
        await this.authService.onConnectionComplete(loginState, req.user.id);
        redirect(httpAdapter, res, `/profile/connection-confirmed?connectionType=${loginState.channelId}`);
      } else {
        redirect(httpAdapter, res, this.authService.getRedirectUrl(loginState));
      }
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Auth error: ${error.message}`, error);
      throw err;
    }
  }

  @Get('github/logout')
  @ApiOperation({ operationId: 'githubLogout' })
  public githubLogout(@Res() res: unknown) {
    const { httpAdapter } = this.httpAdapterHost;
    clearAuthCookie(httpAdapter, res, this.cookieDomain);
    redirect(httpAdapter, res, '/login');
  }

  @Post('github/connect')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin])
  public async createConnectLinkViaGithub(@Body() dto: AuthConnectionDto) {
    const link = await this.githubStrategy.getAuthorizeUrl({
      data: dto,
      expires: addHours(new Date(), 1).toISOString(),
    });
    return {
      link,
    };
  }

  @Delete('cache/:userId')
  @ApiOperation({ operationId: 'clearAuthUserSessionCache' })
  @UseGuards(DefaultGuard)
  public async clearAuthUserSessionCache(@Param('userId', ParseIntPipe) userId: number, @Req() req: CurrentRequest) {
    if (req.user.id !== userId) throw new ForbiddenException();
    await this.authService.clearAuthUserSessionCache(userId);
  }
}
