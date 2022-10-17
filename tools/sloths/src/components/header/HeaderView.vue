<template>
  <header class="header" :class="moreClass">
    <router-link class="header__title" v-show="!home" to="/">RS SLOTHS</router-link>
    <h2 v-show="!home" class="section__title">{{ routeTitle }}</h2>
    <div class="header__tools">
      <sound-switcher />
      <theme-switcher />
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ThemeSwitcher from '../switchers/ThemeSwitcher.vue';
import SoundSwitcher from '../switchers/SoundSwitcher.vue';

export default defineComponent({
  name: 'HeaderView',

  components: { ThemeSwitcher, SoundSwitcher },

  computed: {
    currRoute(): string {
      return String(this.$route.name);
    },
    home(): boolean {
      return this.currRoute === 'home';
    },
    moreClass(): string {
      return !this.home ? '' : 'header_home';
    },
    routeTitle(): string {
      return this.$route.name ? this.$t(`${this.currRoute}.title`) : '';
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
  z-index: 3;
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
