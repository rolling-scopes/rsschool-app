<template>
  <div class="theme-switcher">
    <input
      class="theme-switcher__input"
      type="radio"
      v-for="(theme, i) in themes"
      :key="`theme-${i}`"
      :value="theme"
      v-model="currTheme"
      :name="theme"
      :id="`${theme}-theme`"
    />

    <label
      class="theme-switcher__label"
      :for="`${themeStatus}-theme`"
      :class="`theme-switcher__label_${themeStatus}`"
      :title="$t('header.switchers.theme')"
      v-shortkey="['ctrl', '2']"
      @shortkey="setTheme(`${themeStatus}`)"
    ></label>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapWritableState } from 'pinia';

import useThemeProp from '../../stores/theme';
import getUserTheme from '../../utils/userTheme';

export default defineComponent({
  name: 'ThemeSwitcher',

  data(): { themes: string[] } {
    return {
      themes: ['light', 'dark'],
    };
  },

  computed: {
    ...mapWritableState(useThemeProp, ['currTheme']),
    themeStatus(): string {
      return this.themes.filter((theme) => theme !== this.currTheme)[0];
    },
  },

  mounted() {
    this.currTheme = this.getLastTheme() || getUserTheme();
  },

  watch: {
    currTheme(newTheme) {
      this.setTheme(newTheme);
    },
  },

  methods: {
    getLastTheme(): string | null {
      return localStorage.getItem('rs-sloths-theme');
    },

    setTheme(theme: string): void {
      localStorage.setItem('rs-sloths-theme', theme);
      this.currTheme = theme;
      document.documentElement.className = theme;
    },
  },
});
</script>

<style scoped>
.theme-switcher__input {
  display: none;
}

.theme-switcher__label {
  display: block;
  width: 2rem;
  height: 3rem;
  transition: 0.5s ease;
  cursor: pointer;
}

.theme-switcher__label_light {
  background: center center / cover url('@/assets/icons/themes/light.svg') no-repeat;
}

.theme-switcher__label_dark {
  background: center center / cover url('@/assets/icons/themes/dark.svg') no-repeat;
}

.theme-switcher__label:hover {
  transform: scale(1.1) rotate(-5deg);
}
</style>
