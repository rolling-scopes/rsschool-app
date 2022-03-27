import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PersonDto {
  constructor(person: { firstName?: string; lastName?: string; id: number }) {
    this.id = person?.id;
    this.name = [person?.firstName || '', person?.lastName || ''].join(' ').trim() || '(Empty)';
  }

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  id: number;

  public static getQueryFields(base = '') {
    const prefix = base ? `${base}.` : '';
    return ['id', 'firstName', 'lastName'].map(i => `${prefix}${i}`);
  }
}
