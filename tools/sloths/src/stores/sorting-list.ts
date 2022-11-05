import { defineStore } from 'pinia';

const useSortingList = defineStore({
  id: 'sortingList',

  state: () => ({
    sortingList: '',
  }),

  actions: {
    getSortingList(): string {
      return this.sortingList;
    },

    setSortingList(s: string) {
      this.sortingList = s;
    },
  },
});

export default useSortingList;
