import { ApiProperty } from '@nestjs/swagger';
import { Mentor, MentorStudentSummaryDto } from './mentor-student-summary.dto';

export interface StudentSummary {
  totalScore?: number;
  results?: { score?: number; courseTaskId?: number }[];
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

  @ApiProperty({ type: Array<{ score?: number; courseTaskId?: number }> })
  results: { score?: number; courseTaskId?: number }[];

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: MentorStudentSummaryDto, nullable: true })
  mentor: MentorStudentSummaryDto | null;

  @ApiProperty({ type: Number })
  rank: number;

  @ApiProperty({ type: String, nullable: true })
  repository: string | null;
}
