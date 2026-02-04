import { Controller, Get, Param } from '@nestjs/common';
import { DevtoolsService } from './devtools.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DevtoolsUserDto } from './dto/devtools.users-dto';

@Controller('devtools')
export class DevtoolsController {
  constructor(private readonly devtoolsService: DevtoolsService) {}

  @Get('user')
  @ApiOperation({ operationId: 'getDevUsers' })
  @ApiOkResponse({ type: DevtoolsUserDto, isArray: true })
  async getDevUsers() {
    return this.devtoolsService.getUsers();
  }

  @Get('user/:id')
  @ApiOperation({ operationId: 'getDevUserById' })
  @ApiOkResponse({ type: DevtoolsUserDto })
  async getDevUserById(@Param('id') id: number) {
    return this.devtoolsService.getUserById({ id });
  }

  @Get('user/:id/login')
  @ApiOperation({ operationId: 'getDevUserLogin' })
  @ApiOkResponse()
  async getDevUserLogin(@Param('id') id: number) {
    console.log('LOGIN WITH GITHUB', id);
    return null;
  }
}
