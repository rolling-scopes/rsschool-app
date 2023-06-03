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

  @IsString()
  @IsOptional()
  @ApiProperty()
  public descriptionUrl: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(2)
  @ApiProperty()
  public minTeamSize: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  public maxTeamSize: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(2)
  @ApiProperty()
  public strictTeamSize: number;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  public strictTeamSizeMode: boolean;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  public minTotalScore: number;
}
