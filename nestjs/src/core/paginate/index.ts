import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export interface PaginationMeta {
  /**
   * the amount of items on this specific page
   */
  itemCount: number;
  /**
   * the total amount of items
   */
  total: number;
  /**
   * the amount of items that were requested per page
   */
  pageSize: number;
  /**
   * the total amount of pages in this paginator
   */
  totalPages: number;
  /**
   * the current page this paginator "points" to
   */
  current: number;
}

export async function paginate<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  { page, limit }: { page: number; limit: number },
): Promise<{ items: T[]; meta: PaginationMeta }> {
  const queryBuilderWithLimit = queryBuilder.take(limit).skip(Math.max((page - 1) * limit, 0));

  const [items, total] = await queryBuilderWithLimit.getManyAndCount();
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    meta: { itemCount: items.length, total: total, current: page, pageSize: limit, totalPages },
  };
}
