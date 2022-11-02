import { defineStore } from 'pinia';
import type { Sloth } from '@/common/types';

const useSlothInfo = defineStore({
  id: 'slothInfo',

  state: () => ({
    slothInfo: {} as Sloth,
    tagsStr: '',
  }),

  actions: {
    setEmptySlothInfo() {
      this.slothInfo = {} as Sloth;
      this.tagsStr = '';
    },

    setSlothInfo(newSlothInfo: Sloth) {
      this.slothInfo = { ...newSlothInfo };
      this.tagsStr = newSlothInfo.tags.join(' ');
    },
  },
});

export default useSlothInfo;
