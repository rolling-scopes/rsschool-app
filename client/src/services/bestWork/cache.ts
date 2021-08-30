export interface ICache<KeyType extends string | number, ValueType> {
  get: (field: KeyType) => ValueType;
  set: (field: KeyType, data: ValueType) => void;
  delete: (field: KeyType) => void;
}

export class Cache<KeyType extends string | number, ValueType> {
  private readonly cache: Record<KeyType, ValueType>;

  constructor() {
    this.cache = {} as Record<KeyType, ValueType>;
  }

  get(field: KeyType): ValueType {
    return this.cache[field];
  }

  set(field: KeyType, data: ValueType): void {
    this.cache[field] = data;
  }

  delete(field: KeyType): void {
    delete this.cache[field];
  }
}
