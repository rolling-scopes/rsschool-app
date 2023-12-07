import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  startDate: string;

  @IsString()
  @ApiProperty()
  endDate: string;

  @IsString()
  @ApiProperty()
  fullName: string;

  @IsString()
  @ApiProperty()
  alias: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  registrationEndDate?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  completed?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  planned?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  inviteOnly?: boolean;

  @IsString()
  @ApiProperty()
  description: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  disciplineId?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  discordServerId?: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  usePrivateRepositories?: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  certificateIssuer?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  personalMentoring?: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  logo?: string;

  @ApiProperty({ required: false })
  minStudentsPerMentor: number;
}
