/* eslint-disable @typescript-eslint/no-empty-function */
import { Body, Controller, Get, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DefaultGuard, RequiredRoles, Role, RoleGuard } from '.';
import { AuthService, CurrentRequest } from './auth.service';
import { JWT_COOKIE_NAME } from './constants';
import { AuthConnectionDto } from './dto/auth-connection.dto';
import { GithubStrategy } from './strategies/github.strategy';
import * as dayjs from 'dayjs';

const isDev = process.env.NODE_ENV !== 'production';
const COOKIE_DOMAIN = isDev ? undefined : 'rs.school';
const COOKIE_PATH = '/';
const twoDaysMs = 1000 * 60 * 60 * 24 * 2;

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private githubStrategy: GithubStrategy,
  ) {}

  @Get('github/login')
  @ApiOperation({ operationId: 'githubLogin' })
  @UseGuards(AuthGuard(isDev ? 'dev' : 'github'))
  githubLogin() {}

  @Get('github/callback')
  @ApiOperation({ operationId: 'githubCallback' })
  @UseGuards(AuthGuard(isDev ? 'dev' : 'github'))
  async githubCallback(@Req() req: CurrentRequest, @Res() res: Response) {
    try {
      const token = this.authService.validateGithub(req);

      res.cookie(JWT_COOKIE_NAME, token, {
        expires: new Date(Date.now() + twoDaysMs),
        httpOnly: true,
        secure: true,
        domain: COOKIE_DOMAIN,
        sameSite: 'none',
      });

      const { loginState } = req;

      if (loginState?.channelId) {
        await this.authService.onConnectionComplete(loginState, req.user.id);
        res.redirect(`/profile/connection-confirmed?connectionType=${loginState.channelId}`);
      } else {
        res.redirect(this.authService.getRedirectUrl(loginState));
      }
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Auth error: ${error.message}`, error);
      throw err;
    }
  }

  @Get('github/logout')
  @ApiOperation({ operationId: 'githubLogout' })
  githubLogout(@Res() res: Response) {
    res.clearCookie(JWT_COOKIE_NAME, { domain: COOKIE_DOMAIN, path: COOKIE_PATH });
    res.redirect('/login');
  }

  @Post('github/connect')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin])
  async createConnectLinkViaGithub(@Body() dto: AuthConnectionDto) {
    const link = await this.githubStrategy.getAuthorizeUrl({
      data: dto,
      expires: dayjs().add(1, 'hour').toISOString(),
    });
    return {
      link,
    };
  }
}
