import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DevtoolsService } from './devtools.service';
import { CreateTestUserDto } from './dto/create-testUser.dto';
import { UpdateTestUserDto } from './dto/update-testUser.dto';

@Controller('devtools')
export class DevtoolsController {
  constructor(private readonly devtoolsService: DevtoolsService) {}

  @Get('test-users')
  async getTestUsers() {
    return this.devtoolsService.getTestUsers();
  }

  @Get('test-user/:id')
  async getTestUserById(@Param('id') id: string) {
    return this.devtoolsService.getTestUserById({ id });
  }

  @Post('test-user')
  async createTestUser(@Body() dto: CreateTestUserDto) {
    return this.devtoolsService.createTestUser({ dto });
  }

  @Patch('test-user/:id')
  async updateTestUserById(@Param('id') id: string, @Body() dto: UpdateTestUserDto) {
    return this.devtoolsService.updateTestUserById({ dto, id });
  }

  @Delete('test-user/:id')
  async deleteTestUserById(@Param('id') id: string) {
    return this.devtoolsService.deleteTestUserById({ id });
  }
}
