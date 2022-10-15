import isEven from '@/utils/game-utils';
import type { GameResult } from '@/common/types';

const sortMixins = {
  methods: {
    sortElems(a: number, b: number, direct: number): number {
      if (isEven(direct)) {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
      } else {
        if (a < b) {
          return 1;
        }
        if (a > b) {
          return -1;
        }
      }
      return 0;
    },

    sortTypes(sorting: number, item: GameResult): number {
      if (sorting < 2) {
        return item.count;
      }
      if (sorting < 4) {
        return item.time;
      }
      return item.createdAt;
    },
  },
};

export default sortMixins;
