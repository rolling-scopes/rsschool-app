import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RequestWithUser } from './models';
import { JWT_COOKIE_NAME } from './constants';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github/login')
  @UseGuards(AuthGuard('github'))
  githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  githubCallback(@Req() req: RequestWithUser, @Res() res: Response) {
    const token = this.authService.validateGithub(req);
    res.cookie(JWT_COOKIE_NAME, token);
    res.redirect('/');
  }
}
