import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiTokenDenyGuard, CurrentRequest, DefaultGuard, DenyApiToken, RequiredRoles, Role, RoleGuard } from '../auth';
import { CreatePersonalAccessTokenDto } from './dto/create-personal-access-token.dto';
import { CreatedPersonalAccessTokenDto } from './dto/created-personal-access-token.dto';
import { PersonalAccessTokenListDto } from './dto/personal-access-token-list.dto';
import { PersonalAccessTokenDto } from './dto/personal-access-token.dto';
import {
  PAT_SORTABLE_FIELDS,
  PersonalAccessTokensService,
  type PatSortField,
  type PatStatus,
} from './personal-access-tokens.service';

function isPatStatus(value: string | undefined): value is PatStatus {
  return value === 'active' || value === 'revoked' || value === 'expired';
}

function isPatSortField(value: string | undefined): value is PatSortField {
  return value !== undefined && Object.hasOwn(PAT_SORTABLE_FIELDS, value);
}

@Controller('personal-access-tokens')
@ApiTags('personal-access-tokens')
@UseGuards(DefaultGuard, RoleGuard, ApiTokenDenyGuard)
@DenyApiToken()
export class PersonalAccessTokensController {
  constructor(private readonly service: PersonalAccessTokensService) {}

  @Get('/')
  @ApiOperation({ operationId: 'getMyPersonalAccessTokens' })
  @ApiOkResponse({ type: [PersonalAccessTokenDto] })
  public async listMine(@Req() req: CurrentRequest): Promise<PersonalAccessTokenDto[]> {
    const records = await this.service.listByUser(req.user.id);
    return records.map(r => new PersonalAccessTokenDto(r));
  }

  @Post('/')
  @ApiOperation({ operationId: 'createMyPersonalAccessToken' })
  @ApiOkResponse({ type: CreatedPersonalAccessTokenDto })
  public async createMine(
    @Body() dto: CreatePersonalAccessTokenDto,
    @Req() req: CurrentRequest,
  ): Promise<CreatedPersonalAccessTokenDto> {
    const { record, token } = await this.service.create({
      userId: req.user.id,
      name: dto.name,
      expiresInDays: dto.expiresInDays,
      createdById: req.user.id,
    });
    return new CreatedPersonalAccessTokenDto(record, token);
  }

  @Delete('/:id')
  @ApiOperation({ operationId: 'revokeMyPersonalAccessToken' })
  public async revokeMine(@Param('id') id: string, @Req() req: CurrentRequest): Promise<void> {
    const revoked = await this.service.revoke({
      tokenId: id,
      ownerId: req.user.id,
      revokedById: req.user.id,
    });
    if (!revoked) {
      throw new NotFoundException();
    }
  }

  @Get('/admin')
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'getAllPersonalAccessTokens' })
  @ApiOkResponse({ type: PersonalAccessTokenListDto })
  @ApiQuery({ name: 'githubId', required: false, type: String, description: 'Owner GitHub login, partial match' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Token name, partial match' })
  @ApiQuery({ name: 'issuedBy', required: false, type: String, description: 'Issuer GitHub login, partial match' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'revoked', 'expired'] })
  @ApiQuery({ name: 'orderBy', required: false, enum: Object.keys(PAT_SORTABLE_FIELDS) })
  @ApiQuery({ name: 'orderDirection', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  public async listAll(
    @Query('githubId') githubId?: string,
    @Query('name') name?: string,
    @Query('issuedBy') issuedBy?: string,
    @Query('status') status?: string,
    @Query('orderBy') orderBy?: string,
    @Query('orderDirection') orderDirection?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<PersonalAccessTokenListDto> {
    const { items, meta } = await this.service.listAll({
      githubId: githubId || undefined,
      name: name || undefined,
      issuedBy: issuedBy || undefined,
      status: isPatStatus(status) ? status : undefined,
      orderBy: isPatSortField(orderBy) ? orderBy : undefined,
      orderDirection: orderDirection === 'asc' ? 'asc' : 'desc',
      page: page ? Math.max(Number(page), 1) : 1,
      pageSize: pageSize ? Math.min(Math.max(Number(pageSize), 1), 200) : 50,
    });
    return new PersonalAccessTokenListDto(
      items.map(r => new PersonalAccessTokenDto(r)),
      meta,
    );
  }

  @Get('/admin/users/:userId')
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'getPersonalAccessTokensForUser' })
  @ApiOkResponse({ type: [PersonalAccessTokenDto] })
  public async listForUser(@Param('userId', ParseIntPipe) userId: number): Promise<PersonalAccessTokenDto[]> {
    const records = await this.service.listByUser(userId);
    return records.map(r => new PersonalAccessTokenDto(r));
  }

  @Post('/admin/users/:userId')
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'createPersonalAccessTokenForUser' })
  @ApiOkResponse({ type: CreatedPersonalAccessTokenDto })
  public async createForUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreatePersonalAccessTokenDto,
    @Req() req: CurrentRequest,
  ): Promise<CreatedPersonalAccessTokenDto> {
    const { record, token } = await this.service.create({
      userId,
      name: dto.name,
      expiresInDays: dto.expiresInDays,
      // Record the issuing admin: without it a token handed to another user is
      // indistinguishable from one they created themselves.
      createdById: req.user.id,
    });
    return new CreatedPersonalAccessTokenDto(record, token);
  }

  @Delete('/admin/:id')
  @RequiredRoles([Role.Admin])
  @ApiOperation({ operationId: 'revokePersonalAccessTokenAsAdmin' })
  public async revokeAsAdmin(@Param('id') id: string, @Req() req: CurrentRequest): Promise<void> {
    if (!req.user.isAdmin) {
      throw new ForbiddenException();
    }
    const revoked = await this.service.revokeByAdmin({ tokenId: id, revokedById: req.user.id });
    if (!revoked) {
      throw new NotFoundException();
    }
  }
}
