<template>
  <form class="user-info" ref="profileForm" :onSubmit="(e) => e.preventDefault()">
    <div class="user-info__avatar">
      <img class="user-info__img" :src="getAvatar" :alt="$t('profile.avatar')" />
    </div>
    <input
      type="text"
      class="input-text user-info__property"
      autocomplete="off"
      required
      :placeholder="$t('profile.name')"
      :title="$t('profile.name')"
      v-model="(adminPanel ? userInfo : currUser).name"
    />
    <input
      type="text"
      class="input-text user-info__property"
      autocomplete="off"
      required
      :placeholder="$t('profile.github')"
      :title="$t('profile.github')"
      v-model="(adminPanel ? userInfo : currUser).github"
    />
    <select
      v-show="isAdmin"
      name="select"
      class="user-info__select select-element"
      :title="$t('profile.role')"
      v-model="(adminPanel ? userInfo : currUser).role"
    >
      <option :value="admin">{{ admin }}</option>
      <option :value="user">{{ user }}</option>
    </select>
    <custom-btn :text="$t('btn.save')" className="btn btn-primary" :onClick="saveUser"></custom-btn>
  </form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { storeToRefs } from 'pinia';
import { DEFAULT_USER_AVATAR } from '@/common/const';
import { Role } from '@/common/enums/user-role';
import useUserInfo from '@/stores/user-info';
import useCurrUser from '@/stores/curr-user';
import CustomBtn from '@/components/buttons/CustomBtn.vue';

const { userInfo } = storeToRefs(useUserInfo());
const { currUser } = storeToRefs(useCurrUser());

export default defineComponent({
  name: 'UserInfo',

  components: {
    CustomBtn,
  },

  data() {
    return {
      currUser,
      userInfo,
      admin: Role.admin,
      user: Role.user,
    };
  },

  props: {
    adminPanel: {
      type: Boolean,
      required: true,
    },
  },

  computed: {
    getAvatar(): string {
      return this.adminPanel
        ? this.userInfo.avatar_url ?? DEFAULT_USER_AVATAR
        : this.currUser.avatar_url ?? DEFAULT_USER_AVATAR;
    },

    isAdmin() {
      return this.$route.name === 'admin';
    },
  },

  methods: {
    saveUser() {
      if (this.$refs.profileForm instanceof HTMLFormElement && this.$refs.profileForm.checkValidity()) {
        this.$emit('updUser', this.userInfo);
      }
    },
  },
});
</script>

<style scoped>
.user-info {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap);
  width: 100%;
  color: var(--color-text);
  background-color: var(--color-background-soft);
  border: 0.2rem solid gray;
  border-radius: 0.5rem;
  transition: 0.5s ease;
}

.user-info__avatar {
  display: inline-block;
  width: 25rem;
  height: 25rem;
  overflow: hidden;
  border-radius: 50%;
  border: 0.2rem solid var(--color-border-inverse);
}

.user-info__img {
  object-fit: cover;
  height: 100%;
  width: 100%;
}

.user-info__property,
.user-info__select {
  margin: 0.5rem 0;
  padding: 0.5rem 0;
  width: 90%;
  text-align: center;
  color: inherit;
  background: none;
  border: 0.2rem solid var(--color-border-theme);
  border-radius: 1rem;
  transition: 0.5s ease;
}

.user-info__property,
.user-info__property:focus {
  outline: none;
}

.user-info__property:focus {
  border-color: var(--color-border-inverse);
}
</style>
