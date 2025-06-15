import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCourseDto {
  @IsString()
  @ApiPropertyOptional()
  name?: string;

  @IsString()
  @ApiPropertyOptional()
  fullName?: string;

  @IsString()
  @ApiPropertyOptional()
  alias?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  descriptionUrl?: string;

  @ApiPropertyOptional()
  year?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: 'string', nullable: true })
  registrationEndDate?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  locationName?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  discordServerId?: number;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  completed?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  planned?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  inviteOnly?: boolean;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  certificateIssuer?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  usePrivateRepositories?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  personalMentoring?: boolean;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: 'string', nullable: true })
  personalMentoringStartDate?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ type: 'string', nullable: true })
  personalMentoringEndDate?: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  logo?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  disciplineId?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  minStudentsPerMentor?: number;

  @IsNumber()
  @ApiProperty({ required: true })
  certificateThreshold: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ nullable: true, type: 'string' })
  wearecommunityUrl?: string | null;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({ nullable: true, type: [String] })
  certificateDisciplines?: string[] | null;
}
