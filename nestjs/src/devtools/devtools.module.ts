import { DynamicModule, Module } from '@nestjs/common';
import { DevtoolsController } from './devtools.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevtoolsService } from './devtools.service';
import { User } from '@entities/user';
import { ConfigModule } from '../config';

@Module({})
export class DevtoolsModule {
  static forRoot(): DynamicModule {
    const isDev = process.env.NODE_ENV !== 'production';
    return {
      module: DevtoolsModule,
      imports: [TypeOrmModule.forFeature([User]), ConfigModule],
      providers: isDev ? [DevtoolsService] : [],
      controllers: isDev ? [DevtoolsController] : [],
    };
  }
}
