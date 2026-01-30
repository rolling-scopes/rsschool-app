import { Controller, Get, Param } from '@nestjs/common';
import { DevtoolsService } from './devtools.service';

@Controller('devtools')
export class DevtoolsController {
  constructor(private readonly devtoolsService: DevtoolsService) {}

  @Get('user')
  async getTestUsers() {
    return this.devtoolsService.getUsers();
  }

  @Get('user/:id')
  async getTestUserById(@Param('id') id: number) {
    return this.devtoolsService.getUserById({ id });
  }
}
