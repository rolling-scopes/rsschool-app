import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class JoinTeamDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public password: string;
}
