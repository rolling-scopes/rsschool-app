/* eslint-disable @typescript-eslint/no-empty-function */
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService, CurrentRequest } from './auth.service';
import { JWT_COOKIE_NAME } from './constants';

const isDev = process.env.NODE_ENV !== 'production';

@Controller('auth')
@ApiTags('auth')
@UseGuards(AuthGuard(isDev ? 'dev' : 'github'))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github/login')
  @ApiOperation({ operationId: 'githubLogin' })
  githubLogin() {}

  @Get('github/callback')
  @ApiOperation({ operationId: 'githubCallback' })
  githubCallback(@Req() req: CurrentRequest, @Res() res: Response) {
    const token = this.authService.validateGithub(req);
    res.cookie(JWT_COOKIE_NAME, token);
    res.redirect('/');
  }
}
