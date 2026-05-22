import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiTokenDenyGuard, DefaultGuard, DenyApiToken, RequiredRoles, Role, RoleGuard } from '../auth';
import { AuditLogService } from './audit-log.service';
import { AuditLogEntryDto } from './dto/audit-log-entry.dto';
import { AuditLogListDto } from './dto/audit-log-list.dto';

@Controller('audit-log')
@ApiTags('audit-log')
@UseGuards(DefaultGuard, RoleGuard, ApiTokenDenyGuard)
@RequiredRoles([Role.Admin])
@DenyApiToken()
export class AuditLogController {
  constructor(private readonly service: AuditLogService) {}

  @Get('/')
  @ApiOperation({ operationId: 'getAuditLog' })
  @ApiOkResponse({ type: AuditLogListDto })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'tokenId', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'ISO date' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'ISO date' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  public async list(
    @Query('userId') userId?: string,
    @Query('tokenId') tokenId?: string,
    @Query('action') action?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<AuditLogListDto> {
    const { items, meta } = await this.service.list({
      userId: userId ? Number(userId) : undefined,
      tokenId: tokenId || undefined,
      action: action || undefined,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      page: page ? Math.max(Number(page), 1) : 1,
      pageSize: pageSize ? Math.min(Math.max(Number(pageSize), 1), 200) : 50,
    });
    return new AuditLogListDto(
      items.map(e => new AuditLogEntryDto(e)),
      meta,
    );
  }
}
