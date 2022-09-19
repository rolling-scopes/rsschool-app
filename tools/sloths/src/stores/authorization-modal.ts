import { defineStore } from 'pinia';

const useAuthorizationModal = defineStore({
  id: 'authorizationModal',

  state: () => ({
    isAuthorization: false,
  }),

  actions: {
    showAuthorizationModal() {
      this.isAuthorization = true;
    },
  },
});

export default useAuthorizationModal;
