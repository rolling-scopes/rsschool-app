/* eslint-disable @typescript-eslint/no-empty-function */
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService, CurrentRequest } from './auth.service';
import { JWT_COOKIE_NAME } from './constants';

const isDev = process.env.NODE_ENV !== 'production';
const twoDaysMs = 1000 * 60 * 60 * 24 * 2;

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github/login')
  @ApiOperation({ operationId: 'githubLogin' })
  @UseGuards(AuthGuard(isDev ? 'dev' : 'github'))
  githubLogin() {}

  @Get('github/callback')
  @ApiOperation({ operationId: 'githubCallback' })
  @UseGuards(AuthGuard(isDev ? 'dev' : 'github'))
  githubCallback(@Req() req: CurrentRequest, @Res() res: Response) {
    const token = this.authService.validateGithub(req);
    res.cookie(JWT_COOKIE_NAME, token, {
      expires: new Date(Date.now() + twoDaysMs),
      httpOnly: true,
      secure: true,
    });
    res.redirect('/');
  }

  @Get('github/logout')
  @ApiOperation({ operationId: 'githubLogout' })
  githubLogout(@Res() res: Response) {
    res.clearCookie(JWT_COOKIE_NAME);
    res.redirect('/login');
  }
}
