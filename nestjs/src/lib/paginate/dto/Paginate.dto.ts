import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from '../index';

export class PaginationMetaDto implements PaginationMeta {
  constructor(paginationMeta: PaginationMeta) {
    this.itemCount = paginationMeta.itemCount;
    this.total = paginationMeta.total;
    this.current = paginationMeta.current;
    this.pageSize = paginationMeta.pageSize;
    this.totalPages = paginationMeta.totalPages;
  }

  @ApiProperty({ type: Number })
  itemCount: number;

  @ApiProperty({ type: Number })
  total: number;

  @ApiProperty({ type: Number })
  current: number;

  @ApiProperty({ type: Number })
  pageSize: number;

  @ApiProperty({ type: Number })
  totalPages: number;
}
