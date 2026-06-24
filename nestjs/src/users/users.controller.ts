import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CourseRole, CurrentRequest, DefaultGuard, RequiredRoles, Role, RoleGuard } from '../auth';
import { OperationResultDto, UpdateActivistDto, UpsertUserDto, UserSearchBasicDto, UserSearchDto } from './dto';
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

  @Post('/')
  @ApiOperation({ operationId: 'createUsers' })
  @RequiredRoles([Role.Admin])
  @ApiBody({ type: [UpsertUserDto] })
  @ApiOkResponse({ type: [OperationResultDto] })
  public async createUsers(
    @Body(new ParseArrayPipe({ items: UpsertUserDto })) inputData: UpsertUserDto[],
  ): Promise<OperationResultDto[]> {
    return this.usersService.upsertUsers(inputData);
  }

  @Post('/:userId/activist')
  @ApiOperation({ operationId: 'updateUserActivist' })
  @RequiredRoles([Role.Admin])
  @ApiBody({ type: UpdateActivistDto })
  @ApiOkResponse()
  public async updateUserActivist(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: UpdateActivistDto,
  ): Promise<void> {
    const updated = await this.usersService.setActivist(userId, body.activist);
    if (!updated) {
      throw new BadRequestException('no user');
    }
  }
}
