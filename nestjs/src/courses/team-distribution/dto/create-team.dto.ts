import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
}