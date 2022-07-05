import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PersonDto {
  constructor(person: { firstName?: string; lastName?: string; githubId?: string; id: number }) {
    this.id = person?.id;
    this.name = PersonDto.getName(person);
    this.githubId = person?.githubId || '';
  }

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  githubId: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  id: number;

  public static getQueryFields(base = '') {
    const prefix = base ? `${base}.` : '';
    return ['id', 'firstName', 'lastName', 'githubId'].map(i => `${prefix}${i}`);
  }

  public static getName(person: { firstName?: string; lastName?: string }) {
    return [person?.firstName || '', person?.lastName || ''].join(' ').trim() || '(Empty)';
  }
}
