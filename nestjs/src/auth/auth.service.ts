import { Injectable } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { RequestWithUser } from './request-with-user';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  public validateGithub(req: RequestWithUser) {
    if (!req.user) {
      return null;
    }

    return this.jwtService.createToken(req.user);
  }
}
