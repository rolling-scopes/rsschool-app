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
    const staging = process.env.RS_ENV === 'staging';
    const devToolsAllowed = !staging && isDev;
    console.log('Devtools allowed:', devToolsAllowed);
    return {
      module: DevtoolsModule,
      imports: [TypeOrmModule.forFeature([User]), ConfigModule],
      providers: devToolsAllowed ? [DevtoolsService] : [],
      controllers: devToolsAllowed ? [DevtoolsController] : [],
    };
  }
}
