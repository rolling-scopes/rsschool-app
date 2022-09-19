<template>
  <header class="header" :class="$route.name !== 'home' ? '' : 'header_home'">
    <router-link class="header__title" v-show="$route.name !== 'home'" to="/">RS SLOTHS</router-link>
    <h2 v-show="$route.name !== 'home'" class="section__title">{{ $route.name ? $t(`${currRoute}.title`) : '' }}</h2>
    <div class="header__tools">
      <div class="header__admin" v-show="isAdmin" @click="pushToAdmin" :title="$t('admin.title')"></div>
      <sound-switcher />
      <locale-switcher />
      <theme-switcher />
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import LocaleSwitcher from '../switchers/LocaleSwitcher.vue';
import ThemeSwitcher from '../switchers/ThemeSwitcher.vue';
import SoundSwitcher from '../switchers/SoundSwitcher.vue';

import useCurrUser from '../../stores/curr-user';

export default defineComponent({
  name: 'HeaderView',

  components: { LocaleSwitcher, ThemeSwitcher, SoundSwitcher },

  computed: {
    ...mapState(useCurrUser, ['isAdmin']),

    currRoute(): string {
      return String(this.$route.name);
    },
  },

  methods: {
    pushToAdmin() {
      this.$router.push({ name: 'admin' });
    },
  },
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3rem;
  z-index: 2;
}

.header_home {
  justify-content: flex-end;
}

.header__title {
  font-family: Arial, sans-serif;
  font-weight: 900;
  font-size: 2.4rem;
  text-decoration: none;
  color: var(--color-text);
  transition: 0.5s ease;
}

.header__title:hover {
  color: var(--color-heading);
}

.header__tools {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 2rem;
}

.header__admin {
  width: 3rem;
  height: 3rem;
  background: no-repeat center center / contain url('@/assets/icons/admin/admin.svg');
  cursor: pointer;
  transition: 0.5s ease;
}

.header__admin:hover {
  transform: scale(1.1) rotate(5deg);
}

.section__title {
  font-weight: 100;
  text-transform: uppercase;
  color: var(--color-text);
  user-select: none;
  cursor: default;
  transition: 0.5s ease;
}
</style>
