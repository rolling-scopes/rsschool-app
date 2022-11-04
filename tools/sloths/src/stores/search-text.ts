import { defineStore } from 'pinia';

const useSearchText = defineStore({
  id: 'searchText',

  state: () => ({
    searchText: '',
  }),

  actions: {
    getSearchText(): string {
      return this.searchText;
    },

    setSearchText(s: string) {
      this.searchText = s;
    },
  },
});

export default useSearchText;
