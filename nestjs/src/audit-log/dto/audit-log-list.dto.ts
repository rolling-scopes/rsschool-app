import { ApiProperty } from '@nestjs/swagger';
import type { PaginationMeta } from '../../core/paginate';
import { AuditLogEntryDto } from './audit-log-entry.dto';

export class AuditLogPaginationMetaDto implements PaginationMeta {
  @ApiProperty() itemCount: number;
  @ApiProperty() total: number;
  @ApiProperty() pageSize: number;
  @ApiProperty() totalPages: number;
  @ApiProperty() current: number;
}

export class AuditLogListDto {
  @ApiProperty({ type: [AuditLogEntryDto] })
  public items: AuditLogEntryDto[];

  @ApiProperty({ type: AuditLogPaginationMetaDto })
  public meta: AuditLogPaginationMetaDto;

  constructor(items: AuditLogEntryDto[], meta: PaginationMeta) {
    this.items = items;
    this.meta = meta;
  }
}
