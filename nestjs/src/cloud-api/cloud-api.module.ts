import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '../config';
import { CloudApiService } from './cloud-api.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [],
  providers: [CloudApiService],
  exports: [CloudApiService],
})
export class CloudApiModule {}
