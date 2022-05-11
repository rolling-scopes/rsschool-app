import { ApiProperty } from '@nestjs/swagger';
import { IdNameDto, PaginationDto, PersonDto } from 'src/core/dto';
import { CrossCheckPair, Pagination } from '../cross-checks-pairs.service';

export class CrossCheckPairDto {
  constructor(pair: CrossCheckPair) {
    this.checker = new PersonDto(pair.checker);
    this.comment = pair.comment;
    this.task = new IdNameDto(pair.courseTask);
    this.id = pair.id;
    this.reviewedDate = pair.reviewedDate;
    this.score = pair.score;
    this.student = new PersonDto(pair.student);
    this.submittedDate = pair.submittedDate;
    this.url = pair.url;
  }

  @ApiProperty({ type: PersonDto })
  public student: PersonDto;

  @ApiProperty({ type: PersonDto })
  public checker: PersonDto;

  @ApiProperty({ type: IdNameDto })
  public task: IdNameDto;

  @ApiProperty()
  public score: number;

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public comment: string;

  @ApiProperty()
  public url: string;

  @ApiProperty()
  public reviewedDate: string;

  @ApiProperty()
  public submittedDate: string;
}

export class CrossCheckPairResponseDto {
  constructor(items: CrossCheckPair[], pagination: Pagination) {
    this.items = items.map(item => new CrossCheckPairDto(item));
    this.pagination = new PaginationDto(
      pagination.pageSize,
      pagination.current,
      pagination.total,
      pagination.totalPages,
    );
  }

  @ApiProperty({ type: [CrossCheckPairDto] })
  public items: CrossCheckPairDto[];

  @ApiProperty()
  public pagination: PaginationDto;
}
