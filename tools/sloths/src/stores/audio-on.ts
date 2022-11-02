import { defineStore } from 'pinia';

const useAudioOn = defineStore({
  id: 'audioOn',

  state: () => ({
    isAudioOn: false,
  }),
});

export default useAudioOn;
