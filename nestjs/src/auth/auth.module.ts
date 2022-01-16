import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import { BasicStrategy } from './strategies/basic.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule.register({}), ConfigModule.forRoot()],
  controllers: [AuthController],
  providers: [AuthService, JwtService, GithubStrategy, JwtStrategy, BasicStrategy],
})
export class AuthModule {}
