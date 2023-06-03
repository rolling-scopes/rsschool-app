import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

export class ActivityDto {
  @ApiProperty()
  @IsNumber()
  public lastActivityTime: number;

  @ApiProperty()
  @IsBoolean()
  public isActive: boolean;
}
