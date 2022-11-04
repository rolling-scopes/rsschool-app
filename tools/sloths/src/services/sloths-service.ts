import { PAGINATION_OPTIONS, SLOTH_SORTING } from '@/common/const';
import type { QueryStringOptions, Sloth } from '@/common/types';

export class SlothsService {
  constructor(private data: Sloth[]) {}

  public async getAll({
    page = 1,
    limit = PAGINATION_OPTIONS[0],
    order = SLOTH_SORTING[0].value,
    searchText,
    filter,
  }: QueryStringOptions) {
    let items = this.data;
    const [orderField, orderDirection] = order.split('-', 2);
    const orderMultiplier = orderDirection === 'asc' ? 1 : -1;

    items.sort((a: Sloth, b: Sloth) => {
      if (Number.isNaN(+a[orderField])) {
        if (a[orderField] === b[orderField]) return 0;
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

    const start = (page - 1) * limit;
    const end = start + limit;
    items = items.slice(start, end);

    return { data: { items, count }, status: 200 };
  }

  public getById(id: string) {
    return this.data.find((sloth) => id === sloth.id);
  }

  public getTags() {
    const allTags = this.data.flatMap((sloth) => sloth.tags);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.sort();
  }
}

export default SlothsService;
