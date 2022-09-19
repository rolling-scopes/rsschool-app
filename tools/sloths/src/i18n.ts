import { createI18n } from 'vue-i18n';
import en from './assets/locales/en.json';
import ru from './assets/locales/ru.json';

const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'en',
  messages: {
    ru,
    en,
  },
  globalInjection: true,
});

export default i18n;
