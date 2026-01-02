import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from 'src/core/dto/pagination.dto';
import { TopMentorDto } from './top-mentor.dto';

export class PaginatedTopMentorsDto {
  constructor(items: TopMentorDto[], pagination: PaginationDto) {
    this.items = items;
    this.pagination = pagination;
  }

  @ApiProperty({ type: [TopMentorDto], description: 'List of top mentors' })
  public items: TopMentorDto[];

  @ApiProperty({ type: PaginationDto, description: 'Pagination metadata' })
  public pagination: PaginationDto;
}
