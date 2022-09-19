import { defineStore } from 'pinia';
import type { Suggestion } from '@/common/types';

const useSuggestionInfo = defineStore({
  id: 'suggestionInfo',

  state: () => ({
    suggestionInfo: {} as Suggestion,
  }),

  actions: {
    setEmptySuggestionInfo() {
      this.suggestionInfo = {} as Suggestion;
    },

    setSuggestionInfo(newSuggestionInfo: Suggestion) {
      this.suggestionInfo = { ...newSuggestionInfo };
    },
  },
});

export default useSuggestionInfo;
