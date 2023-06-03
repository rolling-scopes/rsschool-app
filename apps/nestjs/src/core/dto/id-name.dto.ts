import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IdNameDto {
  constructor(obj: { name: string; id: number }) {
    this.id = obj.id;
    this.name = obj.name;
  }

  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty()
  id: number;
}
