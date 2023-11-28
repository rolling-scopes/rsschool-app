import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCourseDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  fullName: string;

  @IsString()
  @ApiProperty()
  alias: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

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
  @ApiPropertyOptional()
  registrationEndDate?: string;

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
  @ApiPropertyOptional()
  logo?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  disciplineId?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  minStudentsPerMentor: number;
}
