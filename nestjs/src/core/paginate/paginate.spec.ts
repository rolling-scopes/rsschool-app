import { SelectQueryBuilder } from 'typeorm';
import { paginate } from './index';

type QbMock = {
  take: ReturnType<typeof vi.fn>;
  skip: ReturnType<typeof vi.fn>;
  getManyAndCount: ReturnType<typeof vi.fn>;
};

const createQueryBuilder = (items: unknown[], total: number): QbMock => {
  const qb = {
    take: vi.fn(),
    skip: vi.fn(),
    getManyAndCount: vi.fn().mockResolvedValue([items, total]),
  };
  qb.take.mockReturnValue(qb);
  qb.skip.mockReturnValue(qb);
  return qb;
};

describe('paginate', () => {
  it('applies limit and zero offset for the first page', async () => {
    const qb = createQueryBuilder([{ id: 1 }, { id: 2 }], 2);

    const result = await paginate(qb as unknown as SelectQueryBuilder<{ id: number }>, { page: 1, limit: 10 });

    expect(qb.take).toHaveBeenCalledWith(10);
    expect(qb.skip).toHaveBeenCalledWith(0);
    expect(result.items).toHaveLength(2);
    expect(result.meta).toEqual({ itemCount: 2, total: 2, current: 1, pageSize: 10, totalPages: 1 });
  });

  it('computes a non-zero offset for later pages and ceils totalPages', async () => {
    const qb = createQueryBuilder([{ id: 11 }], 21);

    const result = await paginate(qb as unknown as SelectQueryBuilder<{ id: number }>, { page: 3, limit: 10 });

    expect(qb.skip).toHaveBeenCalledWith(20);
    expect(result.meta.totalPages).toBe(3); // ceil(21 / 10)
    expect(result.meta.current).toBe(3);
  });

  it('clamps the offset to 0 for non-positive page numbers', async () => {
    const qb = createQueryBuilder([], 0);

    await paginate(qb as unknown as SelectQueryBuilder<{ id: number }>, { page: 0, limit: 10 });

    expect(qb.skip).toHaveBeenCalledWith(0); // Math.max((0 - 1) * 10, 0)
  });

  it('reports an empty result set', async () => {
    const qb = createQueryBuilder([], 0);

    const result = await paginate(qb as unknown as SelectQueryBuilder<{ id: number }>, { page: 1, limit: 25 });

    expect(result.items).toEqual([]);
    expect(result.meta).toEqual({ itemCount: 0, total: 0, current: 1, pageSize: 25, totalPages: 0 });
  });
});
