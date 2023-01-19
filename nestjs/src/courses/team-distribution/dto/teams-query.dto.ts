import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class TeamsQueryDto {
  @ApiProperty()
  @IsNumberString()
  public current: string;

  @ApiProperty()
  @IsNumberString()
  public pageSize: string;
}
