import { Discipline } from '@entities/discipline';
import { CrudDtoMapper } from '../core/crud-dto.mapper';
import { DisciplineDto, CreateDisciplineDto, UpdateDisciplineDto } from './dto';

export class DisciplineMapper extends CrudDtoMapper<DisciplineDto, Discipline> {
  public convertToDto(discipline: Discipline): DisciplineDto {
    return discipline;
  }

  public convertToEntity(discipline: CreateDisciplineDto | UpdateDisciplineDto): Discipline {
    const entity = new Discipline();
    entity.name = discipline.name;
    return entity;
  }
}
