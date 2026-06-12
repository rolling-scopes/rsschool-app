import { PersonalAccessToken } from '@entities/personalAccessToken';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalAccessTokensController } from './personal-access-tokens.controller';
import { PersonalAccessTokensService } from './personal-access-tokens.service';

@Module({
  imports: [TypeOrmModule.forFeature([PersonalAccessToken])],
  controllers: [PersonalAccessTokensController],
  providers: [PersonalAccessTokensService],
  exports: [PersonalAccessTokensService],
})
export class PersonalAccessTokensModule {}
