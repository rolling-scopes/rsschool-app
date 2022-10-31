import { defineStore } from 'pinia';

const useCleanedStore = defineStore({
  id: 'cleaned',
  state: () => ({
    cleanedFilelist: [] as string[],
    originalFilelist: [] as string[],
  }),
});

export default useCleanedStore;
