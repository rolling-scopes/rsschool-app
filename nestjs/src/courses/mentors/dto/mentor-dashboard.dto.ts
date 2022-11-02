import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { StudentDto } from '../../students/dto';
import { StudentTaskSolutionItem } from '../mentors.service';

@ApiResponse({})
export class MentorDashboardDto {
  constructor(student: StudentDto, item: StudentTaskSolutionItem) {
    this.studentName = student.name;
    this.studentGithubId = student.githubId;
    this.taskName = item.taskName;
    this.taskDescriptionUrl = item.taskDescriptionUrl;
    this.courseTaskId = item.courseTaskId;
    this.maxScore = item.maxScore;
    this.resultScore = item.resultScore ?? null;
    this.solutionUrl = item.solutionUrl ?? null;
  }

  @ApiProperty()
  studentGithubId: string;

  @ApiProperty()
  studentName: string;

  @ApiProperty()
  taskName: string;

  @ApiProperty()
  taskDescriptionUrl: string;

  @ApiProperty()
  courseTaskId: number;

  @ApiProperty()
  maxScore: number;

  @ApiProperty({ nullable: true, type: Number })
  resultScore: number | null;

  @ApiProperty({ nullable: true, type: String })
  solutionUrl: string | null;
}
