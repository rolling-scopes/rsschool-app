import { User } from '@entities/index';
import { TaskSolution } from '@entities/taskSolution';
import { CrossCheckMessageAuthorRole, TaskSolutionResult } from '@entities/taskSolutionResult';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PersonDto } from 'src/core/dto';
import { Discord } from 'src/profile/dto';

class CrossCheckReviewAuthor {
  constructor(user: User) {
    this.id = user.id;
    this.name = PersonDto.getName(user);
    this.githubId = user.githubId;
    this.discord = user.discord;
  }

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public name: string;

  @ApiProperty()
  public githubId: string;

  @ApiProperty({ type: Discord, nullable: true })
  public discord: Discord | null;
}

class CrossCheckMessageAuthor {
  @ApiProperty()
  @IsNotEmpty()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  githubId: string;
}

class CrossCheckMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  timestamp: string;

  @ApiProperty()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ type: CrossCheckMessageAuthor, nullable: true })
  author: CrossCheckMessageAuthor | null;

  @ApiProperty({ enum: CrossCheckMessageAuthorRole })
  @IsNotEmpty()
  role: CrossCheckMessageAuthorRole;

  @ApiProperty()
  @IsNotEmpty()
  isReviewerRead: boolean;

  @ApiProperty()
  @IsNotEmpty()
  isStudentRead: boolean;
}

class CrossCheckCriteriaData {
  @ApiProperty()
  key: number;

  @ApiProperty()
  max?: number;

  @ApiProperty()
  text?: string;

  @ApiProperty()
  type?: string;

  @ApiProperty()
  point?: number;

  @ApiProperty()
  comment?: string;
}

class CrossCheckReviewDto {
  constructor(taskSolutionResult: TaskSolutionResult) {
    this.author = !taskSolutionResult.anonymous ? new CrossCheckReviewAuthor(taskSolutionResult.checker.user) : null;
    this.messages = !taskSolutionResult.anonymous
      ? taskSolutionResult.messages
      : taskSolutionResult.messages.map(message => ({
          ...message,
          author: message.role === CrossCheckMessageAuthorRole.Reviewer ? null : message.author,
        }));
    this.id = taskSolutionResult.id;
    this.comment = taskSolutionResult.comment;
    this.score = taskSolutionResult.score;
    this.dateTime = taskSolutionResult.historicalScores.sort((a, b) => b.dateTime - a.dateTime).at(0)?.dateTime;
    this.criteria = taskSolutionResult.historicalScores.sort((a, b) => b.dateTime - a.dateTime).at(0)?.criteria;
  }

  @ApiProperty({ type: CrossCheckReviewAuthor })
  public author: CrossCheckReviewAuthor | null;

  @ApiProperty({ type: [CrossCheckMessageDto] })
  public messages: CrossCheckMessageDto[];

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public comment?: string;

  @ApiProperty()
  public score: number;

  @ApiProperty()
  public dateTime?: number;

  @ApiProperty({ type: [CrossCheckCriteriaData] })
  public criteria?: CrossCheckCriteriaData[];
}

export class TaskSolutionFeedbackDto {
  constructor(taskSolutionResults: TaskSolutionResult[], taskSolution: TaskSolution | null) {
    this.url = taskSolution?.url;
    this.reviews = taskSolutionResults.map(taskSolutionResult => new CrossCheckReviewDto(taskSolutionResult));
  }

  @ApiProperty()
  public url?: string;

  @ApiProperty({ type: [CrossCheckReviewDto] })
  public reviews: CrossCheckReviewDto[];
}
