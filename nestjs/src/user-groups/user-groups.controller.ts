import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DefaultGuard, RequiredRoles, Role, RoleGuard } from 'src/auth';
import { CreateUserGroupDto, UpdateUserGroupDto } from './dto';
import { UserGroupDto } from './dto/user-group.dto';
import { UserGroupsService } from './user-groups.service';

@Controller('user-group')
@ApiTags('user-group')
@RequiredRoles([Role.Admin])
@UseGuards(DefaultGuard, RoleGuard)
export class UserGroupsController {
  constructor(private readonly service: UserGroupsService) {}

  @Post()
  @ApiOperation({ operationId: 'createUserGroup' })
  @ApiOkResponse({ type: UserGroupDto })
  public async create(@Body() dto: CreateUserGroupDto) {
    const data = await this.service.create(dto);
    return new UserGroupDto(data);
  }

  @Get()
  @ApiOperation({ operationId: 'getUserGroups' })
  @ApiOkResponse({ type: [UserGroupDto] })
  public async getAll() {
    const items = await this.service.getAll();
    return items.map(item => new UserGroupDto(item));
  }

  @Put(':id')
  @ApiOperation({ operationId: 'updateUserGroup' })
  @ApiOkResponse({ type: UserGroupDto })
  public async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserGroupDto) {
    const data = await this.service.update(id, dto);
    return new UserGroupDto(data);
  }

  @Delete(':id')
  @ApiOperation({ operationId: 'deleteUserGroup' })
  @ApiOkResponse({ type: UserGroupDto })
  public async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
