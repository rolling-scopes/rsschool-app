import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class StudentsWithoutTeamQueryDto {
  @ApiProperty()
  @IsNumberString()
  public current: string;

  @ApiProperty()
  @IsNumberString()
  public pageSize: string;
}
