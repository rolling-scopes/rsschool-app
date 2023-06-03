import { Module } from '@nestjs/common';
import { ConfigModule } from '../config';
import { JwtService } from './jwt/jwt.service';
@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [JwtService],
  exports: [JwtService],
})
export class CoreModule {}
