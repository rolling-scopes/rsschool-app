import { Controller, ForbiddenException, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../auth';
import { UserSearchDto } from './dto';
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
  @ApiQuery({ name: 'includeSystem', required: false, type: Boolean })
  public async searchUsers(
    @Req() req: CurrentRequest,
    @Query('query') query?: string,
    @Query('includeSystem') includeSystem?: string,
  ) {
    const wantsSystem = includeSystem === 'true';
    if (wantsSystem && !req.user.isAdmin) {
      throw new ForbiddenException('Only admins can search system users');
    }
    const users = await this.usersService.searchUsers(query, { includeSystem: wantsSystem });
    return users.map(user => new UserSearchDto(user, req.user.isAdmin || req.user.isHirer));
  }
}
