import type { MetadataSloths, QueryStringOptions, Sloth } from '@/common/types';
import { errorHandler } from './error-handling/error-handler';
import { apiRequest } from './api-request';

const JSON_URL = import.meta.env.VITE_JSON_URL;

export class SlothsService {
  private data!: Sloth[];

  public async getJsonData() {
    try {
      const response = await apiRequest<MetadataSloths>(JSON_URL);
      this.data = response?.data?.stickers.map((sloth) => ({
        id: sloth?.name
          ?.replace(/[^ a-z0-9]gi/, '')
          .replace(/ /g, '-')
          .toLowerCase(),
        ...sloth,
        checked: false,
      }));
    } catch (error) {
      errorHandler(error);
    }
  }

  public async getAll(page = 1, limit = 10, order = '', searchText = '', filter = '') {
    let items = this.data;
    const [field, direction] = order.split('-', 2);
    const orderMultiplier = direction === 'asc' ? 1 : -1;

    items.sort((a: Sloth, b: Sloth) => {
      if (Number.isNaN(+a[field])) {
        if (a[field] > b[field]) {
          return 1 * orderMultiplier;
        }
        if (a[field] < b[field]) {
          return -1 * orderMultiplier;
        }
        return 0;
      }
      return (+a[field] - +b[field]) * orderMultiplier;
    });

    if (filter) {
      const filterTags = filter.split(',');
      items = items.filter((sloth) => {
        return sloth.tags.some((tag) => filterTags.includes(tag));
      });
    }
    if (searchText) {
      items = items.filter((sloth) => sloth.caption === searchText || sloth.description === searchText);
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
