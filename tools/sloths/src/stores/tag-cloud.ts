import { defineStore } from 'pinia';

const useSelectedTags = defineStore({
  id: 'tagCloud',

  state: () => ({
    selected: [] as string[],
  }),

  actions: {
    getSelected(): string[] {
      return [...this.selected];
    },

    setSelected(s: string[]) {
      this.selected = [...s];
    },
  },
});

export default useSelectedTags;
