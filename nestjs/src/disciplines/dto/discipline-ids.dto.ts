import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class DisciplineIdsDto {
  @ApiProperty({
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];
}
