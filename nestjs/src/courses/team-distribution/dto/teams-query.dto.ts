import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TeamsQueryDto {
  @ApiProperty()
  @IsString()
  public current: string;

  @ApiProperty()
  @IsString()
  public pageSize: string;
}
