import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public chatLink: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  public teamDistributionId: number;
}
