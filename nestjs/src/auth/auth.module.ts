import { LoginState } from '@entities/loginState';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { CoursesModule } from '../courses/courses.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import { BasicStrategy } from './strategies/basic.strategy';
import { DevStrategy } from './strategies/dev.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({}),
    UsersModule,
    CoursesModule,
    ConfigModule,
    TypeOrmModule.forFeature([LoginState]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, GithubStrategy, JwtStrategy, BasicStrategy, DevStrategy],
})
export class AuthModule {}
