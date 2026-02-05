import { Controller, Get, Param } from '@nestjs/common';
import { DevtoolsService } from './devtools.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DevtoolsUserDto } from './dto/devtools.users-dto';

@Controller('devtools')
@ApiTags('devtools')
export class DevtoolsController {
  constructor(private readonly devtoolsService: DevtoolsService) {
  }

  @Get('users')
  @ApiOperation({ operationId: 'getDevUsers' })
  @ApiOkResponse({ type: DevtoolsUserDto, isArray: true })
  async getDevUsers() {
    return this.devtoolsService.getUsers();
  }

  @Get('user/:githubId/login')
  @ApiOperation({ operationId: 'getDevUserLogin' })
  @ApiOkResponse()
  async getDevUserLogin(@Param('githubId') githubId: string) {
    return this.devtoolsService.getDevUserLogin({ githubId });
  }
}
