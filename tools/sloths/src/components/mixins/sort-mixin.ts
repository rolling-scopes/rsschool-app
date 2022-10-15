import isEven from '@/utils/game-utils';

export const sortMixins = {
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
  }
}