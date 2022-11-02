import { defineStore } from 'pinia';
import type { Sloth } from '../common/types';

const useSlothsStore = defineStore({
  id: 'sloths',
  state: () => ({
    sloths: [] as Sloth[],
  }),
});

export default useSlothsStore;
