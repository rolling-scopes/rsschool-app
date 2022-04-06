import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CreateActivityDto {
  @ApiProperty()
  @IsBoolean()
  public isActive: boolean;
}
