import { SelectQueryBuilder } from 'typeorm';

import { paginate } from './index';

describe('paginate', () => {
  const takeSpy = jest.fn().mockReturnThis();
  const skipSpy = jest.fn().mockReturnThis();
  const getManyAndCountSpy = jest.fn().mockReturnValue([[], 0]);

  const mockRepository = jest.fn(() => ({
    createQueryBuilder: jest.fn(() => ({
      take: takeSpy,
      skip: skipSpy,
      getManyAndCount: getManyAndCountSpy,
    })),
  }));

  it('calls skip() with correct offset for first page', async () => {
    const mockQuery = mockRepository().createQueryBuilder();

    await paginate(mockQuery as unknown as SelectQueryBuilder<any>, { page: 1, limit: 10 });

    expect(skipSpy).toHaveBeenCalledWith(0);
  });

  it('calls sjip() with correct offset for 1 + n page', async () => {
    const mockQuery = mockRepository().createQueryBuilder();

    await paginate(mockQuery as unknown as SelectQueryBuilder<any>, { page: 3, limit: 10 });

    expect(skipSpy).toHaveBeenCalledWith(20);
  });

  it('calls take() with correct value', async () => {
    const mockQuery = mockRepository().createQueryBuilder();
    const limit = 10;

    await paginate(mockQuery as unknown as SelectQueryBuilder<any>, { page: 1, limit });

    expect(takeSpy).toHaveBeenCalledWith(limit);
  });

  it('returns correct items', async () => {
    const mockQuery = mockRepository().createQueryBuilder();
    const items = [1, 2, 3];
    mockQuery.getManyAndCount = jest.fn().mockReturnValue([items, 0]);

    const actual = await paginate(mockQuery as unknown as SelectQueryBuilder<any>, { page: 1, limit: 10 });

    expect(actual.items).toEqual(items);
  });

  it('returns correct item count', async () => {
    const mockQuery = mockRepository().createQueryBuilder();
    const items = [1, 2, 3];
    mockQuery.getManyAndCount = jest.fn().mockReturnValue([items, 0]);

    const actual = await paginate(mockQuery as unknown as SelectQueryBuilder<any>, { page: 1, limit: 10 });

    expect(actual.meta.itemCount).toEqual(items.length);
  });

  it('returns correct total count', async () => {
    const mockQuery = mockRepository().createQueryBuilder();
    const items = [1, 2, 3];
    const total = 121;
    mockQuery.getManyAndCount = jest.fn().mockReturnValue([items, total]);

    const actual = await paginate(mockQuery as unknown as SelectQueryBuilder<any>, { page: 1, limit: 10 });

    expect(actual.meta.total).toEqual(total);
  });

  it('returns correct current page', async () => {
    const mockQuery = mockRepository().createQueryBuilder();
    const page = 34;

    const actual = await paginate(mockQuery as unknown as SelectQueryBuilder<any>, { page, limit: 10 });

    expect(actual.meta.current).toEqual(page);
  });

  it('returns correct pageSize', async () => {
    const mockQuery = mockRepository().createQueryBuilder();
    const limit = 34;

    const actual = await paginate(mockQuery as unknown as SelectQueryBuilder<any>, { page: 1, limit });

    expect(actual.meta.pageSize).toEqual(limit);
  });

  it('returns correct total pages', async () => {
    const mockQuery = mockRepository().createQueryBuilder();
    const limit = 10;
    const items = [4, 2];
    const total = 42;
    mockQuery.getManyAndCount = jest.fn().mockReturnValue([items, total]);

    const actual = await paginate(mockQuery as unknown as SelectQueryBuilder<any>, { page: 1, limit });

    expect(actual.meta.totalPages).toEqual(5);
  });
});
