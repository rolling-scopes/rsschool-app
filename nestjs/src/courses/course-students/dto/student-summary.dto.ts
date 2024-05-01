import { ApiProperty } from '@nestjs/swagger';
import { Mentor, MentorStudentSummaryDto } from './mentor-student-summary.dto';
import { ResultDto } from './result.dto';

export interface StudentSummary {
  totalScore?: number;
  results?: Array<ResultDto>;
  isActive: boolean;
  mentor: Mentor | null;
  rank?: number;
  repository: string | null;
}

export class StudentSummaryDto {
  constructor(studentSummary: StudentSummary) {
    this.totalScore = studentSummary.totalScore ?? 0;
    this.results = studentSummary.results ?? [];
    this.isActive = studentSummary.isActive;
    this.mentor = studentSummary.mentor;
    this.rank = studentSummary.rank ?? 999999;
    this.repository = studentSummary.repository;
  }

  @ApiProperty()
  totalScore: number;

  @ApiProperty({ type: ResultDto, isArray: true })
  results: Array<ResultDto>;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: MentorStudentSummaryDto, nullable: true })
  mentor: MentorStudentSummaryDto | null;

  @ApiProperty({ type: Number })
  rank: number;

  @ApiProperty({ type: String, nullable: true })
  repository: string | null;
}
