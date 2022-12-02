import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CriteriaDto } from './criteria.dto';

export class TaskCriteriaDto {
  @IsNotEmpty()
  @IsArray()
  @ApiProperty({ type: [CriteriaDto] })
  criteria: CriteriaDto[];
}
