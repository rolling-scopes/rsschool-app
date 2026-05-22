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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiTokenDenyGuard, CurrentRequest, DefaultGuard, DenyApiToken, RequiredRoles, Role, RoleGuard } from '../auth';
import { CreatePersonalAccessTokenDto } from './dto/create-personal-access-token.dto';
import { CreatedPersonalAccessTokenDto } from './dto/created-personal-access-token.dto';
import { PersonalAccessTokenDto } from './dto/personal-access-token.dto';
import { PersonalAccessTokensService } from './personal-access-tokens.service';

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
  ): Promise<CreatedPersonalAccessTokenDto> {
    const { record, token } = await this.service.create({
      userId,
      name: dto.name,
      expiresInDays: dto.expiresInDays,
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
