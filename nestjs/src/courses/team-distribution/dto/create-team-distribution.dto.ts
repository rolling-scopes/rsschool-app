import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTeamDistributionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public name: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  public startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  public endDate: Date;

  @IsString()
  @IsOptional()
  @ApiProperty()
  public description: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(2)
  @ApiProperty()
  public minStudents: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  public maxStudents: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(2)
  @ApiProperty()
  public studentsCount: number;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  public strictStudentsCount: boolean;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  public minTotalScore: number;
}
