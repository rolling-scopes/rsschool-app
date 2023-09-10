import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class AvailableStudentDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  githubId: string;

  @IsString()
  @ApiProperty({ nullable: true, type: String })
  cityName: string | null;

  @IsString()
  @ApiProperty({ nullable: true, type: String })
  countryName: string | null;

  @IsBoolean()
  @ApiProperty()
  isGoodCandidate?: boolean;

  @IsNumber()
  @ApiProperty({ nullable: true, type: String })
  rating?: number | null;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  totalScore: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  registeredDate: string;

  @IsOptional()
  @ApiProperty()
  maxScore?: number;

  @IsOptional()
  @ApiProperty()
  feedbackVersion?: number;
}
