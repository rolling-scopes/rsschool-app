import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private readonly configService: ConfigService) {
    super({ passReqToCallback: true });
  }

  public validate = async (_, username: string, password: string): Promise<boolean> => {
    if (
      this.configService.get<string>('RSSHCOOL_API_ADMIN_USERNAME') === username &&
      this.configService.get<string>('RSSHCOOL_API_ADMIN_PASSWORD') === password
    ) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
