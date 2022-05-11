import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  constructor(pageSize: number, current: number, total: number, totalPages: number) {
    this.pageSize = pageSize;
    this.current = current;
    this.total = total;
    this.totalPages = totalPages;
  }

  @ApiProperty()
  public pageSize: number;

  @ApiProperty()
  public current: number;

  @ApiProperty()
  public total: number;

  @ApiProperty()
  public totalPages: number;
}
