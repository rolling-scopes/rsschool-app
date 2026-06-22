import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../auth';
import { UserSearchBasicDto, UserSearchDto } from './dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('users')
@UseGuards(DefaultGuard, RoleGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/search')
  @ApiOperation({ operationId: 'searchUsers' })
  @RequiredRoles([Role.Admin, CourseRole.Manager])
  @ApiOkResponse({ type: [UserSearchDto] })
  public async searchUsers(@Req() req: CurrentRequest, @Query('query') query?: string) {
    const users = await this.usersService.searchUsers(query);
    return users.map(user => new UserSearchDto(user, req.user.isAdmin || req.user.isHirer));
  }

  @Get('/search/basic')
  @ApiOperation({ operationId: 'searchUsersBasic' })
  @ApiOkResponse({ type: [UserSearchBasicDto] })
  public async searchUsersBasic(@Query('query') query?: string) {
    const users = await this.usersService.searchUsersBasic(query);
    return users.map(user => new UserSearchBasicDto(user));
  }
}
