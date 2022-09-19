import { defineStore } from 'pinia';
import type { User } from '@/common/types';
import { Role } from '@/common/enums/user-role';

const newUser = {} as User;
newUser.role = Role.user;

const useUserInfo = defineStore({
  id: 'userInfo',

  state: () => ({
    userInfo: newUser,
  }),

  actions: {
    setEmptyUserInfo() {
      this.userInfo = newUser;
    },

    setUserInfo(newUserInfo: User) {
      this.userInfo = { ...newUserInfo };
    },
  },
});

export default useUserInfo;
