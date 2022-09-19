import { defineStore } from 'pinia';

const themeProp = defineStore({
  id: 'theme',
  state: () => ({
    currTheme: '',
  }),
});

export default themeProp;
