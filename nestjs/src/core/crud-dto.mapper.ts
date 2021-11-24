export abstract class CrudDtoMapper<D, E> {
  public convertToEntity(entity: D): E {
    throw new Error('Method not implemented.');
  }

  public convertToDto(entity: E): D {
    throw new Error('Method not implemented.');
  }
}
