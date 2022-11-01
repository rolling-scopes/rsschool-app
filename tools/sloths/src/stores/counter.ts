import { defineStore } from 'pinia';

const useCounterStore = defineStore({
  id: 'counter',
  state: () => ({
    counter: 0,
  }),
  getters: {
    doubleCount: (state) => state.counter * 2,
  },
  actions: {
    increment() {
      this.counter += 1;
    },
  },
});

export default useCounterStore;
