import { defineStore } from 'pinia';

const useCleanedStore = defineStore({
  id: 'cleaned',
  state: () => ({
    cleanedFilelist: [] as string[],
  }),
});

export default useCleanedStore;
