import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDisciplineDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;
}
