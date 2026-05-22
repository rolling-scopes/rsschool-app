import { PersonalAccessToken } from '@entities/personalAccessToken';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalAccessTokensService } from './personal-access-tokens.service';

@Module({
  imports: [TypeOrmModule.forFeature([PersonalAccessToken])],
  providers: [PersonalAccessTokensService],
  exports: [PersonalAccessTokensService],
})
export class PersonalAccessTokensModule {}
