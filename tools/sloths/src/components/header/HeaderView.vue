<template>
  <header class="header" :class="$route.name !== 'home' ? '' : 'header_home'">
    <router-link class="header__title" v-show="$route.name !== 'home'" to="/">RS SLOTHS</router-link>
    <h2 v-show="$route.name !== 'home'" class="section__title">{{ $route.name ? $t(`${currRoute}.title`) : '' }}</h2>
    <div class="header__tools">
      <sound-switcher />
      <locale-switcher />
      <theme-switcher />
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LocaleSwitcher from '../switchers/LocaleSwitcher.vue';
import ThemeSwitcher from '../switchers/ThemeSwitcher.vue';
import SoundSwitcher from '../switchers/SoundSwitcher.vue';

export default defineComponent({
  name: 'HeaderView',

  components: { LocaleSwitcher, ThemeSwitcher, SoundSwitcher },

  computed: {
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

.section__title {
  font-weight: 100;
  text-transform: uppercase;
  color: var(--color-text);
  user-select: none;
  cursor: default;
  transition: 0.5s ease;
}
</style>
