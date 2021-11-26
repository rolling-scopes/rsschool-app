import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpsertDisciplineDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;
}
