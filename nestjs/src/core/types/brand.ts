declare const brand: unique symbol;

export type Brand<Value, Name extends string> = Value & {
  readonly [brand]: Name;
};

export const brandValue = <Value, Name extends string>(value: Value): Brand<Value, Name> => value as Brand<Value, Name>;

export const serializeBrand = <Value>(value: Value): Value => value;
