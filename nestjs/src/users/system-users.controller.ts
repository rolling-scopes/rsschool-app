import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTokenDenyGuard, DefaultGuard, DenyApiToken, RequiredRoles, Role, RoleGuard } from '../auth';
import { CreateSystemUserDto, SystemUserDto, UpdateSystemUserDto } from './dto';
import { UsersService } from './users.service';

@Controller('users/system')
@ApiTags('system-users')
@UseGuards(DefaultGuard, RoleGuard, ApiTokenDenyGuard)
@RequiredRoles([Role.Admin])
@DenyApiToken()
export class SystemUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/')
  @ApiOperation({ operationId: 'getSystemUsers' })
  @ApiOkResponse({ type: [SystemUserDto] })
  public async list(): Promise<SystemUserDto[]> {
    const users = await this.usersService.listSystemUsers();
    return users.map(u => new SystemUserDto(u));
  }

  @Post('/')
  @ApiOperation({ operationId: 'createSystemUser' })
  @ApiOkResponse({ type: SystemUserDto })
  public async create(@Body() dto: CreateSystemUserDto): Promise<SystemUserDto> {
    try {
      const user = await this.usersService.createSystemUser({ name: dto.name, githubId: dto.githubId });
      return new SystemUserDto(user);
    } catch (err) {
      if (err instanceof Error && err.message.includes('already exists')) {
        throw new ConflictException(err.message);
      }
      throw new BadRequestException((err as Error).message);
    }
  }

  @Patch('/:id')
  @ApiOperation({ operationId: 'updateSystemUser' })
  @ApiOkResponse({ type: SystemUserDto })
  public async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSystemUserDto): Promise<SystemUserDto> {
    const user = await this.usersService.updateSystemUser(id, { name: dto.name });
    if (!user) throw new NotFoundException();
    return new SystemUserDto(user);
  }
}
