import { Discipline } from '@entities/discipline';
import { ApiProperty } from '@nestjs/swagger';

export class DisciplineDto {
  constructor(discipline: Discipline) {
    this.id = discipline.id;
    this.name = discipline.name;
    this.createdDate = discipline.createdDate;
    this.updatedDate = discipline.updatedDate;
  }

  @ApiProperty()
  name: string;

  @ApiProperty()
  public id: number;

  @ApiProperty()
  public createdDate: string;

  @ApiProperty()
  public updatedDate: string;
}
