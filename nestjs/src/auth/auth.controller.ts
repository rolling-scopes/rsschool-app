/* eslint-disable @typescript-eslint/no-empty-function */
import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DefaultGuard, RequiredRoles, Role, RoleGuard } from '.';
import { AuthService, CurrentRequest } from './auth.service';
import { JWT_COOKIE_NAME } from './constants';
import { AuthConnectionDto } from './dto/AuthConnectionDto';
import { GithubStrategy } from './strategies/github.strategy';

const isDev = process.env.NODE_ENV !== 'production';
const twoDaysMs = 1000 * 60 * 60 * 24 * 2;

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private githubStrategy: GithubStrategy) {}

  @Get('github/login')
  @ApiOperation({ operationId: 'githubLogin' })
  @UseGuards(AuthGuard(isDev ? 'dev' : 'github'))
  githubLogin() {}

  @Get('github/callback')
  @ApiOperation({ operationId: 'githubCallback' })
  @UseGuards(AuthGuard(isDev ? 'dev' : 'github'))
  async githubCallback(@Req() req: CurrentRequest, @Res() res: Response) {
    const token = this.authService.validateGithub(req);
    res.cookie(JWT_COOKIE_NAME, token, {
      expires: new Date(Date.now() + twoDaysMs),
      httpOnly: true,
      secure: true,
    });

    const { loginState } = req;

    if (loginState?.channelId) {
      await this.authService.onConnectionComplete(loginState, req.user.id);
    }

    res.redirect(this.authService.getRedirectUrl(loginState));
  }

  @Get('github/logout')
  @ApiOperation({ operationId: 'githubLogout' })
  githubLogout(@Res() res: Response) {
    res.clearCookie(JWT_COOKIE_NAME);
    res.redirect('/login');
  }

  @Post('github/connect')
  @UseGuards(DefaultGuard, RoleGuard)
  @RequiredRoles([Role.Admin])
  createConnectViaGitHubLink(@Body() dto: AuthConnectionDto) {
    return this.githubStrategy.getAuthorizeUrl(dto);
  }
}
