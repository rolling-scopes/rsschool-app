import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
  @ApiProperty()
  cityName: string | null;

  @IsBoolean()
  @ApiProperty()
  isGoodCandidate?: boolean;

  @IsNumber()
  @ApiProperty()
  rating?: number | null;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  totalScore: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  registeredDate: string;
}
