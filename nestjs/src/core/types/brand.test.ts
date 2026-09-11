import { brandValue, serializeBrand, type Brand } from './brand';

describe('Brand', () => {
  it('should preserve the primitive value through construction and serialization', () => {
    const value = brandValue<number, 'ExampleId'>(42);

    expect(serializeBrand(value)).toBe(42);
    expectTypeOf(value).toEqualTypeOf<Brand<number, 'ExampleId'>>();
  });
});
