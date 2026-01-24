import { Controller, Get } from '@nestjs/common';
import { DevtoolsService } from './devtools.service';

@Controller('devtools')
export class DevtoolsController {
  constructor(private readonly devtoolsService: DevtoolsService) {}
  @Get()
  async getDevtoolsInfo() {
    return this.devtoolsService.getTestUsers();
  }
}
