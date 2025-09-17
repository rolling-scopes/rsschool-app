import { paginate } from './index';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

const createMockQueryBuilder = (items: ObjectLiteral[], total: number) => {
  const mockQueryBuilder = {
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([items, total]),
  } as unknown as SelectQueryBuilder<ObjectLiteral>;

  return mockQueryBuilder;
};

describe('paginate', () => {
  describe('basic functionality', () => {
    it('should return paginated results with correct meta data', async () => {
      const mockItems = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const mockTotal = 10;
      const queryBuilder = createMockQueryBuilder(mockItems, mockTotal);

      const result = await paginate(queryBuilder, { page: 1, limit: 3 });

      expect(result.items).toEqual(mockItems);
      expect(result.meta).toEqual({
        itemCount: 3,
        total: 10,
        current: 1,
        pageSize: 3,
        totalPages: 4,
      });

      expect(queryBuilder.take).toHaveBeenCalledWith(3);
      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    });

    it('should calculate correct skip value for page 2', async () => {
      const mockItems = [{ id: 4 }, { id: 5 }];
      const mockTotal = 10;
      const queryBuilder = createMockQueryBuilder(mockItems, mockTotal);

      await paginate(queryBuilder, { page: 2, limit: 3 });

      expect(queryBuilder.skip).toHaveBeenCalledWith(3);
    });

    it('should calculate correct skip value for page 3', async () => {
      const mockItems = [{ id: 7 }];
      const mockTotal = 10;
      const queryBuilder = createMockQueryBuilder(mockItems, mockTotal);

      await paginate(queryBuilder, { page: 3, limit: 3 });

      expect(queryBuilder.skip).toHaveBeenCalledWith(6);
    });
  });

  describe('edge cases', () => {
    it('should handle page 0 by treating it as page 1', async () => {
      const mockItems = [{ id: 1 }];
      const mockTotal = 5;
      const queryBuilder = createMockQueryBuilder(mockItems, mockTotal);

      const result = await paginate(queryBuilder, { page: 0, limit: 2 });

      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
      expect(result.meta.current).toBe(0);
    });

    it('should handle negative page numbers', async () => {
      const mockItems = [{ id: 1 }];
      const mockTotal = 5;
      const queryBuilder = createMockQueryBuilder(mockItems, mockTotal);

      await paginate(queryBuilder, { page: -1, limit: 2 });

      expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    });

    it('should handle empty results', async () => {
      const mockItems: ObjectLiteral[] = [];
      const mockTotal = 0;
      const queryBuilder = createMockQueryBuilder(mockItems, mockTotal);

      const result = await paginate(queryBuilder, { page: 1, limit: 10 });

      expect(result.items).toEqual([]);
      expect(result.meta).toEqual({
        itemCount: 0,
        total: 0,
        current: 1,
        pageSize: 10,
        totalPages: 0,
      });
    });

    it('should handle limit of 1', async () => {
      const mockItems = [{ id: 1 }];
      const mockTotal = 5;
      const queryBuilder = createMockQueryBuilder(mockItems, mockTotal);

      const result = await paginate(queryBuilder, { page: 1, limit: 1 });

      expect(result.meta.totalPages).toBe(5);
      expect(result.meta.pageSize).toBe(1);
    });

    it('should handle large limit that exceeds total items', async () => {
      const mockItems = [{ id: 1 }, { id: 2 }];
      const mockTotal = 2;
      const queryBuilder = createMockQueryBuilder(mockItems, mockTotal);

      const result = await paginate(queryBuilder, { page: 1, limit: 100 });

      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.itemCount).toBe(2);
      expect(result.meta.pageSize).toBe(100);
    });
  });

  describe('meta data calculations', () => {
    it('should calculate totalPages correctly when total is divisible by limit', async () => {
      const mockItems = [{ id: 1 }, { id: 2 }];
      const mockTotal = 10;
      const queryBuilder = createMockQueryBuilder(mockItems, mockTotal);

      const result = await paginate(queryBuilder, { page: 1, limit: 5 });

      expect(result.meta.totalPages).toBe(2);
    });

    it('should calculate totalPages correctly when total is not divisible by limit', async () => {
      const mockItems = [{ id: 1 }, { id: 2 }];
      const mockTotal = 11;
      const queryBuilder = createMockQueryBuilder(mockItems, mockTotal);

      const result = await paginate(queryBuilder, { page: 1, limit: 5 });

      expect(result.meta.totalPages).toBe(3);
    });

    it('should have itemCount match actual returned items length', async () => {
      const mockItems = [{ id: 1 }, { id: 2 }];
      const mockTotal = 100;
      const queryBuilder = createMockQueryBuilder(mockItems, mockTotal);

      const result = await paginate(queryBuilder, { page: 1, limit: 10 });

      expect(result.meta.itemCount).toBe(2);
      expect(result.items.length).toBe(2);
    });

    it('should preserve current page in meta', async () => {
      const mockItems = [{ id: 4 }];
      const mockTotal = 10;
      const queryBuilder = createMockQueryBuilder(mockItems, mockTotal);

      const result = await paginate(queryBuilder, { page: 5, limit: 2 });

      expect(result.meta.current).toBe(5);
    });
  });

  describe('different data types', () => {
    it('should work with complex objects', async () => {
      const mockItems = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' },
      ];
      const mockTotal = 20;
      const queryBuilder = createMockQueryBuilder(mockItems, mockTotal);

      const result = await paginate(queryBuilder, { page: 1, limit: 2 });

      expect(result.items).toEqual(mockItems);
      expect(result.meta.itemCount).toBe(2);
      expect(result.meta.total).toBe(20);
    });

    it('should work with different object structures', async () => {
      const mockItems = [
        { value: 'item1', type: 'A' },
        { value: 'item2', type: 'B' },
        { value: 'item3', type: 'C' },
      ];
      const mockTotal = 15;
      const queryBuilder = createMockQueryBuilder(mockItems, mockTotal);

      const result = await paginate(queryBuilder, { page: 2, limit: 5 });

      expect(result.items).toEqual(mockItems);
      expect(result.meta.current).toBe(2);
    });
  });
});
