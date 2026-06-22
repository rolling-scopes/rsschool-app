import { Module } from '@nestjs/common';
import { CloudApiModule } from '../cloud-api/cloud-api.module';
import { FilesController } from './files.controller';

@Module({
  imports: [CloudApiModule],
  controllers: [FilesController],
})
export class FilesModule {}
