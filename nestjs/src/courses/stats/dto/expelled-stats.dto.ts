import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ExpelledCourseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  alias: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  logo: string;
}

class ExpelledUserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  githubId: string;
}

export class ExpelledStatsDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => ExpelledCourseDto })
  course: ExpelledCourseDto;

  @ApiProperty({ type: () => ExpelledUserDto })
  user: ExpelledUserDto;

  @ApiPropertyOptional({ type: [String] })
  reasonForLeaving?: string[];

  @ApiProperty()
  otherComment: string;

  @ApiProperty({ format: 'date-time' })
  submittedAt: string;
}
