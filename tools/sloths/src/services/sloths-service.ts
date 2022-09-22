import type { MetadataSloths, QueryStringOptions, Sloth } from '@/common/types';
import { errorHandler } from './error-handling/error-handler';
import { apiRequest } from './api-request';
import { STICKERS_JSON_URL } from '../common/const';

export class SlothsService {
  private data!: Sloth[];

  public async getJsonData() {
    try {
      const response = await apiRequest<MetadataSloths>(STICKERS_JSON_URL, { mode: 'no-cors' });
      this.data = response?.data?.stickers.map((sloth) => ({
        ...sloth,
        checked: false,
      }));
    } catch (error) {
      errorHandler(error);
    }
  }

  public async getAll({ page = '1', limit = '10', order = 'name-asc', searchText, filter }: QueryStringOptions) {
    let items = this.data;
    const [orderField, orderDirection] = order.split('-', 2);
    const orderMultiplier = orderDirection === 'asc' ? 1 : -1;

    items.sort((a: Sloth, b: Sloth) => {
      if (Number.isNaN(+a[orderField])) {
        if (a[orderField] === b[orderField]) {
          return 0;
        }
        return a[orderField] < b[orderField] ? -1 * orderMultiplier : 1 * orderMultiplier;
      }
      return (+a[orderField] - +b[orderField]) * orderMultiplier;
    });

    if (filter) {
      const filterTags = filter.split(',');
      items = items.filter((sloth) => {
        return sloth.tags.some((tag) => filterTags.includes(tag));
      });
    }
    if (searchText) {
      items = items.filter(
        (sloth) =>
          sloth.name.toLowerCase().includes(searchText.toLowerCase()) ||
          sloth.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    const count = items.length;

    const start = (+page - 1) * +limit;
    const end = +start + +limit;
    items = items.slice(start, end);

    return { data: { items, count }, status: 200 };
  }

  public getById(id: string) {
    return this.data.find((sloth) => id === sloth.id);
  }

  public getTags() {
    return [...new Set(this.data.flatMap((sloth) => sloth.tags))].sort();
  }
}

export default SlothsService;
