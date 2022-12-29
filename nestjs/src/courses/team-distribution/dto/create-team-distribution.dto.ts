import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
