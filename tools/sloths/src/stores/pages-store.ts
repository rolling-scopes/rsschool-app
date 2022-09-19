import { defineStore } from 'pinia';

const usePagesStore = defineStore({
  id: 'pagesStore',
  state: () => ({
    pageCatalog: '',
    pageSuggestion: '',
    pageUsers: '',
    pageCreate: '',
    pageMerch: '',
    pageMemory: '',
  }),

  actions: {
    getPageCatalogState(): string {
      return this.pageCatalog;
    },

    setPageCatalogState(newState: string) {
      this.pageCatalog = newState;
    },

    getPageSuggestionState(): string {
      return this.pageSuggestion;
    },

    setPageSuggestionState(newState: string) {
      this.pageSuggestion = newState;
    },

    getPageUsersState(): string {
      return this.pageUsers;
    },

    setPageUsersState(newState: string) {
      this.pageUsers = newState;
    },

    getPageCreateState(): string {
      return this.pageCreate;
    },

    setPageCreateState(newState: string) {
      this.pageCreate = newState;
    },

    getPageMerchState(): string {
      return this.pageMerch;
    },

    setPageMerchState(newState: string) {
      this.pageMerch = newState;
    },

    getPageMemoryState(): string {
      return this.pageMemory;
    },

    setPageMemoryState(newState: string) {
      this.pageMemory = newState;
    },
  },
});

export default usePagesStore;
