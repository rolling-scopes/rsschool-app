import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CheckTasksDeadlineDto {
  @ApiProperty()
  @IsNumber()
  public deadlineInHours: number;
}
