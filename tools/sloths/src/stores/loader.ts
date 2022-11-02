import { defineStore } from 'pinia';

const useLoader = defineStore({
  id: 'loader',
  state: () => ({
    isLoad: false,
  }),
});

export default useLoader;
