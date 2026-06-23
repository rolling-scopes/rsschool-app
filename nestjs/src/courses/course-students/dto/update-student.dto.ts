import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStudentDto {
  @ApiProperty({ nullable: true, type: String })
  @IsOptional()
  @IsString()
  mentorGithuId: string | null;

  // accepted for compatibility with the legacy endpoint; not persisted (same as legacy)
  @ApiProperty({ required: false, nullable: true, type: String })
  @IsOptional()
  @IsString()
  unassigningComment?: string;
}
