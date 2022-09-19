import { PAGINATION_OPTIONS } from '@/common/const';
import { defineStore } from 'pinia';

const usePagination = defineStore({
  id: 'pagination',

  state: () => ({
    perPage: PAGINATION_OPTIONS[0],
    currPage: 1,
  }),

  actions: {
    getPerPage(): number {
      return this.perPage;
    },

    setPerPage(n: number) {
      this.perPage = +n;
    },

    getCurrPage(): number {
      return this.currPage;
    },

    setCurrPage(n: number) {
      this.currPage = +n;
    },
  },
});

export default usePagination;
