import { defineStore } from 'pinia';

const useThemeProp = defineStore({
  id: 'theme',
  state: () => ({
    currTheme: '',
  }),
});

export default useThemeProp;
