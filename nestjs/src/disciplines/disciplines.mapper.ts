import { Discipline } from '@entities/discipline';
import { CrudDtoMapper } from '../core/crud-dto.mapper';
import { DisciplineDto, UpsertDisciplineDto } from './dto';

export class DisciplineMapper extends CrudDtoMapper<DisciplineDto, Discipline> {
  public convertToDto(discipline: Discipline): DisciplineDto {
    return discipline;
  }

  public convertToEntity(discipline: UpsertDisciplineDto): Discipline {
    const entity = new Discipline();
    entity.name = discipline.name;
    return entity;
  }
}
