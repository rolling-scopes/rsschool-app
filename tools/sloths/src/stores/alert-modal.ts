import { defineStore } from 'pinia';

const useAlertModal = defineStore({
  id: 'alertModal',

  state: () => ({
    isAlert: false,
    header: '',
    message: '',
  }),

  actions: {
    showAlertModal(header: string, message: string) {
      this.isAlert = true;
      this.header = header;
      this.message = message;
    },
  },
});

export default useAlertModal;
