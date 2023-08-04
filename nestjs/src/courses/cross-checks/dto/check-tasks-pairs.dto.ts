import { ApiProperty } from '@nestjs/swagger';
import { IdNameDto, PaginationDto, PersonDto } from 'src/core/dto';
import { CrossCheckPair, Pagination } from '../course-cross-checks.service';
import {
  CrossCheckMessage,
  CrossCheckMessageAuthor,
  CrossCheckMessageAuthorRole,
  ScoreRecord,
} from '@entities/taskSolutionResult';

export class CrossCheckCriteriaDataDto {
  @ApiProperty()
  public key: number;

  @ApiProperty({ required: false })
  public max?: number;

  @ApiProperty()
  public text: string;

  @ApiProperty()
  public type: string;

  @ApiProperty({ required: false })
  public point?: number;

  @ApiProperty({ required: false })
  public comment?: string;
}

export class HistoricalScoreDto {
  constructor(historicalScore: ScoreRecord) {
    this.comment = historicalScore.comment;
    this.dateTime = new Date(historicalScore.dateTime);
    this.criteria = historicalScore.criteria;
  }

  @ApiProperty()
  public comment: string;

  @ApiProperty()
  public dateTime: Date;

  @ApiProperty({ type: [CrossCheckCriteriaDataDto], required: false })
  public criteria?: CrossCheckCriteriaDataDto[];
}

export class CrossCheckMessageAuthorDto {
  constructor(crossCheckMessageAuthor: CrossCheckMessageAuthor) {
    this.githubId = crossCheckMessageAuthor.githubId;
    this.id = crossCheckMessageAuthor.id;
  }

  @ApiProperty()
  public githubId: string;

  @ApiProperty()
  public id: number;
}

export class CrossCheckMessageDto {
  constructor(crossCheckMessage: CrossCheckMessage) {
    this.content = crossCheckMessage.content;
    this.author = crossCheckMessage.author ? new CrossCheckMessageAuthorDto(crossCheckMessage.author) : null;
    this.timestamp = crossCheckMessage.timestamp;
    this.isReviewerRead = crossCheckMessage.isReviewerRead;
    this.isStudentRead = crossCheckMessage.isStudentRead;
    this.role = crossCheckMessage.role;
  }

  @ApiProperty({ type: CrossCheckMessageAuthorDto, nullable: true })
  public author: CrossCheckMessageAuthorDto | null;

  @ApiProperty()
  public content: string;

  @ApiProperty()
  public timestamp: string;

  @ApiProperty()
  public isReviewerRead: boolean;

  @ApiProperty()
  public isStudentRead: boolean;

  @ApiProperty({ enum: CrossCheckMessageAuthorRole })
  public role: CrossCheckMessageAuthorRole;
}

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
    this.historicalScores = pair.historicalScores?.map(historicalScore => new HistoricalScoreDto(historicalScore));
    this.messages = pair.messages?.map(message => new CrossCheckMessageDto(message));
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

  @ApiProperty({ type: [HistoricalScoreDto] })
  public historicalScores?: HistoricalScoreDto[];

  @ApiProperty({ type: [CrossCheckMessageDto] })
  public messages?: CrossCheckMessageDto[];
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
