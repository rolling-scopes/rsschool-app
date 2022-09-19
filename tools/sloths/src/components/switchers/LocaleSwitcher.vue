<template>
  <div class="switcher">
    <input
      class="switcher__input"
      type="radio"
      v-for="(locale, i) in locales"
      :key="`locale-${i}`"
      :value="locale"
      v-model="currLocale"
      :name="locale"
      :id="`locale-${locale}`"
    />

    <label
      class="switcher__label"
      :for="`locale-${checkLocale}`"
      :class="`switcher__label_${checkLocale}`"
      :title="$t('modal.header.switchers.locale')"
      v-shortkey="['ctrl', '2']"
      @shortkey="setLocaleValue(`${checkLocale}`)"
    ></label>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LocaleSwitcher',

  data(): { currLocale: string; locales: string[] } {
    return {
      currLocale: '',
      locales: ['ru', 'en'],
    };
  },

  computed: {
    checkLocale(): string {
      return this.locales.filter((item) => item !== this.$i18n.locale)[0];
    },
  },

  mounted() {
    this.currLocale = this.getLocaleValue();
  },

  watch: {
    currLocale(newLocale: string) {
      this.setLocaleValue(newLocale);
    },
  },

  methods: {
    getLocaleValue(): string {
      return localStorage.getItem('rs-sloths-locale') || this.getUserLocale();
    },

    getUserLocale(): string {
      const userLocale = navigator.language.split('-')[0];
      return this.locales.includes(userLocale) ? userLocale : 'en';
    },

    setLocaleValue(locale: string): void {
      localStorage.setItem('rs-sloths-locale', locale);
      this.$i18n.locale = locale;
    },
  },
});
</script>

<style scoped>
.switcher__input {
  display: none;
}

.switcher__label {
  display: block;
  width: 3rem;
  height: 3rem;
  cursor: pointer;
  transition: 0.5s ease;
}

.switcher__label_en {
  background: center center / cover url('@/assets/icons/locales/en.svg') no-repeat;
}

.switcher__label_ru {
  background: center center / cover url('@/assets/icons/locales/ru.svg') no-repeat;
}

.switcher__label:hover {
  transform: scale(1.1) rotate(5deg);
}
</style>
